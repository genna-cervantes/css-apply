export type AttendanceEventStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";
export type AttendanceGroup =
  "MEMBER" | "COMMITTEE_STAFF" | "EXECUTIVE_ASSOCIATE" | "IMPORTED_STUDENT";
export type AttendanceScanOutcome =
  | "ACCEPTED"
  | "DUPLICATE"
  | "UNKNOWN"
  | "INACTIVE"
  | "INELIGIBLE"
  | "OUTSIDE_WINDOW";

export type AttendanceEvent = {
  id: string;
  recruitmentCycleId: string;
  title: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  checkInOpensAt: string;
  checkInClosesAt: string;
  status: AttendanceEventStatus;
  eligibleGroups: AttendanceGroup[];
  schoolYear: string;
  createdBy: string;
  rosterCount: number;
  attendanceCount: number;
};

export type AttendanceCycle = {
  id: string;
  schoolYear: string;
  isActive: boolean;
};

export type AttendanceRosterEntry = {
  id: string;
  fullName: string;
  studentNumber: string;
  memberId: string | null;
  section: string | null;
  source: "CSSAPPLY" | "IMPORTED";
  affiliationGroups: AttendanceGroup[];
  isActive: boolean;
  attendance: {
    id: string;
    checkedInAt: string;
    method: "QR" | "CSS_ID_QR" | "UST_QR" | "MANUAL";
    checkedInBy: { name: string };
  } | null;
};
