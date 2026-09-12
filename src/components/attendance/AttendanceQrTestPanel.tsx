"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  Keyboard,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { FormEvent, useCallback, useState } from "react";
import AttendanceQrScanner from "@/components/attendance/AttendanceQrScanner";
import type { AttendanceEvent } from "@/types/attendance";

type TestResult = {
  recognized: boolean;
  credentialType: "CSS_ID_QR" | "UST_QR" | "UNKNOWN";
  event: {
    title: string;
    status: string;
    schoolYear: string;
  };
  attendee: {
    fullName: string;
    studentNumber: string;
    memberId: string | null;
    section: string | null;
    source: "CSSAPPLY" | "IMPORTED";
    affiliationGroups: string[];
    schoolYear: string;
  } | null;
  alreadyCheckedIn?: boolean;
  message: string;
};

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error || fallback;
}

export default function AttendanceQrTestPanel({
  events,
}: {
  events: AttendanceEvent[];
}) {
  const [eventId, setEventId] = useState(
    events.find((event) => event.status === "OPEN")?.id ||
      events.find((event) => event.status === "DRAFT")?.id ||
      events[0]?.id ||
      "",
  );
  const [decodedValue, setDecodedValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testCredential = useCallback(
    async (credential: string) => {
      const submittedCredential = credential.trim();
      if (!eventId || submitting || !submittedCredential) return;
      setDecodedValue("");
      setSubmitting(true);
      setResult(null);
      setError(null);
      try {
        const response = await fetch("/api/admin/attendance/test-credential", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            credential: submittedCredential,
          }),
        });
        if (!response.ok) {
          throw new Error(
            await readError(response, "The QR credential could not be tested"),
          );
        }
        setResult((await response.json()) as TestResult);
      } catch (testError) {
        setError(
          testError instanceof Error
            ? testError.message
            : "The QR credential could not be tested",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [eventId, submitting],
  );

  function submitDecodedValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void testCredential(decodedValue);
  }

  function clearResult() {
    setResult(null);
    setError(null);
    setDecodedValue("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-poppins text-xl font-bold text-[#134687]">
          QR check-in test
        </h2>
        <p className="text-sm text-[#134687]/65">
          Test the same scanner and event roster used during check-in. Dry runs
          never create or change attendance records.
        </p>
      </div>

      <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#134687]">
            Event roster to test
          </span>
          <select
            value={eventId}
            disabled={submitting}
            onChange={(event) => {
              setEventId(event.target.value);
              clearResult();
            }}
            className="w-full rounded-lg border border-[#005FD9]/20 px-3 py-2.5 text-sm text-[#134687] outline-none focus:border-[#044FAF] disabled:opacity-60"
          >
            <option value="" disabled>
              Choose an event
            </option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} · {event.status.toLowerCase()} · A.Y.{" "}
                {event.schoolYear}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(330px,0.9fr)]">
        <AttendanceQrScanner
          disabled={!eventId || submitting || Boolean(result)}
          onScan={testCredential}
        />

        <div className="space-y-5">
          <section
            className="min-h-72 rounded-2xl border border-[#005FD9]/10 bg-white p-5 shadow-sm"
            aria-live="assertive"
          >
            {submitting ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-[#134687]">
                <LoaderCircle className="h-9 w-9 animate-spin" />
                <strong>Testing QR against the event roster…</strong>
              </div>
            ) : result ? (
              <div
                className={`rounded-xl border p-5 text-center ${
                  result.recognized
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {result.recognized ? (
                  <CheckCircle2 className="mx-auto h-11 w-11" />
                ) : (
                  <XCircle className="mx-auto h-11 w-11" />
                )}
                <h3 className="mt-3 font-poppins text-xl font-bold">
                  {result.recognized ? "QR check passed" : "QR check failed"}
                </h3>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  <span className="rounded-full bg-white/75 px-2.5 py-1 font-mono text-[10px] font-semibold">
                    {result.credentialType === "CSS_ID_QR"
                      ? "CSS DIGITAL ID"
                      : result.credentialType === "UST_QR"
                        ? "UST QR"
                        : "UNSUPPORTED FORMAT"}
                  </span>
                  <span className="rounded-full bg-white/75 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase">
                    {result.event.status}
                  </span>
                  {result.alreadyCheckedIn && (
                    <span className="rounded-full bg-white/75 px-2.5 py-1 font-mono text-[10px] font-semibold">
                      ALREADY PRESENT
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold">
                  {result.event.title} · A.Y. {result.event.schoolYear}
                </p>
                {result.attendee && (
                  <div className="my-4 rounded-lg bg-white/80 p-3 text-left">
                    <strong className="block text-[#134687]">
                      {result.attendee.fullName}
                    </strong>
                    <span className="mt-1 block font-mono text-xs text-[#134687]/65">
                      {result.attendee.studentNumber}
                      {result.attendee.memberId
                        ? ` · ${result.attendee.memberId}`
                        : ""}
                    </span>
                    <span className="mt-1 block text-xs text-[#134687]/60">
                      {result.attendee.section || "No section"} ·{" "}
                      {result.attendee.source === "CSSAPPLY"
                        ? "CSSApply"
                        : "Imported roster"}
                    </span>
                    <span className="mt-1 block text-xs capitalize text-[#134687]/60">
                      {result.attendee.affiliationGroups
                        .map((group) =>
                          group.replaceAll("_", " ").toLowerCase(),
                        )
                        .join(", ")}
                    </span>
                  </div>
                )}
                <p className="mt-3 text-sm">{result.message}</p>
                <button
                  type="button"
                  onClick={clearResult}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 text-xs font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Test another QR
                </button>
              </div>
            ) : (
              <div className="flex min-h-60 flex-col items-center justify-center text-center text-[#134687]/60">
                <ClipboardCheck className="mb-3 h-11 w-11 text-[#044FAF]/35" />
                <h3 className="font-poppins text-lg font-semibold text-[#134687]">
                  Ready to test
                </h3>
                <p className="mt-1 max-w-sm text-sm">
                  Choose an event, start the camera, and hold a QR inside the
                  frame. The selected event roster will be checked without
                  recording attendance.
                </p>
              </div>
            )}
            {error && (
              <p
                className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
          </section>

          <form
            onSubmit={submitDecodedValue}
            className="rounded-2xl border border-[#005FD9]/10 bg-white p-5"
          >
            <h3 className="font-poppins font-semibold text-[#134687]">
              Test decoded text
            </h3>
            <p className="mb-3 mt-1 text-xs text-[#134687]/60">
              If a camera is unavailable, paste the exact value decoded from the
              QR. Do not enter a student number by itself.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={decodedValue}
                onChange={(event) => setDecodedValue(event.target.value)}
                disabled={submitting || Boolean(result)}
                placeholder="CSS-2627-0001 or 2026123456-1"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-lg border border-[#005FD9]/20 px-3 py-2.5 font-mono text-sm outline-none focus:border-[#044FAF]"
              />
              <button
                type="submit"
                disabled={
                  !eventId ||
                  submitting ||
                  Boolean(result) ||
                  !decodedValue.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#134687] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Keyboard className="h-4 w-4" /> Test value
              </button>
            </div>
          </form>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-[#B77900] bg-white p-3 text-sm text-[#8A5A00]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />A successful test
        confirms the scanner, credential format, and selected event roster
        match. It never records attendance. Actual check-in still requires the
        event to be open within its configured check-in window.
      </p>
    </div>
  );
}
