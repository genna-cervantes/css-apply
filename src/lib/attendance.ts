import {
  AttendanceGroup,
  AttendanceMethod,
  AttendanceRosterSource,
  Prisma,
} from "@prisma/client";
import { roles as executiveBoardRoles } from "@/data/ebRoles";

const EXECUTIVE_BOARD_DESTINATIONS = new Set(
  executiveBoardRoles.flatMap((role) => [
    role.id.toLowerCase(),
    role.title.toLowerCase(),
  ]),
);

export const ATTENDANCE_GROUPS = [
  AttendanceGroup.MEMBER,
  AttendanceGroup.COMMITTEE_STAFF,
  AttendanceGroup.EXECUTIVE_ASSOCIATE,
  AttendanceGroup.IMPORTED_STUDENT,
] as const;

export const ATTENDANCE_GROUP_LABELS: Record<AttendanceGroup, string> = {
  MEMBER: "Members",
  COMMITTEE_STAFF: "Committee Staff",
  EXECUTIVE_ASSOCIATE: "Executive Associates",
  IMPORTED_STUDENT: "Imported CS students",
};

export function isAttendanceGroup(value: string): value is AttendanceGroup {
  return ATTENDANCE_GROUPS.includes(value as AttendanceGroup);
}

export function normalizeStudentNumber(value: string) {
  const normalized = value.normalize("NFKC").trim().replace(/^'/, "");
  const withoutExcelDecimal = /^\d{10}\.0$/.test(normalized)
    ? normalized.slice(0, -2)
    : normalized;
  const compact = /^[\d\s-]+$/.test(withoutExcelDecimal)
    ? withoutExcelDecimal.replace(/[\s-]/g, "")
    : withoutExcelDecimal;

  if (!/^\d{10}$/.test(compact)) {
    throw new Error("Student number must contain exactly 10 digits.");
  }
  return compact;
}

export function normalizeAttendanceName(value: string) {
  let normalized = value.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length > 200) {
    throw new Error("Name must contain between 1 and 200 characters.");
  }
  if (/\p{Cc}/u.test(normalized) || /\d/u.test(normalized)) {
    throw new Error("Name contains unsupported characters.");
  }
  if (
    normalized === normalized.toUpperCase() ||
    normalized === normalized.toLowerCase()
  ) {
    const romanSuffixes = new Set(["II", "III", "IV", "V", "VI"]);
    normalized = normalized
      .toLocaleLowerCase("en-PH")
      .replace(/(^|[\s'-])\p{L}/gu, (match) => match.toLocaleUpperCase("en-PH"))
      .split(" ")
      .map((word) =>
        romanSuffixes.has(word.toUpperCase()) ? word.toUpperCase() : word,
      )
      .join(" ");
  }
  return normalized;
}

export function normalizeAttendanceSection(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
  if (!normalized || normalized.length > 100 || /\p{Cc}/u.test(normalized)) {
    throw new Error("Section must contain between 1 and 100 valid characters.");
  }
  return normalized;
}

type ParsedCredential =
  | { method: typeof AttendanceMethod.CSS_ID_QR; memberId: string }
  | { method: typeof AttendanceMethod.UST_QR; studentNumber: string }
  | null;

export function parseAttendanceCredential(rawValue: string): ParsedCredential {
  const normalized = rawValue.trim();
  if (!normalized || normalized.length > 2048 || /\p{Cc}/u.test(normalized)) {
    throw new Error(
      "Credential must contain between 1 and 2048 valid characters.",
    );
  }

  const memberId = normalized.toUpperCase();
  if (/^CSS-\d{4}-\d{4}$/.test(memberId)) {
    return { method: AttendanceMethod.CSS_ID_QR, memberId };
  }

  const ustQr = /^(\d{10})-\d$/.exec(normalized);
  if (ustQr?.[1]) {
    return {
      method: AttendanceMethod.UST_QR,
      studentNumber: ustQr[1],
    };
  }

  return null;
}

type MaterializedRosterRow = {
  userId: string | null;
  guestId: string | null;
  studentNumber: string;
  memberId: string | null;
  fullName: string;
  section: string | null;
  source: AttendanceRosterSource;
  affiliationGroups: AttendanceGroup[];
};

function intersects(groups: AttendanceGroup[], eligible: Set<AttendanceGroup>) {
  return groups.some((group) => eligible.has(group));
}

export async function materializeAttendanceRoster(
  tx: Prisma.TransactionClient,
  eventId: string,
  recruitmentCycleId: string,
  eligibleGroups: AttendanceGroup[],
) {
  const eligible = new Set(eligibleGroups);
  const roster = new Map<string, MaterializedRosterRow>();

  if (eligible.has(AttendanceGroup.IMPORTED_STUDENT)) {
    const guests = await tx.attendanceGuest.findMany({
      where: { recruitmentCycleId, isActive: true },
      select: {
        id: true,
        studentNumber: true,
        fullName: true,
        section: true,
      },
    });
    for (const guest of guests) {
      roster.set(guest.studentNumber, {
        userId: null,
        guestId: guest.id,
        studentNumber: guest.studentNumber,
        memberId: null,
        fullName: guest.fullName,
        section: guest.section,
        source: AttendanceRosterSource.IMPORTED,
        affiliationGroups: [AttendanceGroup.IMPORTED_STUDENT],
      });
    }
  }

  const memberships = await tx.membership.findMany({
    where: {
      recruitmentCycleId,
      user: { studentNumber: { not: null } },
    },
    select: {
      memberId: true,
      user: {
        select: {
          id: true,
          name: true,
          studentNumber: true,
          section: true,
          memberApplications: {
            where: {
              recruitmentCycleId,
              hasAccepted: true,
              paymentStatus: "approved",
            },
            select: { id: true },
            take: 1,
          },
          committeeApplications: {
            where: {
              recruitmentCycleId,
              hasAccepted: true,
              paymentStatus: "approved",
              status: { in: ["passed", "redirected"] },
            },
            select: { id: true, redirection: true },
            take: 1,
          },
          executiveAssociateApplications: {
            where: {
              recruitmentCycleId,
              hasAccepted: true,
              paymentStatus: "approved",
              status: { in: ["passed", "redirected"] },
            },
            select: { id: true, redirection: true },
            take: 1,
          },
        },
      },
    },
  });

  for (const membership of memberships) {
    const studentNumber = membership.user.studentNumber;
    if (!studentNumber) continue;

    const groups: AttendanceGroup[] = [];
    if (membership.user.memberApplications.length > 0) {
      groups.push(AttendanceGroup.MEMBER);
    }
    for (const application of membership.user.committeeApplications) {
      const destination = application.redirection?.trim().toLowerCase();
      groups.push(
        destination === "member"
          ? AttendanceGroup.MEMBER
          : destination && EXECUTIVE_BOARD_DESTINATIONS.has(destination)
            ? AttendanceGroup.EXECUTIVE_ASSOCIATE
            : AttendanceGroup.COMMITTEE_STAFF,
      );
    }
    for (const application of membership.user.executiveAssociateApplications) {
      const destination = application.redirection?.trim().toLowerCase();
      groups.push(
        destination === "member"
          ? AttendanceGroup.MEMBER
          : destination?.startsWith("committee-")
            ? AttendanceGroup.COMMITTEE_STAFF
            : AttendanceGroup.EXECUTIVE_ASSOCIATE,
      );
    }
    if (!intersects(groups, eligible)) continue;

    const imported = roster.get(studentNumber);
    roster.set(studentNumber, {
      userId: membership.user.id,
      guestId: imported?.guestId ?? null,
      studentNumber,
      memberId: membership.memberId,
      fullName: membership.user.name,
      section: membership.user.section,
      source: AttendanceRosterSource.CSSAPPLY,
      affiliationGroups: [
        ...new Set([
          ...groups.filter((group) => eligible.has(group)),
          ...(imported?.affiliationGroups ?? []),
        ]),
      ],
    });
  }

  await tx.attendanceEventRoster.deleteMany({ where: { eventId } });
  if (roster.size > 0) {
    const rows = [...roster.values()];
    for (let index = 0; index < rows.length; index += 500) {
      await tx.attendanceEventRoster.createMany({
        data: rows
          .slice(index, index + 500)
          .map((row) => ({ eventId, ...row })),
      });
    }
  }
  return roster.size;
}

export function addAttendanceAudit(
  tx: Prisma.TransactionClient,
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Prisma.InputJsonValue,
) {
  return tx.attendanceAuditLog.create({
    data: { actorId, action, entityType, entityId, details },
  });
}

export function csvEscape(value: string | number | Date | null) {
  const text =
    value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}
