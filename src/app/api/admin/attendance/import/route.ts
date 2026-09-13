import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addAttendanceAudit,
  normalizeAttendanceName,
  normalizeAttendanceSection,
  normalizeStudentNumber,
} from "@/lib/attendance";
import { parseAttendanceCsv } from "@/lib/attendance-csv";
import { authorizeAttendanceOperator } from "@/lib/attendance-auth";
import { prisma } from "@/lib/prisma";

const manualStudentSchema = z.object({
  recruitmentCycleId: z.string().min(1),
  studentNumber: z.string().min(1).max(32),
  fullName: z.string().min(1).max(200),
  section: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const authorization = await authorizeAttendanceOperator({
      superAdminOnly: true,
    });
    if (authorization.response) return authorization.response;
    const recruitmentCycleId =
      request.nextUrl.searchParams.get("recruitmentCycleId") || "";
    if (!recruitmentCycleId) {
      return NextResponse.json(
        { error: "Recruitment cycle is required" },
        { status: 400 },
      );
    }

    const guests = await prisma.attendanceGuest.findMany({
      where: { recruitmentCycleId },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        studentNumber: true,
        fullName: true,
        section: true,
        isActive: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ guests });
  } catch (error) {
    console.error(
      "Load imported attendance students failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Imported students could not be loaded" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await authorizeAttendanceOperator({
      superAdminOnly: true,
    });
    if (authorization.response) return authorization.response;

    const form = await request.formData();
    const file = form.get("file");
    const recruitmentCycleId = String(form.get("recruitmentCycleId") || "");
    const section = String(form.get("section") || "");
    if (!(file instanceof File) || !recruitmentCycleId) {
      return NextResponse.json(
        { error: "A CSV file and recruitment cycle are required" },
        { status: 400 },
      );
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV roster files are allowed" },
        { status: 400 },
      );
    }
    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { id: recruitmentCycleId },
      select: { schoolYear: true },
    });
    if (!cycle) {
      return NextResponse.json(
        { error: "Recruitment cycle not found" },
        { status: 404 },
      );
    }

    let preview: ReturnType<typeof parseAttendanceCsv>;
    try {
      preview = parseAttendanceCsv(
        new Uint8Array(await file.arrayBuffer()),
        section,
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "The CSV file is invalid",
        },
        { status: 422 },
      );
    }
    if (!preview.canImport) {
      return NextResponse.json(
        { error: "Resolve all CSV preview errors before importing" },
        { status: 422 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "RecruitmentCycle" WHERE "id" = ${recruitmentCycleId} FOR UPDATE`;
      const existing = await tx.attendanceGuest.findMany({
        where: {
          recruitmentCycleId,
          studentNumber: {
            in: preview.students.map((student) => student.studentNumber),
          },
        },
      });
      const existingByNumber = new Map(
        existing.map((guest) => [guest.studentNumber, guest]),
      );
      const newStudents = preview.students.filter(
        (student) => !existingByNumber.has(student.studentNumber),
      );
      const changedStudents = preview.students.filter((student) => {
        const previous = existingByNumber.get(student.studentNumber);
        return Boolean(
          previous &&
          (previous.fullName !== student.fullName ||
            previous.section !== student.section ||
            !previous.isActive),
        );
      });
      const unchangedCount =
        preview.students.length - newStudents.length - changedStudents.length;

      if (newStudents.length > 0) {
        await tx.attendanceGuest.createMany({
          data: newStudents.map((student) => ({
            recruitmentCycleId,
            studentNumber: student.studentNumber,
            fullName: student.fullName,
            section: student.section,
            importedById: authorization.operator.id,
          })),
        });
      }
      for (let index = 0; index < changedStudents.length; index += 300) {
        const chunk = changedStudents.slice(index, index + 300);
        const values = Prisma.join(
          chunk.map(
            (student) =>
              Prisma.sql`(${student.studentNumber}::varchar(10), ${student.fullName}::varchar(200), ${student.section || null}::varchar(100))`,
          ),
        );
        await tx.$executeRaw(Prisma.sql`
          UPDATE "AttendanceGuest" AS guest
          SET
            "fullName" = incoming."fullName",
            "section" = incoming."section",
            "isActive" = true,
            "importedById" = ${authorization.operator.id},
            "updatedAt" = NOW()
          FROM (VALUES ${values}) AS incoming("studentNumber", "fullName", "section")
          WHERE guest."recruitmentCycleId" = ${recruitmentCycleId}
            AND guest."studentNumber" = incoming."studentNumber"
        `);
      }
      const createdCount = newStudents.length;
      const updatedCount = changedStudents.length;

      const total = await tx.attendanceGuest.count({
        where: { recruitmentCycleId, isActive: true },
      });
      await addAttendanceAudit(
        tx,
        authorization.operator.id,
        "ATTENDANCE_GUEST_ROSTER_IMPORTED",
        "recruitment_cycle",
        recruitmentCycleId,
        {
          schoolYear: cycle.schoolYear,
          acceptedCount: preview.students.length,
          createdCount,
          updatedCount,
          unchangedCount,
          warningCount: preview.issues.filter(
            (issue) => issue.severity === "WARNING",
          ).length,
        },
      );
      return { createdCount, updatedCount, unchangedCount, total };
    });

    return NextResponse.json({
      ...result,
      schoolYear: cycle.schoolYear,
      warningCount: preview.issues.filter(
        (issue) => issue.severity === "WARNING",
      ).length,
    });
  } catch (error) {
    console.error(
      "Import attendance students failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "The student roster could not be imported" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authorization = await authorizeAttendanceOperator({
      superAdminOnly: true,
    });
    if (authorization.response) return authorization.response;
    const parsed = manualStudentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid student details" },
        { status: 400 },
      );
    }

    let studentNumber: string;
    let fullName: string;
    let section: string;
    try {
      studentNumber = normalizeStudentNumber(parsed.data.studentNumber);
      fullName = normalizeAttendanceName(parsed.data.fullName);
      section = normalizeAttendanceSection(parsed.data.section);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid student" },
        { status: 422 },
      );
    }

    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { id: parsed.data.recruitmentCycleId },
      select: { id: true, schoolYear: true },
    });
    if (!cycle) {
      return NextResponse.json(
        { error: "Recruitment cycle not found" },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "RecruitmentCycle" WHERE "id" = ${cycle.id} FOR UPDATE`;
      const previous = await tx.attendanceGuest.findUnique({
        where: {
          recruitmentCycleId_studentNumber: {
            recruitmentCycleId: cycle.id,
            studentNumber,
          },
        },
      });
      if (previous?.isActive) return { duplicate: true } as const;

      const guest = await tx.attendanceGuest.upsert({
        where: {
          recruitmentCycleId_studentNumber: {
            recruitmentCycleId: cycle.id,
            studentNumber,
          },
        },
        update: {
          fullName,
          section,
          isActive: true,
          importedById: authorization.operator.id,
        },
        create: {
          recruitmentCycleId: cycle.id,
          studentNumber,
          fullName,
          section,
          importedById: authorization.operator.id,
        },
      });
      await addAttendanceAudit(
        tx,
        authorization.operator.id,
        "ATTENDANCE_GUEST_ADDED",
        "attendance_guest",
        guest.id,
        { recruitmentCycleId: cycle.id, schoolYear: cycle.schoolYear },
      );
      return { duplicate: false, guest } as const;
    });

    if (result.duplicate) {
      return NextResponse.json(
        { error: "This student is already in the selected imported roster" },
        { status: 409 },
      );
    }
    return NextResponse.json({ guest: result.guest }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error(
      "Add imported attendance student failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Student could not be added" },
      { status: 500 },
    );
  }
}
