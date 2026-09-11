"use client";

import { CalendarDays, QrCode, Upload, UsersRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import AdminContentLoading from "@/components/AdminContentLoading";
import MobileSidebar from "@/components/AdminMobileSB";
import SidebarContent from "@/components/AdminSidebar";
import AttendanceEventsPanel from "@/components/attendance/AttendanceEventsPanel";
import AttendanceImportPanel from "@/components/attendance/AttendanceImportPanel";
import AttendanceScannerPanel from "@/components/attendance/AttendanceScannerPanel";
import type { AttendanceCycle, AttendanceEvent } from "@/types/attendance";

type Tab = "events" | "check-in" | "import";

export default function AttendanceAdminPage() {
  const { status } = useSession();
  const [tab, setTab] = useState<Tab>("events");
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [cycles, setCycles] = useState<AttendanceCycle[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/attendance/events", {
        cache: "no-store",
      });
      const body = (await response.json()) as {
        error?: string;
        events?: AttendanceEvent[];
        cycles?: AttendanceCycle[];
        canManage?: boolean;
      };
      if (!response.ok) {
        throw new Error(body.error || "Attendance events could not be loaded");
      }
      setEvents(body.events || []);
      setCycles(body.cycles || []);
      setCanManage(Boolean(body.canManage));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Attendance events could not be loaded",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") void loadEvents();
  }, [loadEvents, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F3FD]">
        <AdminContentLoading description="Loading attendance tools..." />
      </div>
    );
  }

  const tabs: Array<{
    id: Tab;
    label: string;
    icon: typeof CalendarDays;
    visible: boolean;
  }> = [
    { id: "events", label: "Events", icon: CalendarDays, visible: true },
    { id: "check-in", label: "Check-in", icon: QrCode, visible: true },
    {
      id: "import",
      label: "Import students",
      icon: Upload,
      visible: canManage,
    },
  ];

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F3F3FD] bg-[url('/assets/css-apply-static-images/assets/pictures/background.webp')] bg-cover bg-repeat">
      <MobileSidebar>
        <SidebarContent activePage="attendance" />
      </MobileSidebar>

      <main className="h-screen flex-1 overflow-y-auto p-5 pt-28 sm:p-6 md:p-8 md:pt-12">
        <header className="mb-6 mt-2 md:mt-8">
          <div className="mb-4 flex w-fit items-center gap-3 rounded-[45px] bg-linear-to-r from-[#2F7EE3] to-[#0349A2] px-6 py-3 text-white lg:px-8 lg:py-4">
            <QrCode className="h-5 w-5 lg:h-7 lg:w-7" />
            <h1 className="font-poppins text-xl font-medium lg:text-4xl">
              Event Attendance
            </h1>
          </div>
          <p className="mb-4 max-w-3xl text-xs font-light leading-5 text-black lg:text-lg">
            Build event rosters from CSSApply members, committee staff,
            executive associates, and imported CS students, then scan their
            approved QR credentials.
          </p>
          <hr className="border-[#005FD9]" />
        </header>

        <nav
          className="mb-5 flex flex-wrap gap-2 rounded-xl border border-[#005FD9]/10 bg-white p-2"
          aria-label="Attendance sections"
        >
          {tabs
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${tab === item.id ? "bg-[#134687] text-white shadow-sm" : "text-[#134687] hover:bg-[#F3F8FF]"}`}
                  aria-current={tab === item.id ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {tab === "events" && (
          <AttendanceEventsPanel
            events={events}
            cycles={cycles}
            canManage={canManage}
            loading={loading}
            onReload={loadEvents}
            onCheckIn={(eventId) => {
              setSelectedEventId(eventId);
              setTab("check-in");
            }}
          />
        )}
        {tab === "check-in" && (
          <AttendanceScannerPanel
            events={events}
            initialEventId={selectedEventId}
            onAttendanceChange={loadEvents}
          />
        )}
        {tab === "import" && canManage && (
          <AttendanceImportPanel cycles={cycles} />
        )}

        {!loading && cycles.length === 0 && (
          <div className="mt-5 rounded-xl border border-[#B77900] bg-white p-4 text-sm text-[#8A5A00]">
            <UsersRound className="mr-2 inline h-4 w-4" />
            Create a recruitment cycle before configuring attendance events.
          </div>
        )}
      </main>
    </div>
  );
}
