"use client";

import {
  FileCheck2,
  FileUp,
  LoaderCircle,
  Plus,
  UsersRound,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AttendanceCycle } from "@/types/attendance";

type Preview = {
  schoolYear: string;
  headerRow: number;
  studentCount: number;
  canImport: boolean;
  students: Array<{
    rowNumber: number;
    studentNumber: string;
    fullName: string;
    section: string;
  }>;
  issues: Array<{
    rowNumber: number | null;
    severity: "WARNING" | "ERROR";
    code: string;
    message: string;
  }>;
};

type ImportedGuest = {
  id: string;
  studentNumber: string;
  fullName: string;
  section: string | null;
  isActive: boolean;
};

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error || fallback;
}

export default function AttendanceImportPanel({
  cycles,
}: {
  cycles: AttendanceCycle[];
}) {
  const [cycleId, setCycleId] = useState(
    cycles.find((cycle) => cycle.isActive)?.id || cycles[0]?.id || "",
  );
  const [section, setSection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [guests, setGuests] = useState<ImportedGuest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadGuests = useCallback(async () => {
    if (!cycleId) return;
    setLoadingGuests(true);
    try {
      const response = await fetch(
        `/api/admin/attendance/import?recruitmentCycleId=${encodeURIComponent(cycleId)}`,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error(
          await readError(response, "Imported students could not be loaded"),
        );
      const body = (await response.json()) as { guests: ImportedGuest[] };
      setGuests(body.guests);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Imported students could not be loaded",
      );
    } finally {
      setLoadingGuests(false);
    }
  }, [cycleId]);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  const errorCount = useMemo(
    () =>
      preview?.issues.filter((issue) => issue.severity === "ERROR").length || 0,
    [preview],
  );
  const warningCount = useMemo(
    () =>
      preview?.issues.filter((issue) => issue.severity === "WARNING").length ||
      0,
    [preview],
  );

  function uploadForm() {
    if (!file || !cycleId)
      throw new Error("Choose a CSV file and academic year first");
    const form = new FormData();
    form.set("file", file);
    form.set("recruitmentCycleId", cycleId);
    form.set("section", section);
    return form;
  }

  async function previewCsv() {
    setPreviewing(true);
    try {
      const response = await fetch("/api/admin/attendance/import/preview", {
        method: "POST",
        body: uploadForm(),
      });
      if (!response.ok)
        throw new Error(
          await readError(response, "CSV could not be previewed"),
        );
      setPreview((await response.json()) as Preview);
    } catch (error) {
      setPreview(null);
      toast.error(
        error instanceof Error ? error.message : "CSV preview failed",
      );
    } finally {
      setPreviewing(false);
    }
  }

  async function importCsv() {
    setImporting(true);
    try {
      const response = await fetch("/api/admin/attendance/import", {
        method: "POST",
        body: uploadForm(),
      });
      if (!response.ok)
        throw new Error(await readError(response, "CSV could not be imported"));
      const body = (await response.json()) as {
        createdCount: number;
        updatedCount: number;
        total: number;
      };
      toast.success(
        `${body.createdCount} added, ${body.updatedCount} updated · ${body.total} imported students`,
      );
      await loadGuests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "CSV import failed");
    } finally {
      setImporting(false);
    }
  }

  async function addStudent(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formElement = formEvent.currentTarget;
    const form = new FormData(formElement);
    setAdding(true);
    try {
      const response = await fetch("/api/admin/attendance/import", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentCycleId: cycleId,
          studentNumber: form.get("studentNumber"),
          fullName: form.get("fullName"),
          section: form.get("section"),
        }),
      });
      if (!response.ok)
        throw new Error(
          await readError(response, "Student could not be added"),
        );
      const body = (await response.json()) as { duplicate?: boolean };
      if (body.duplicate) {
        toast.info("That student is already active in the imported roster");
      } else {
        toast.success("Student added to the imported roster");
      }
      formElement.reset();
      await loadGuests();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Student could not be added",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-poppins text-xl font-bold text-[#134687]">
          Imported CS students
        </h2>
        <p className="text-sm text-[#134687]/65">
          Import attendees who are not in CSSApply. They check in using the
          supported UST QR tied to their student number.
        </p>
      </div>
      <p className="rounded-xl border border-[#B77900] bg-white p-3 text-sm text-[#8A5A00]">
        Imports never rewrite an open event. Refresh any affected draft roster
        from the Events tab after importing.
      </p>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-xl bg-[#E8F2FF] p-2 text-[#044FAF]">
              <FileUp className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#044FAF]/60">
                CSV roster
              </p>
              <h3 className="font-poppins font-bold text-[#134687]">
                Preview and merge students
              </h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-semibold text-[#134687]">
                Academic year
              </span>
              <select
                value={cycleId}
                onChange={(event) => {
                  setCycleId(event.target.value);
                  setPreview(null);
                }}
                className="w-full rounded-lg border border-[#005FD9]/20 px-3 py-2.5 text-sm"
              >
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    A.Y. {cycle.schoolYear}
                    {cycle.isActive ? " · Active" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-[#134687]">
                Section override{" "}
                <small className="font-normal text-[#134687]/50">
                  optional
                </small>
              </span>
              <input
                value={section}
                onChange={(event) => {
                  setSection(event.target.value);
                  setPreview(null);
                }}
                placeholder="e.g. 4CSD"
                className="w-full rounded-lg border border-[#005FD9]/20 px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#044FAF]/30 bg-[#F3F8FF] p-5 text-[#134687]">
            <FileUp className="h-6 w-6 text-[#044FAF]" />
            <span>
              <strong className="block text-sm">
                {file?.name || "Choose a class-list CSV"}
              </strong>
              <small className="text-[#134687]/55">
                Up to 2 MB · Student ID and name columns required
              </small>
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setPreview(null);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => void previewCsv()}
            disabled={!file || previewing || importing}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#005FD9]/15 px-4 py-2.5 text-sm font-semibold text-[#134687] disabled:opacity-50"
          >
            {previewing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck2 className="h-4 w-4" />
            )}
            {previewing ? "Reading CSV…" : "Preview normalized rows"}
          </button>

          {preview && (
            <div className="mt-5 space-y-4 border-t border-[#005FD9]/10 pt-5">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <span className="rounded-lg bg-[#F3F8FF] p-2">
                  <strong className="block text-lg text-[#044FAF]">
                    {preview.studentCount}
                  </strong>
                  students
                </span>
                <span className="rounded-lg bg-[#F3F8FF] p-2">
                  <strong className="block text-lg text-[#8A5A00]">
                    {warningCount}
                  </strong>
                  warnings
                </span>
                <span className="rounded-lg bg-[#F3F8FF] p-2">
                  <strong className="block text-lg text-red-700">
                    {errorCount}
                  </strong>
                  errors
                </span>
              </div>
              {preview.issues.length > 0 && (
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {preview.issues.map((issue, index) => (
                    <p
                      key={`${issue.code}-${issue.rowNumber}-${index}`}
                      className={`rounded-lg border p-2 text-xs ${issue.severity === "ERROR" ? "border-red-200 bg-red-50 text-red-700" : "border-[#B77900] bg-white text-[#8A5A00]"}`}
                    >
                      <strong>
                        {issue.severity}
                        {issue.rowNumber ? ` · row ${issue.rowNumber}` : ""}:
                      </strong>{" "}
                      {issue.message}
                    </p>
                  ))}
                </div>
              )}
              <div className="max-h-72 overflow-auto rounded-lg border border-[#005FD9]/10">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="sticky top-0 bg-[#F3F8FF] font-mono uppercase text-[#134687]/60">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Student number</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#005FD9]/5">
                    {preview.students.map((student) => (
                      <tr key={`${student.studentNumber}-${student.rowNumber}`}>
                        <td className="px-3 py-2">{student.rowNumber}</td>
                        <td className="px-3 py-2 font-mono">
                          {student.studentNumber}
                        </td>
                        <td className="px-3 py-2 font-semibold text-[#134687]">
                          {student.fullName}
                        </td>
                        <td className="px-3 py-2">{student.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => void importCsv()}
                disabled={!preview.canImport || importing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#134687] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {importing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <UsersRound className="h-4 w-4" />
                )}
                {importing
                  ? "Importing…"
                  : `Import ${preview.studentCount} students`}
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-xl bg-[#E8F2FF] p-2 text-[#044FAF]">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#044FAF]/60">
                Missing from CSV
              </p>
              <h3 className="font-poppins font-bold text-[#134687]">
                Add one student
              </h3>
            </div>
          </div>
          <form onSubmit={addStudent} className="space-y-3">
            <ImportField
              label="Student number"
              name="studentNumber"
              placeholder="2026123456"
              inputMode="numeric"
            />
            <ImportField
              label="Full name"
              name="fullName"
              placeholder="Juan Dela Cruz"
            />
            <ImportField label="Section" name="section" placeholder="4CSD" />
            <button
              type="submit"
              disabled={adding || !cycleId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#134687] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {adding ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {adding ? "Adding…" : "Add student"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-poppins font-bold text-[#134687]">
              Current imported roster
            </h3>
            <p className="text-xs text-[#134687]/55">
              {guests.filter((guest) => guest.isActive).length} active students
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadGuests()}
            className="rounded-lg border border-[#005FD9]/15 px-3 py-2 text-xs font-semibold text-[#134687]"
          >
            Refresh
          </button>
        </div>
        {loadingGuests ? (
          <div className="flex justify-center py-10">
            <LoaderCircle className="h-6 w-6 animate-spin text-[#044FAF]" />
          </div>
        ) : guests.length ? (
          <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-[#005FD9]/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 bg-[#F3F8FF] font-mono text-[10px] uppercase text-[#134687]/55">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Student number</th>
                  <th className="px-3 py-2">Section</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#005FD9]/5">
                {guests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="px-3 py-2 font-semibold text-[#134687]">
                      {guest.fullName}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {guest.studentNumber}
                    </td>
                    <td className="px-3 py-2">{guest.section || "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${guest.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {guest.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[#134687]/55">
            No students imported for this academic year.
          </p>
        )}
      </section>
    </div>
  );
}

function ImportField({
  label,
  name,
  placeholder,
  inputMode,
}: {
  label: string;
  name: string;
  placeholder: string;
  inputMode?: "numeric";
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold text-[#134687]">
        {label}
      </span>
      <input
        name={name}
        required
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        className="w-full rounded-lg border border-[#005FD9]/20 px-3 py-2.5 text-sm outline-none focus:border-[#044FAF]"
      />
    </label>
  );
}
