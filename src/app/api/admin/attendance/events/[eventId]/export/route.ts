import { NextRequest, NextResponse } from "next/server";
import { addAttendanceAudit, csvEscape } from "@/lib/attendance";
import { authorizeAttendanceOperator } from "@/lib/attendance-auth";
import { prisma } from "@/lib/prisma";

function spreadsheetSafe(value: string | null) {
  const text = value ?? "";
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const authorization = await authorizeAttendanceOperator();
    if (authorization.response) return authorization.response;
    const { eventId } = await params;

    const event = await prisma.attendanceEvent.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const entries = await prisma.attendanceEventRoster.findMany({
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

    await prisma.$transaction(async (tx) => {
      await addAttendanceAudit(
        tx,
        authorization.operator.id,
        "ATTENDANCE_EXPORTED",
        "attendance_event",
        event.id,
        { rowCount: entries.length },
      );
    });

    const filename = `${
      event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "event"
    }-attendance.csv`;
    return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
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
