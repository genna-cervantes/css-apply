import { AttendanceMethod, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addAttendanceAudit,
  parseAttendanceCredential,
} from "@/lib/attendance";
import { authorizeAttendanceOperator } from "@/lib/attendance-auth";
import { prisma } from "@/lib/prisma";

const testCredentialSchema = z.object({
  eventId: z.string().min(1),
  credential: z.string().min(1).max(2048),
});

type CredentialType = "CSS_ID_QR" | "UST_QR" | "UNKNOWN";

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await authorizeAttendanceOperator();
    if (authorization.response) return authorization.response;
    const parsedBody = testCredentialSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return privateJson(
        { error: parsedBody.error.issues[0]?.message || "Invalid QR test" },
        400,
      );
    }

    const recentTests = await prisma.attendanceAuditLog.count({
      where: {
        actorId: authorization.operator.id,
        action: "ATTENDANCE_CREDENTIAL_TESTED",
        occurredAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recentTests >= 60) {
      return privateJson(
        { error: "QR testing is temporarily limited. Try again in a minute." },
        429,
      );
    }

    const event = await prisma.attendanceEvent.findUnique({
      where: { id: parsedBody.data.eventId },
      select: {
        id: true,
        title: true,
        status: true,
        recruitmentCycle: { select: { schoolYear: true } },
      },
    });
    if (!event) return privateJson({ error: "Event not found" }, 404);

    let credential: ReturnType<typeof parseAttendanceCredential>;
    try {
      credential = parseAttendanceCredential(parsedBody.data.credential);
    } catch (error) {
      await recordCredentialTest(
        authorization.operator.id,
        event.id,
        "UNKNOWN",
        false,
        "INVALID_CONTENT",
      );
      return privateJson({
        recognized: false,
        credentialType: "UNKNOWN",
        event: eventSummary(event),
        attendee: null,
        message:
          error instanceof Error ? error.message : "The QR content is invalid.",
      });
    }
    if (!credential) {
      await recordCredentialTest(
        authorization.operator.id,
        event.id,
        "UNKNOWN",
        false,
        "UNSUPPORTED_FORMAT",
      );
      return privateJson({
        recognized: false,
        credentialType: "UNKNOWN",
        event: eventSummary(event),
        attendee: null,
        message:
          "This is not a supported CSS digital ID or UST student QR format.",
      });
    }

    const credentialType: CredentialType =
      credential.method === AttendanceMethod.CSS_ID_QR ? "CSS_ID_QR" : "UST_QR";
    const rosterEntry = await prisma.attendanceEventRoster.findFirst({
      where: {
        eventId: event.id,
        ...(credential.method === AttendanceMethod.CSS_ID_QR
          ? { memberId: credential.memberId }
          : { studentNumber: credential.studentNumber }),
      },
      select: {
        fullName: true,
        studentNumber: true,
        memberId: true,
        section: true,
        source: true,
        affiliationGroups: true,
        isActive: true,
        attendance: { select: { checkedInAt: true } },
      },
    });
    if (!rosterEntry) {
      await recordCredentialTest(
        authorization.operator.id,
        event.id,
        credentialType,
        false,
        "NOT_ON_EVENT_ROSTER",
      );
      return privateJson({
        recognized: false,
        credentialType,
        event: eventSummary(event),
        attendee: null,
        message: `The QR format is valid, but it does not match anyone on the “${event.title}” roster.`,
      });
    }
    if (!rosterEntry.isActive) {
      await recordCredentialTest(
        authorization.operator.id,
        event.id,
        credentialType,
        false,
        "INACTIVE_ROSTER_ENTRY",
      );
      return privateJson({
        recognized: false,
        credentialType,
        event: eventSummary(event),
        attendee: attendeeSummary(
          rosterEntry,
          event.recruitmentCycle.schoolYear,
        ),
        message:
          "The QR matches this event roster, but the attendee is inactive.",
      });
    }

    await recordCredentialTest(
      authorization.operator.id,
      event.id,
      credentialType,
      true,
      rosterEntry.attendance ? "ALREADY_CHECKED_IN" : "ROSTER_MATCH",
    );
    return privateJson({
      recognized: true,
      credentialType,
      event: eventSummary(event),
      attendee: attendeeSummary(rosterEntry, event.recruitmentCycle.schoolYear),
      alreadyCheckedIn: Boolean(rosterEntry.attendance),
      message: rosterEntry.attendance
        ? "The QR works and matches this event roster, but this attendee is already checked in. The test did not alter their attendance."
        : "The QR works and matches an active attendee on this event roster. No attendance was recorded.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return privateJson({ error: "Invalid JSON body" }, 400);
    }
    console.error(
      "Test attendance credential failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return privateJson({ error: "The QR credential could not be tested" }, 500);
  }
}

function eventSummary(event: {
  title: string;
  status: string;
  recruitmentCycle: { schoolYear: string };
}) {
  return {
    title: event.title,
    status: event.status,
    schoolYear: event.recruitmentCycle.schoolYear,
  };
}

function attendeeSummary(
  entry: {
    fullName: string;
    studentNumber: string;
    memberId: string | null;
    section: string | null;
    source: string;
    affiliationGroups: string[];
  },
  schoolYear: string,
) {
  return {
    fullName: entry.fullName,
    studentNumber: entry.studentNumber,
    memberId: entry.memberId,
    section: entry.section,
    source: entry.source,
    affiliationGroups: entry.affiliationGroups,
    schoolYear,
  };
}

async function recordCredentialTest(
  actorId: string,
  eventId: string,
  credentialType: CredentialType,
  recognized: boolean,
  outcome: string,
) {
  await prisma.$transaction((tx) =>
    addAttendanceAudit(
      tx,
      actorId,
      "ATTENDANCE_CREDENTIAL_TESTED",
      "attendance_event",
      eventId,
      {
        credentialType,
        recognized,
        outcome,
      } satisfies Prisma.InputJsonValue,
    ),
  );
}
