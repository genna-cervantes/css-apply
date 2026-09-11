import { NextRequest, NextResponse } from "next/server";
import { parseAttendanceCsv } from "@/lib/attendance-csv";
import { authorizeAttendanceOperator } from "@/lib/attendance-auth";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json({
      schoolYear: cycle.schoolYear,
      headerRow: preview.headerRow,
      studentCount: preview.students.length,
      canImport: preview.canImport,
      students: preview.students,
      issues: preview.issues,
    });
  } catch (error) {
    console.error(
      "Preview attendance CSV failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "The CSV file could not be previewed" },
      { status: 500 },
    );
  }
}
