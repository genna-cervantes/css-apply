import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { addAttendanceAudit, csvEscape } from "@/lib/attendance";
import { authorizeAttendanceOperator } from "@/lib/attendance-auth";
import { createAttendancePdf } from "@/lib/attendance-pdf";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ExportFormat = "csv" | "pdf";

const MAX_SYNCHRONOUS_EXPORT_ROWS = 5_000;

function spreadsheetSafe(value: string | null) {
  const text = value ?? "";
  return /^[\u0000-\u0020]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function exportFilename(title: string, format: ExportFormat) {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "event";
  return `${slug}-attendance.${format}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const authorization = await authorizeAttendanceOperator();
    if (authorization.response) return authorization.response;
    const format = request.nextUrl.searchParams.get("format") || "csv";
    if (format !== "csv" && format !== "pdf") {
      return NextResponse.json(
        { error: "Export format must be CSV or PDF" },
        { status: 400 },
      );
    }
    const { eventId } = await params;

    const snapshot = await prisma.$transaction(
      async (tx) => {
        const event = await tx.attendanceEvent.findUnique({
          where: { id: eventId },
          select: {
            id: true,
            title: true,
            venue: true,
            startsAt: true,
            endsAt: true,
            checkInOpensAt: true,
            checkInClosesAt: true,
            recruitmentCycle: { select: { schoolYear: true } },
          },
        });
        if (!event) return null;
        const entries = await tx.attendanceEventRoster.findMany({
          where: { eventId },
          orderBy: { fullName: "asc" },
          include: {
            attendance: {
              select: {
                checkedInAt: true,
                method: true,
                checkedInBy: { select: { name: true } },
              },
            },
          },
        });
        return { event, entries };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 5_000,
        timeout: 15_000,
      },
    );
    if (!snapshot) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const { event, entries } = snapshot;

    if (entries.length > MAX_SYNCHRONOUS_EXPORT_ROWS) {
      return NextResponse.json(
        {
          error: `Reports are limited to ${MAX_SYNCHRONOUS_EXPORT_ROWS.toLocaleString()} roster entries`,
        },
        { status: 422 },
      );
    }

    const filename = exportFilename(event.title, format);
    if (format === "pdf") {
      const pdf = await createAttendancePdf({
        event: {
          title: event.title,
          venue: event.venue,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          checkInOpensAt: event.checkInOpensAt,
          checkInClosesAt: event.checkInClosesAt,
          schoolYear: event.recruitmentCycle.schoolYear,
        },
        entries,
        generatedBy: authorization.operator.name,
      });
      await recordExportAudit(
        authorization.operator.id,
        event.id,
        format,
        entries.length,
      );
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const lines = [
      [
        "Name",
        "Student Number",
        "Member ID",
        "Section",
        "Affiliations",
        "Source",
        "Attendance",
        "Checked In At",
        "Method",
        "Checked In By",
      ]
        .map(csvEscape)
        .join(","),
      ...entries.map((entry) =>
        [
          spreadsheetSafe(entry.fullName),
          entry.studentNumber,
          entry.memberId,
          spreadsheetSafe(entry.section),
          entry.affiliationGroups.join("; "),
          entry.source,
          entry.attendance ? "Present" : "Absent",
          entry.attendance?.checkedInAt ?? null,
          entry.attendance?.method ?? null,
          spreadsheetSafe(entry.attendance?.checkedInBy.name ?? null),
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];

    await recordExportAudit(
      authorization.operator.id,
      event.id,
      format,
      entries.length,
    );
    return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "Export attendance failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Attendance could not be exported" },
      { status: 500 },
    );
  }
}

async function recordExportAudit(
  actorId: string,
  eventId: string,
  format: ExportFormat,
  rowCount: number,
) {
  await prisma.$transaction((tx) =>
    addAttendanceAudit(
      tx,
      actorId,
      "ATTENDANCE_EXPORTED",
      "attendance_event",
      eventId,
      { format, rowCount },
    ),
  );
}
