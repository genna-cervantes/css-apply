"use client";

import {
  CheckCircle2,
  Clock3,
  Keyboard,
  LoaderCircle,
  RotateCcw,
  Search,
  UserX,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import AttendanceQrScanner from "@/components/attendance/AttendanceQrScanner";
import type {
  AttendanceEvent,
  AttendanceRosterEntry,
  AttendanceScanOutcome,
} from "@/types/attendance";

const RESULT_CONTENT: Record<
  AttendanceScanOutcome,
  { title: string; description: string; tone: string }
> = {
  ACCEPTED: {
    title: "Check-in accepted",
    description: "Attendance was recorded successfully.",
    tone: "border-green-200 bg-green-50 text-green-800",
  },
  DUPLICATE: {
    title: "Already checked in",
    description:
      "This attendee already has an attendance record for the event.",
    tone: "border-[#B77900] bg-white text-[#8A5A00]",
  },
  UNKNOWN: {
    title: "Credential not recognized",
    description:
      "Use a CSS digital ID QR or an imported student’s supported UST QR.",
    tone: "border-red-200 bg-red-50 text-red-800",
  },
  INACTIVE: {
    title: "Attendee inactive",
    description: "This roster entry is inactive and cannot be checked in.",
    tone: "border-red-200 bg-red-50 text-red-800",
  },
  INELIGIBLE: {
    title: "Not on this event roster",
    description:
      "The credential is known but the attendee is not eligible for this event.",
    tone: "border-red-200 bg-red-50 text-red-800",
  },
  OUTSIDE_WINDOW: {
    title: "Check-in is closed",
    description:
      "The event is not open or the check-in window is not currently active.",
    tone: "border-[#B77900] bg-white text-[#8A5A00]",
  },
};

type ScanResult = {
  attemptId: string;
  outcome: AttendanceScanOutcome;
  attendanceId: string | null;
  attendee: {
    fullName: string;
    studentNumber: string;
    memberId: string | null;
    section: string | null;
  } | null;
};

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error || fallback;
}

export default function AttendanceScannerPanel({
  events,
  initialEventId,
  onAttendanceChange,
}: {
  events: AttendanceEvent[];
  initialEventId: string | null;
  onAttendanceChange: () => Promise<void>;
}) {
  const [eventId, setEventId] = useState(
    initialEventId || events.find((event) => event.status === "OPEN")?.id || "",
  );
  const rosterRequestId = useRef(0);
  const [entries, setEntries] = useState<AttendanceRosterEntry[]>([]);
  const [event, setEvent] = useState<AttendanceEvent | null>(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [manualNumber, setManualNumber] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (initialEventId) {
      setEventId(initialEventId);
      setEvent(null);
      setEntries([]);
    }
  }, [initialEventId]);

  const loadRoster = useCallback(async () => {
    const requestId = ++rosterRequestId.current;
    if (!eventId) {
      setEvent(null);
      setEntries([]);
      setLoadingRoster(false);
      return;
    }
    setLoadingRoster(true);
    setRequestError(null);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(
        `/api/admin/attendance/events/${eventId}?${params}`,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error(
          await readError(response, "Roster could not be loaded"),
        );
      const body = (await response.json()) as {
        event: AttendanceEvent;
        entries: AttendanceRosterEntry[];
      };
      if (requestId === rosterRequestId.current) {
        setEvent(body.event);
        setEntries(body.entries);
      }
    } catch (error) {
      if (requestId === rosterRequestId.current) {
        setRequestError(
          error instanceof Error ? error.message : "Roster could not be loaded",
        );
      }
    } finally {
      if (requestId === rosterRequestId.current) setLoadingRoster(false);
    }
  }, [eventId, search, statusFilter]);

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

  const submitScan = useCallback(
    async (
      payload:
        | { mode: "QR"; credential: string }
        | { mode: "MANUAL"; studentNumber: string },
    ) => {
      if (!eventId || submitting) return;
      setSubmitting(true);
      setRequestError(null);
      try {
        const response = await fetch(
          `/api/admin/attendance/events/${eventId}/scan`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              clientScanId: crypto.randomUUID(),
            }),
          },
        );
        if (!response.ok)
          throw new Error(
            await readError(response, "Scan could not be processed"),
          );
        const body = (await response.json()) as ScanResult;
        setResult(body);
        setManualNumber("");
        await Promise.all([loadRoster(), onAttendanceChange()]);
      } catch (error) {
        setRequestError(
          error instanceof Error
            ? error.message
            : "Scan could not be processed",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [eventId, loadRoster, onAttendanceChange, submitting],
  );

  useEffect(() => {
    if (!result) return;
    const timeout = window.setTimeout(
      () => setResult(null),
      result.outcome === "ACCEPTED" ? 4_000 : 7_000,
    );
    return () => window.clearTimeout(timeout);
  }, [result]);

  function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (manualNumber.trim()) {
      void submitScan({ mode: "MANUAL", studentNumber: manualNumber });
    }
  }

  const selectedIsOpen = event?.status === "OPEN";
  const content = result ? RESULT_CONTENT[result.outcome] : null;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#134687]">
            Select event
          </span>
          <select
            value={eventId}
            onChange={(changeEvent) => {
              setEventId(changeEvent.target.value);
              setEvent(null);
              setEntries([]);
              setResult(null);
            }}
            className="w-full rounded-lg border border-[#005FD9]/20 px-3 py-2.5 text-sm text-[#134687] outline-none focus:border-[#044FAF]"
          >
            <option value="">Choose an attendance event</option>
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {item.status.toLowerCase()} · A.Y.{" "}
                {item.schoolYear}
              </option>
            ))}
          </select>
        </label>
        {event && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#134687]/65">
            <span>{event.venue}</span>
            <span>
              {event.attendanceCount} / {event.rosterCount} checked in
            </span>
            <span>
              Window:{" "}
              {new Date(event.checkInOpensAt).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              –{" "}
              {new Date(event.checkInClosesAt).toLocaleTimeString("en-PH", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </section>

      {eventId && (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <AttendanceQrScanner
            disabled={submitting || Boolean(result) || !selectedIsOpen}
            onScan={(credential) => submitScan({ mode: "QR", credential })}
          />
          <div className="space-y-5">
            <section
              className="min-h-64 rounded-2xl border border-[#005FD9]/10 bg-white p-5 shadow-sm"
              aria-live="assertive"
            >
              {submitting ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-[#134687]">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                  <strong>Checking the event roster…</strong>
                </div>
              ) : result && content ? (
                <div
                  className={`rounded-xl border p-5 text-center ${content.tone}`}
                >
                  {result.outcome === "ACCEPTED" ? (
                    <CheckCircle2 className="mx-auto h-10 w-10" />
                  ) : result.outcome === "DUPLICATE" ||
                    result.outcome === "OUTSIDE_WINDOW" ? (
                    <Clock3 className="mx-auto h-10 w-10" />
                  ) : (
                    <UserX className="mx-auto h-10 w-10" />
                  )}
                  <h2 className="mt-3 font-poppins text-xl font-bold">
                    {content.title}
                  </h2>
                  {result.attendee && (
                    <div className="my-3 rounded-lg bg-white/70 p-3">
                      <strong className="block">
                        {result.attendee.fullName}
                      </strong>
                      <span className="text-xs">
                        {result.attendee.studentNumber}
                        {result.attendee.section
                          ? ` · ${result.attendee.section}`
                          : ""}
                      </span>
                    </div>
                  )}
                  <p className="mt-1 text-sm">{content.description}</p>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 text-xs font-semibold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Clear result
                  </button>
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center text-center text-[#134687]/60">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-[#044FAF]/30" />
                  <h2 className="font-poppins text-lg font-semibold text-[#134687]">
                    Ready for an attendee
                  </h2>
                  <p className="mt-1 max-w-sm text-sm">
                    Scan the QR on a CSS digital ID. Imported students may scan
                    their supported UST QR.
                  </p>
                </div>
              )}
              {requestError && (
                <p
                  className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {requestError}
                </p>
              )}
            </section>

            <form
              onSubmit={submitManual}
              className="rounded-2xl border border-[#005FD9]/10 bg-white p-5"
            >
              <h2 className="font-poppins font-semibold text-[#134687]">
                Manual fallback
              </h2>
              <p className="mb-3 mt-1 text-xs text-[#134687]/60">
                Enter the attendee’s 10-digit student number if camera scanning
                is unavailable.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={manualNumber}
                  onChange={(inputEvent) =>
                    setManualNumber(inputEvent.target.value)
                  }
                  inputMode="numeric"
                  maxLength={16}
                  disabled={submitting || !selectedIsOpen}
                  placeholder="2026123456"
                  className="min-w-0 flex-1 rounded-lg border border-[#005FD9]/20 px-3 py-2.5 text-sm outline-none focus:border-[#044FAF]"
                />
                <button
                  type="submit"
                  disabled={
                    submitting || !selectedIsOpen || !manualNumber.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#134687] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Keyboard className="h-4 w-4" /> Check in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {event && (
        <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-poppins text-lg font-bold text-[#134687]">
                Event roster
              </h2>
              <p className="text-xs text-[#134687]/60">
                The first 50 matching attendees are shown.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#134687]/40" />
                <input
                  value={search}
                  onChange={(inputEvent) => setSearch(inputEvent.target.value)}
                  placeholder="Search name or ID"
                  className="w-full rounded-lg border border-[#005FD9]/15 py-2 pl-9 pr-3 text-sm sm:w-56"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(filterEvent) =>
                  setStatusFilter(filterEvent.target.value)
                }
                className="rounded-lg border border-[#005FD9]/15 px-3 py-2 text-sm text-[#134687]"
              >
                <option value="all">All attendees</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            {loadingRoster ? (
              <div className="flex justify-center py-10">
                <LoaderCircle className="h-6 w-6 animate-spin text-[#044FAF]" />
              </div>
            ) : entries.length ? (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[#005FD9]/10 font-mono text-[10px] uppercase tracking-wider text-[#134687]/50">
                  <tr>
                    <th className="px-3 py-2">Attendee</th>
                    <th className="px-3 py-2">Student / Member ID</th>
                    <th className="px-3 py-2">Group</th>
                    <th className="px-3 py-2">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#005FD9]/5">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-3 py-3">
                        <strong className="block text-[#134687]">
                          {entry.fullName}
                        </strong>
                        <span className="text-xs text-[#134687]/50">
                          {entry.section || "No section"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-[#134687]/70">
                        {entry.studentNumber}
                        <br />
                        {entry.memberId || "UST QR only"}
                      </td>
                      <td className="px-3 py-3 text-xs text-[#134687]/65">
                        {entry.affiliationGroups
                          .map((group) =>
                            group.replaceAll("_", " ").toLowerCase(),
                          )
                          .join(", ")}
                      </td>
                      <td className="px-3 py-3">
                        {entry.attendance ? (
                          <>
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                              Present
                            </span>
                            <span className="ml-2 text-xs text-[#134687]/50">
                              {new Date(
                                entry.attendance.checkedInAt,
                              ).toLocaleTimeString("en-PH", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-10 text-center text-sm text-[#134687]/55">
                No roster entries match these filters.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
