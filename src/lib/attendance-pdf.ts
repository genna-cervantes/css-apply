import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  PDFImage,
  PDFPage,
  PDFFont,
  PageSizes,
  rgb,
} from "pdf-lib";

const COLORS = {
  navy: rgb(19 / 255, 70 / 255, 135 / 255),
  blue: rgb(4 / 255, 79 / 255, 175 / 255),
  brightBlue: rgb(47 / 255, 126 / 255, 227 / 255),
  paleBlue: rgb(243 / 255, 248 / 255, 1),
  lineBlue: rgb(214 / 255, 229 / 255, 247 / 255),
  ink: rgb(27 / 255, 48 / 255, 75 / 255),
  muted: rgb(92 / 255, 113 / 255, 139 / 255),
  green: rgb(27 / 255, 120 / 255, 74 / 255),
  paleGray: rgb(247 / 255, 249 / 255, 252 / 255),
  white: rgb(1, 1, 1),
} as const;

const PH_TIME_ZONE = "Asia/Manila";
const PAGE_MARGIN = 34;
const ROW_HEIGHT = 16;
const ROWS_PER_PAGE = 20;

const GROUP_LABELS: Record<string, string> = {
  MEMBER: "Member",
  COMMITTEE_STAFF: "Committee Staff",
  EXECUTIVE_ASSOCIATE: "Executive Associate",
  IMPORTED_STUDENT: "Imported Student",
};

const METHOD_LABELS: Record<string, string> = {
  CSS_ID_QR: "CSS QR",
  UST_QR: "UST QR",
  MANUAL: "Manual",
  QR: "QR",
};

type AttendancePdfEvent = {
  title: string;
  venue: string;
  startsAt: Date;
  endsAt: Date;
  checkInOpensAt: Date;
  checkInClosesAt: Date;
  schoolYear: string;
};

type AttendancePdfEntry = {
  fullName: string;
  studentNumber: string;
  memberId: string | null;
  section: string | null;
  affiliationGroups: string[];
  attendance: {
    checkedInAt: Date;
    method: string;
  } | null;
};

export type AttendancePdfInput = {
  event: AttendancePdfEvent;
  entries: AttendancePdfEntry[];
  generatedBy: string;
  generatedAt?: Date;
};

type PageContext = {
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  watermark: PDFImage | null;
  event: AttendancePdfEvent;
  totals: { roster: number; present: number; absent: number; rate: number };
};

let watermarkPromise: Promise<Buffer | null> | null = null;
let fontPromise: Promise<{ regular: Buffer; bold: Buffer }> | null = null;

async function loadPdfFonts() {
  if (!fontPromise) {
    const fontsDirectory = path.join(
      process.cwd(),
      "public",
      "assets",
      "css-apply-static-images",
      "assets",
      "fonts",
    );
    fontPromise = Promise.all([
      readFile(path.join(fontsDirectory, "Poppins-Regular.ttf")),
      readFile(path.join(fontsDirectory, "Poppins-SemiBold.ttf")),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return fontPromise;
}

async function loadWatermarkPng() {
  if (!watermarkPromise) {
    watermarkPromise = (async () => {
      try {
        const logoPath = path.join(
          process.cwd(),
          "public",
          "assets",
          "css-apply-static-images",
          "assets",
          "logos",
          "Logo_CSS_Watermark.png",
        );
        return await readFile(logoPath);
      } catch (error) {
        console.error(
          "Attendance PDF watermark could not be loaded",
          error instanceof Error ? error.name : "UnknownError",
        );
        return null;
      }
    })();
  }
  return watermarkPromise;
}

function safePdfText(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const normalized = safePdfText(text);
  if (font.widthOfTextAtSize(normalized, size) <= maxWidth) return normalized;
  let shortened = normalized;
  while (
    shortened.length > 0 &&
    font.widthOfTextAtSize(`${shortened}...`, size) > maxWidth
  ) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened}...`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatAttendanceDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIME_ZONE,
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatDateRange(start: Date, end: Date) {
  const dateKey = (value: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: PH_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  return dateKey(start) === dateKey(end)
    ? `${formatDateTime(start)} - ${formatTime(end)}`
    : `${formatDateTime(start)} - ${formatDateTime(end)}`;
}

function drawLabelValue(
  page: PDFPage,
  bold: PDFFont,
  regular: PDFFont,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  page.drawText(label.toUpperCase(), {
    x,
    y,
    font: bold,
    size: 6.5,
    color: COLORS.brightBlue,
  });
  page.drawText(truncateText(value, regular, 8.5, maxWidth), {
    x,
    y: y - 12,
    font: regular,
    size: 8.5,
    color: COLORS.ink,
  });
}

function drawMetric(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  accent = false,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height: 40,
    color: accent ? COLORS.navy : COLORS.paleBlue,
  });
  page.drawText(value, {
    x: x + 12,
    y: y + 19,
    font: bold,
    size: 14,
    color: accent ? COLORS.white : COLORS.navy,
  });
  page.drawText(label.toUpperCase(), {
    x: x + 12,
    y: y + 8,
    font: regular,
    size: 6.5,
    color: accent ? COLORS.white : COLORS.muted,
  });
}

function drawPageBackground(context: PageContext) {
  const { page, regular, bold, watermark, event, totals } = context;
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.white });
  if (watermark) {
    const size = 320;
    page.drawImage(watermark, {
      x: (width - size) / 2,
      y: 65,
      width: size,
      height: size,
      opacity: 0.075,
    });
  }

  page.drawRectangle({
    x: 0,
    y: height - 84,
    width,
    height: 84,
    color: COLORS.navy,
  });
  page.drawRectangle({
    x: 0,
    y: height - 84,
    width: 9,
    height: 84,
    color: COLORS.brightBlue,
  });
  page.drawText("COMPUTER SCIENCE SOCIETY", {
    x: PAGE_MARGIN,
    y: height - 27,
    font: bold,
    size: 9,
    color: COLORS.white,
  });
  page.drawText(truncateText(event.title, bold, 21, width - 220), {
    x: PAGE_MARGIN,
    y: height - 56,
    font: bold,
    size: 21,
    color: COLORS.white,
  });
  page.drawText("ATTENDANCE REPORT", {
    x: width - 179,
    y: height - 46,
    font: bold,
    size: 10,
    color: COLORS.white,
  });
  page.drawText(`A.Y. ${safePdfText(event.schoolYear)}`, {
    x: width - 179,
    y: height - 62,
    font: regular,
    size: 8,
    color: rgb(209 / 255, 229 / 255, 1),
  });

  drawLabelValue(
    page,
    bold,
    regular,
    "Venue",
    event.venue,
    PAGE_MARGIN,
    height - 108,
    260,
  );
  drawLabelValue(
    page,
    bold,
    regular,
    "Event schedule",
    formatDateRange(event.startsAt, event.endsAt),
    318,
    height - 108,
    245,
  );
  drawLabelValue(
    page,
    bold,
    regular,
    "Check-in window",
    formatDateRange(event.checkInOpensAt, event.checkInClosesAt),
    585,
    height - 108,
    220,
  );

  const metricY = height - 181;
  const gap = 8;
  const metricWidth = (width - PAGE_MARGIN * 2 - gap * 3) / 4;
  drawMetric(
    page,
    regular,
    bold,
    "Roster",
    String(totals.roster),
    PAGE_MARGIN,
    metricY,
    metricWidth,
  );
  drawMetric(
    page,
    regular,
    bold,
    "Present",
    String(totals.present),
    PAGE_MARGIN + metricWidth + gap,
    metricY,
    metricWidth,
  );
  drawMetric(
    page,
    regular,
    bold,
    "Absent",
    String(totals.absent),
    PAGE_MARGIN + (metricWidth + gap) * 2,
    metricY,
    metricWidth,
  );
  drawMetric(
    page,
    regular,
    bold,
    "Attendance rate",
    `${totals.rate}%`,
    PAGE_MARGIN + (metricWidth + gap) * 3,
    metricY,
    metricWidth,
    true,
  );
}

const COLUMNS = [
  { key: "number", label: "#", width: 22 },
  { key: "name", label: "Attendee", width: 185 },
  { key: "student", label: "Student no.", width: 82 },
  { key: "member", label: "Member ID", width: 84 },
  { key: "section", label: "Section", width: 52 },
  { key: "group", label: "Affiliation", width: 130 },
  { key: "status", label: "Status", width: 55 },
  { key: "time", label: "Date / time", width: 70 },
  { key: "method", label: "Method", width: 55 },
] as const;

function drawTableHeader(page: PDFPage, bold: PDFFont, y: number) {
  const totalWidth = COLUMNS.reduce((sum, column) => sum + column.width, 0);
  page.drawRectangle({
    x: PAGE_MARGIN,
    y,
    width: totalWidth,
    height: 20,
    color: COLORS.navy,
  });
  let x = PAGE_MARGIN;
  for (const column of COLUMNS) {
    page.drawText(column.label.toUpperCase(), {
      x: x + 5,
      y: y + 7,
      font: bold,
      size: 6.3,
      color: COLORS.white,
    });
    x += column.width;
  }
}

function drawRow(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  entry: AttendancePdfEntry,
  absoluteIndex: number,
  y: number,
) {
  const present = Boolean(entry.attendance);
  page.drawRectangle({
    x: PAGE_MARGIN,
    y,
    width: COLUMNS.reduce((sum, column) => sum + column.width, 0),
    height: ROW_HEIGHT,
    color: absoluteIndex % 2 === 0 ? COLORS.white : COLORS.paleGray,
    opacity: 0.72,
    borderColor: COLORS.lineBlue,
    borderWidth: 0.25,
  });

  const values: Record<(typeof COLUMNS)[number]["key"], string> = {
    number: String(absoluteIndex + 1),
    name: entry.fullName,
    student: entry.studentNumber,
    member: entry.memberId || "-",
    section: entry.section || "-",
    group: entry.affiliationGroups
      .map((group) => GROUP_LABELS[group] || group)
      .join(", "),
    status: present ? "Present" : "Absent",
    time: entry.attendance
      ? formatAttendanceDateTime(entry.attendance.checkedInAt)
      : "-",
    method: entry.attendance
      ? METHOD_LABELS[entry.attendance.method] || entry.attendance.method
      : "-",
  };

  let x = PAGE_MARGIN;
  for (const column of COLUMNS) {
    const isStatus = column.key === "status";
    const font =
      column.key === "name" || (isStatus && present) ? bold : regular;
    const color = isStatus
      ? present
        ? COLORS.green
        : COLORS.muted
      : COLORS.ink;
    page.drawText(
      truncateText(values[column.key], font, 7.1, column.width - 9),
      {
        x: x + 5,
        y: y + 5.1,
        font,
        size: 7.1,
        color,
      },
    );
    x += column.width;
  }
}

export async function createAttendancePdf(input: AttendancePdfInput) {
  const generatedAt = input.generatedAt ?? new Date();
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const [fonts, watermarkBytes] = await Promise.all([
    loadPdfFonts(),
    loadWatermarkPng(),
  ]);
  const [regular, bold] = await Promise.all([
    document.embedFont(fonts.regular, { subset: true }),
    document.embedFont(fonts.bold, { subset: true }),
  ]);
  const watermark = watermarkBytes
    ? await document.embedPng(watermarkBytes)
    : null;
  const present = input.entries.filter((entry) => entry.attendance).length;
  const totals = {
    roster: input.entries.length,
    present,
    absent: input.entries.length - present,
    rate: input.entries.length
      ? Math.round((present / input.entries.length) * 100)
      : 0,
  };
  const [, portraitHeight] = PageSizes.A4;
  const [portraitWidth] = PageSizes.A4;
  const pageSize: [number, number] = [portraitHeight, portraitWidth];
  const pageCount = Math.max(
    1,
    Math.ceil(input.entries.length / ROWS_PER_PAGE),
  );

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const page = document.addPage(pageSize);
    drawPageBackground({
      page,
      regular,
      bold,
      watermark,
      event: input.event,
      totals,
    });
    const { height } = page.getSize();
    const tableHeaderY = height - 213;
    drawTableHeader(page, bold, tableHeaderY);
    const pageEntries = input.entries.slice(
      pageIndex * ROWS_PER_PAGE,
      (pageIndex + 1) * ROWS_PER_PAGE,
    );
    pageEntries.forEach((entry, rowIndex) => {
      drawRow(
        page,
        regular,
        bold,
        entry,
        pageIndex * ROWS_PER_PAGE + rowIndex,
        tableHeaderY - ROW_HEIGHT * (rowIndex + 1),
      );
    });
    if (input.entries.length === 0) {
      page.drawRectangle({
        x: PAGE_MARGIN,
        y: tableHeaderY - 42,
        width: COLUMNS.reduce((sum, column) => sum + column.width, 0),
        height: 42,
        color: COLORS.paleGray,
        borderColor: COLORS.lineBlue,
        borderWidth: 0.5,
        opacity: 0.9,
      });
      page.drawText("No roster entries were available for this event.", {
        x: PAGE_MARGIN + 12,
        y: tableHeaderY - 25,
        font: regular,
        size: 8,
        color: COLORS.muted,
      });
    }
  }

  document.getPages().forEach((page, pageIndex) => {
    const { width } = page.getSize();
    const footer = `Generated ${formatDateTime(generatedAt)} by ${safePdfText(input.generatedBy)}  |  Page ${pageIndex + 1} of ${document.getPageCount()}`;
    page.drawLine({
      start: { x: PAGE_MARGIN, y: 24 },
      end: { x: width - PAGE_MARGIN, y: 24 },
      thickness: 0.5,
      color: COLORS.lineBlue,
    });
    page.drawText(
      truncateText(footer, regular, 6.5, width - PAGE_MARGIN * 2 - 210),
      {
        x: PAGE_MARGIN,
        y: 12,
        font: regular,
        size: 6.5,
        color: COLORS.muted,
      },
    );
    page.drawText("UST COMPUTER SCIENCE SOCIETY", {
      x: width - 191,
      y: 12,
      font: bold,
      size: 6.5,
      color: COLORS.blue,
    });
  });

  document.setTitle(`${safePdfText(input.event.title)} - Attendance Report`);
  document.setAuthor("UST Computer Science Society");
  document.setSubject("Event attendance report");
  document.setCreator("CSSApply");
  document.setProducer("CSSApply");
  document.setCreationDate(generatedAt);
  document.setModificationDate(generatedAt);

  return document.save({ useObjectStreams: true });
}
