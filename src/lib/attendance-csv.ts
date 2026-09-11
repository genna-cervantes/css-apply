import {
  normalizeAttendanceName,
  normalizeAttendanceSection,
  normalizeStudentNumber,
} from "@/lib/attendance";

export const MAX_ATTENDANCE_CSV_BYTES = 2 * 1024 * 1024;
export const MAX_ATTENDANCE_CSV_ROWS = 2_000;

type HeaderKey =
  "studentNumber" | "firstName" | "lastName" | "fullName" | "section";

const HEADER_ALIASES: Record<HeaderKey, Set<string>> = {
  studentNumber: new Set([
    "studentid",
    "studentnumber",
    "studentno",
    "studentnum",
    "idnumber",
  ]),
  firstName: new Set(["firstname", "givenname", "first"]),
  lastName: new Set(["lastname", "surname", "familyname", "last"]),
  fullName: new Set(["fullname", "studentname", "name"]),
  section: new Set(["section", "classsection", "block"]),
};

export type AttendanceCsvStudent = {
  rowNumber: number;
  studentNumber: string;
  fullName: string;
  section: string;
};

export type AttendanceCsvIssue = {
  rowNumber: number | null;
  severity: "WARNING" | "ERROR";
  code: string;
  message: string;
};

export type AttendanceCsvPreview = {
  headerRow: number;
  students: AttendanceCsvStudent[];
  issues: AttendanceCsvIssue[];
  canImport: boolean;
};

function parseDelimitedRows(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unclosed quoted value.");
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function headerMapping(row: string[]) {
  const mapping = new Map<HeaderKey, number>();
  row.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    for (const [key, aliases] of Object.entries(HEADER_ALIASES) as Array<
      [HeaderKey, Set<string>]
    >) {
      if (!mapping.has(key) && aliases.has(normalized)) mapping.set(key, index);
    }
  });
  return mapping;
}

function readCell(
  row: string[],
  mapping: Map<HeaderKey, number>,
  key: HeaderKey,
) {
  const index = mapping.get(key);
  return index === undefined ? "" : (row[index] ?? "");
}

function decodeCsv(bytes: Uint8Array) {
  if (bytes.byteLength === 0) throw new Error("The CSV file is empty.");
  if (bytes.byteLength > MAX_ATTENDANCE_CSV_BYTES) {
    throw new Error("The CSV file exceeds the 2 MB import limit.");
  }

  try {
    return new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .replace(/^\uFEFF/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

export function parseAttendanceCsv(
  bytes: Uint8Array,
  sectionOverride = "",
): AttendanceCsvPreview {
  const text = decodeCsv(bytes);
  let rows: string[][] = [];
  let headerIndex = -1;
  let mapping = new Map<HeaderKey, number>();

  for (const delimiter of [",", ";", "\t", "|"]) {
    const candidateRows = parseDelimitedRows(text, delimiter);
    for (
      let index = 0;
      index < Math.min(candidateRows.length, 20);
      index += 1
    ) {
      const candidate = headerMapping(candidateRows[index]);
      const hasName =
        candidate.has("fullName") ||
        (candidate.has("firstName") && candidate.has("lastName"));
      if (
        candidate.has("studentNumber") &&
        hasName &&
        candidate.size > mapping.size
      ) {
        rows = candidateRows;
        headerIndex = index;
        mapping = candidate;
      }
    }
  }
  if (headerIndex < 0) {
    throw new Error(
      "No supported header row was found. Include Student ID and either Full Name or First Name and Last Name columns.",
    );
  }

  const inferredSection = rows
    .slice(0, headerIndex)
    .map((row) => row.map((cell) => cell.trim()).filter(Boolean))
    .find(
      (cells) =>
        cells.length === 1 &&
        /^[1-6][A-Z]{2,8}(?:-[A-Z0-9]{1,4})?$/.test(cells[0].toUpperCase()),
    )?.[0];
  const normalizedOverride = sectionOverride.trim()
    ? normalizeAttendanceSection(sectionOverride)
    : inferredSection
      ? normalizeAttendanceSection(inferredSection)
      : "";
  const studentsByNumber = new Map<string, AttendanceCsvStudent>();
  const issues: AttendanceCsvIssue[] = [];

  for (let index = headerIndex + 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 1;
    if (!row.some((cell) => cell.trim())) continue;

    const rawStudentNumber = readCell(row, mapping, "studentNumber");
    if (!rawStudentNumber.trim()) {
      issues.push({
        rowNumber,
        severity: "WARNING",
        code: "IGNORED_NON_STUDENT_ROW",
        message: "A row without a student number was ignored.",
      });
      continue;
    }

    try {
      const studentNumber = normalizeStudentNumber(rawStudentNumber);
      const fullName = mapping.has("fullName")
        ? normalizeAttendanceName(readCell(row, mapping, "fullName"))
        : `${normalizeAttendanceName(readCell(row, mapping, "firstName"))} ${normalizeAttendanceName(readCell(row, mapping, "lastName"))}`;
      const rawSection = readCell(row, mapping, "section").trim();
      const section = rawSection
        ? normalizeAttendanceSection(rawSection)
        : normalizedOverride;
      if (!section)
        throw new Error(
          "Section is missing. Add a Section column or enter an override.",
        );

      const previous = studentsByNumber.get(studentNumber);
      if (previous) {
        if (previous.fullName.toLowerCase() === fullName.toLowerCase()) {
          issues.push({
            rowNumber,
            severity: "WARNING",
            code: "DUPLICATE_ROW",
            message: "A duplicate student row was ignored.",
          });
        } else {
          issues.push({
            rowNumber,
            severity: "ERROR",
            code: "CONFLICTING_STUDENT_NUMBER",
            message: "The same student number appears with different details.",
          });
        }
        continue;
      }

      studentsByNumber.set(studentNumber, {
        rowNumber,
        studentNumber,
        fullName,
        section,
      });
      if (studentsByNumber.size > MAX_ATTENDANCE_CSV_ROWS) {
        throw new Error(
          `The CSV contains more than ${MAX_ATTENDANCE_CSV_ROWS} student records.`,
        );
      }
    } catch (error) {
      issues.push({
        rowNumber,
        severity: "ERROR",
        code: "INVALID_STUDENT",
        message:
          error instanceof Error ? error.message : "Invalid student row.",
      });
    }
  }

  const students = [...studentsByNumber.values()];
  return {
    headerRow: headerIndex + 1,
    students,
    issues,
    canImport:
      students.length > 0 &&
      !issues.some((issue) => issue.severity === "ERROR"),
  };
}
