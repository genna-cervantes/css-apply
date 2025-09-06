"use client";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { useMemo, useState, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
export default function SchedulePage() {
  const router = useRouter();
  const { committee: committeeId } = useParams<{ committee: string }>();

  // State for scheduling
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    Array<{
      id: string;
      start: string;
      end: string;
      date: string;
      time: string;
      isBooked: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedSlots, setGroupedSlots] = useState<
    Record<
      string,
      Array<{
        id: string;
        start: string;
        end: string;
        date: string;
        time: string;
        isBooked: boolean;
      }>
    >
  >({});

  // Generate sample admin-created available slots
  useEffect(() => {
    const generateAdminSlots = () => {
      const slots: Array<{
        id: string;
        start: string;
        end: string;
        date: string;
        time: string;
        isBooked: boolean;
      }> = [];
      const today = new Date();

      // Admin has set up specific available times for September 15-26, 2024 (including weekends)
      const adminSchedule = [
        // September 16 (Tuesday)
        {
          date: new Date(2025, 8, 16),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["09:30", "13:00", "15:00"],
        },
        // September 17 (Wednesday)
        {
          date: new Date(2025, 8, 17),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
            "16:30",
          ],
          bookedSlots: ["10:30", "12:00", "14:00", "16:30"],
        },
        // September 18 (Thursday)
        {
          date: new Date(2025, 8, 18),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["09:00", "11:00", "15:30"],
        },
        // September 19 (Friday)
        {
          date: new Date(2025, 8, 19),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
            "16:30",
          ],
          bookedSlots: ["09:30", "11:30", "13:00", "15:00"],
        },
        // September 20 (Saturday)
        {
          date: new Date(2025, 8, 20),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["10:00", "14:30"],
        },
        // September 21 (Sunday)
        {
          date: new Date(2025, 8, 21),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["10:00", "14:30"],
        },
        // September 22 (Monday)
        {
          date: new Date(2025, 8, 22),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
            "16:30",
          ],
          bookedSlots: ["10:00", "14:30", "16:00"],
        },
        // September 23 (Tuesday)
        {
          date: new Date(2025, 8, 23),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["09:30", "13:00", "15:00"],
        },
        // September 24 (Wednesday)
        {
          date: new Date(2025, 8, 24),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "12:00",
            "12:30",
            "13:00",
            "13:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
            "16:00",
            "16:30",
          ],
          bookedSlots: ["10:30", "12:00", "14:00", "16:30"],
        },
        // September 25 (Thursday)
        {
          date: new Date(2025, 8, 25),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["09:00", "11:00", "15:30"],
        },
        // September 26 (Friday)
        {
          date: new Date(2025, 8, 26),
          availableTimes: [
            "09:00",
            "09:30",
            "10:00",
            "10:30",
            "11:00",
            "11:30",
            "14:00",
            "14:30",
            "15:00",
            "15:30",
          ],
          bookedSlots: ["10:00", "14:30"],
        },
      ];

      adminSchedule.forEach((daySchedule) => {
        // Ensure we get the correct date string regardless of timezone
        const year = daySchedule.date.getFullYear();
        const month = String(daySchedule.date.getMonth() + 1).padStart(2, "0");
        const day = String(daySchedule.date.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        daySchedule.availableTimes.forEach((timeStr) => {
          const [hour, minute] = timeStr.split(":").map(Number);
          const startTime = new Date(daySchedule.date);
          startTime.setHours(hour, minute, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + 30);

          const isBooked = daySchedule.bookedSlots.includes(timeStr);

          slots.push({
            id: `${dateStr}-${timeStr}`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            date: dateStr,
            time: timeStr,
            isBooked: isBooked,
          });
        });
      });

      setAvailableSlots(slots);

      // Group slots by date
      const grouped = slots.reduce(
        (acc, slot) => {
          if (!acc[slot.date]) {
            acc[slot.date] = [];
          }
          acc[slot.date].push(slot);
          return acc;
        },
        {} as Record<
          string,
          Array<{
            id: string;
            start: string;
            end: string;
            date: string;
            time: string;
            isBooked: boolean;
          }>
        >
      );

      setGroupedSlots(grouped);
      setIsLoading(false);
    };

    generateAdminSlots();
  }, []);

  const handleSlotSelect = (slotId: string) => {
    if (selectedSlot === slotId) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slotId);
    }
  };

  const handleConfirmSchedule = () => {
    if (selectedSlot) {
      // In a real app, this would make an API call to book the slot
      alert(
        `Interview scheduled for ${
          availableSlots.find((slot) => slot.id === selectedSlot)?.date
        } at ${availableSlots.find((slot) => slot.id === selectedSlot)?.time}`
      );
      // You could redirect to a confirmation page or show a success message
    }
  };

  const committeeRoles = [
    {
      id: "academics",
      title: "Academics",
      description:
        "This committee is dedicated to enhancing the academic environment within the CSS organization. It provides reviewers and organizes tutorials to support CSS students. Additionally, the committee organizes academic-related events, such as quiz bees and programming contests, fostering a vibrant intellectual community.",
    },
    {
      id: "community",
      title: "Community Development",
      description:
        "This committee works towards improving and sustaining the well-being of the local community. They devise and implement community-based projects and events that foster social interaction, civic engagement, and community empowerment. It may focus on areas such as housing, employment, health services, or environmental initiatives.",
    },
    {
      id: "creatives",
      title: "Creatives & Technical",
      description:
        "This committee oversees the design and production of all creative outputs of the organization, including digital graphics, promotional materials, and event decoration. The technical side of the committee ensures that all technical needs for events and operations, like sound and lighting systems, are catered for.",
    },
    {
      id: "documentation",
      title: "Documentation",
      description:
        "This committee is responsible for photojournalism, documenting all the activities and events of the organization. Their work ensures that the organization's achievements and memorable moments are captured and preserved for posterity.",
    },
    {
      id: "external",
      title: "External Affairs",
      description:
        "This committee manages relationships and communications with entities outside the organization. This includes liaising with other organizations, government bodies, sponsors, and the media. It also handles public relations, partnership development, and conflict resolution.",
    },
    {
      id: "finance",
      title: "Finance",
      description:
        "This committee oversees the organization's budgeting, expenditure, and revenue generation. It also provides financial advice to the organization, ensures fiscal responsibility, and conducts regular audits for transparency and accountability.",
    },
    {
      id: "logistics",
      title: "Logistics",
      description:
        "This committee manages and maintains all properties owned by the organization. It keeps a thorough record of all expenses related to CSS activities and properties, ensuring transparency and accountability in the organization's financial operations.",
    },
    {
      id: "publicity",
      title: "Publicity",
      description:
        "This committee manages all promotional activities for the organization. It is responsible for creating and implementing marketing strategies, managing social media platforms, and publicizing events and activities to target audiences.",
    },
    {
      id: "sports",
      title: "Sports & Talent",
      description:
        "This committee organizes and oversees all sports-related and talent activities within the organization. It may coordinate sporting events, talent shows, or workshops and ensure the organization's members have opportunities to develop and showcase their talents.",
    },
    {
      id: "technology",
      title: "Technology Development",
      description:
        "This committee is responsible for spearheading all technology-related projects and events within the organization. Key tasks include creating and maintaining the CSS website, implementing new technologies to streamline organizational operations, and organizing tech-focused workshops or seminars to enhance the digital skills of the members.",
    },
  ];

  const selectedCommittee = committeeRoles.find(
    (role) => role.id === committeeId
  );

  if (!selectedCommittee) {
    return (
      <section className="min-h-screen bg-[rgb(243,243,253)]">
        <div className="flex flex-col justify-center items-center px-50 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-inter font-bold text-black mb-4">
              Committee not found
            </h1>
            <button
              onClick={() => router.push("/user/apply/committee-staff")}
              className="bg-[#044FAF] text-white px-6 py-3 rounded-md font-inter font-normal text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
            >
              Back to Committee Selection
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[rgb(243,243,253)]">
      <header className="flex p-5 items-center justify-between shadow-md shadow-black/40 bg-white">
        <Image
          src="/assets/logos/Logo_CSS Apply.svg"
          alt="CSS Apply Logo"
          width={110}
          height={190}
          className="drop-shadow-md"
        />
        <div className="flex items-center gap-4">
          <button className="bg-[#134687] font-inter text-xs text-white px-8 py-2 rounded-sm transition-all duration-150 active:scale-95">
            Log Out
          </button>
        </div>
      </header>

      <div className="flex flex-col justify-center items-center px-50 py-20">
        <div className="rounded-[24px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-28  w-full">
          <div className="text-4xl font-raleway font-semibold mb-4">
            <span className="text-black">Apply for </span>
            <span className="text-[#134687]">
              {selectedCommittee.title} Committee
            </span>
          </div>

          <div className="text-black text-md font-Inter font-light text-justify mb-8">
            {selectedCommittee.description}
          </div>

          <hr className="my-8 border-t-1 border-[#717171]" />

          <div className="w-full flex flex-col items-center justify-center mb-8">
            <div className="flex items-center">
              <div
                onClick={() => router.push("/user/apply/committee-staff")}
                className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10 cursor-pointer hover:bg-[#DAE2ED] transition-colors"
              >
                <span className="text-[#696767] text-xs font-bold font-inter">
                  1
                </span>
              </div>
              <div className="w-24 h-[3px] bg-[#D9D9D9]" />
              <div
                onClick={() =>
                  router.push(
                    `/user/apply/committee-staff/${committeeId}/application`
                  )
                }
                className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10 cursor-pointer hover:bg-[#DAE2ED] transition-colors"
              >
                <span className="text-[#696767] text-xs font-bold font-inter">
                  2
                </span>
              </div>
              <div className="w-24 h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-10 h-10">
                <span className="text-white text-xs font-bold font-inter">
                  3
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 w-100 mt-3 gap-x-0 place-items-center font-inter font-medium">
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Select a Role
              </span>
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Enter Information
              </span>
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Schedule Interview
              </span>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="mb-8">
            <p className="text-black font-bold text-center mb-6 font-inter">
              Click on any colorless slot to reserve your interview schedule.
            </p>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134687]"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Calendar Grid Schedule View */}
                <div className="space-y-4">
                  {Object.keys(groupedSlots).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-inter">
                      No available slots at the moment. Please check back later.
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-[#164E96] overflow-hidden">
                      {/* Calendar Grid Container */}
                      <div className="overflow-x-auto divide-y divide-[#164E96]">
                        {/* Header Row */}
                        <div className="flex min-w-max">
                          {/* Time column header */}
                          <div className="sticky left-0 bg-white z-10 p-3 font-inter font-semibold text-sm text-gray-700 flex items-center justify-center text-center w-[100px] flex-shrink-0 shadow-[8px_0_16px_-2px_rgba(0,0,0,0.40)]">
                            Time
                          </div>

                          {/* Day headers container */}
                          <div className="flex flex-1 divide-x divide-[#164E96] border-l border-[#164E96]">
                            {Object.entries(groupedSlots)
                              .sort(
                                ([a], [b]) =>
                                  new Date(a).getTime() - new Date(b).getTime()
                              )
                              .map(([date, slots]) => {
                                const dayDate = new Date(date);
                                const dayName = dayDate.toLocaleDateString(
                                  "en-US",
                                  { weekday: "short" }
                                );
                                const dayNumber = dayDate.getDate();

                                return (
                                  <div
                                    key={date}
                                    className="bg-[#164E96] p-3 text-center flex-1 min-w-[100px]"
                                  >
                                    <div className="font-inter font-semibold text-sm text-white">
                                      {dayName}
                                    </div>
                                    <div className="font-inter text-xs text-white">
                                      {dayNumber}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Time slot rows */}
                        {(() => {
                          // Generate all possible time slots from 7 AM to 9 PM in 30-minute increments
                          const allTimeSlots = [];
                          for (let hour = 7; hour < 21; hour++) {
                            for (let minute = 0; minute < 60; minute += 30) {
                              const timeStr = `${hour
                                .toString()
                                .padStart(2, "0")}:${minute
                                .toString()
                                .padStart(2, "0")}`;
                              const endHour = minute === 30 ? hour + 1 : hour;
                              const endMinute = minute === 30 ? 0 : 30;
                              const endTimeStr = `${endHour
                                .toString()
                                .padStart(2, "0")}:${endMinute
                                .toString()
                                .padStart(2, "0")}`;

                              allTimeSlots.push({
                                time: timeStr,
                                endTime: endTimeStr,
                                displayTime: `${
                                  hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                                }:${minute.toString().padStart(2, "0")} ${
                                  hour >= 12 ? "PM" : "AM"
                                }`,
                                endDisplayTime: `${
                                  endHour > 12
                                    ? endHour - 12
                                    : endHour === 0
                                    ? 12
                                    : endHour
                                }:${endMinute.toString().padStart(2, "0")} ${
                                  endHour >= 12 ? "PM" : "AM"
                                }`,
                              });
                            }
                          }

                          return allTimeSlots.map((timeSlot, timeIndex) => (
                            <div key={timeIndex} className="flex min-w-max">
                              {/* Time label */}
                              <div className="sticky left-0 bg-white z-10 p-3 text-center w-[100px] flex-shrink-0 shadow-[10px_0_12px_-0px_rgba(0,0,0,0.4)]">
                                <div className="font-inter text-sm text-gray-700">
                                  {timeSlot.displayTime} -
                                </div>
                                <div className="font-inter text-xs text-gray-500">
                                  {timeSlot.endDisplayTime}
                                </div>
                              </div>

                              {/* Day columns container */}
                              <div className="flex flex-1 divide-x divide-[#164E96] border-l border-[#164E96]">
                                {Object.entries(groupedSlots)
                                  .sort(
                                    ([a], [b]) =>
                                      new Date(a).getTime() -
                                      new Date(b).getTime()
                                  )
                                  .map(([date, slots]) => {
                                    const slotForThisTime = slots.find(
                                      (slot) => slot.time === timeSlot.time
                                    );
                                    const isAvailable =
                                      slotForThisTime &&
                                      !slotForThisTime.isBooked;
                                    const isSelected =
                                      selectedSlot === slotForThisTime?.id;

                                    return (
                                      <div
                                        key={date}
                                        className="min-h-[60px] flex-1 min-w-[100px]"
                                      >
                                        {slotForThisTime ? (
                                          <button
                                            onClick={() =>
                                              isAvailable
                                                ? handleSlotSelect(
                                                    slotForThisTime.id
                                                  )
                                                : null
                                            }
                                            disabled={!isAvailable}
                                            className={`w-full h-full p-2 transition-all duration-200 ${
                                              !isAvailable
                                                ? "bg-[#164E96] cursor-not-allowed"
                                                : isSelected
                                                ? "bg-green-500 text-white"
                                                : "bg-white hover:bg-blue-50 cursor-pointer"
                                            }`}
                                          >
                                            {isSelected && (
                                              <div className="font-inter text-xs font-semibold">
                                                Selected
                                              </div>
                                            )}
                                          </button>
                                        ) : (
                                          <div className="w-full h-full bg-[#164E96]"></div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-gray-500 font-inter mt-4">
                    Once a timeslot is selected, it will be reserved under your
                    name. Changes are not allowed after confirmation.
                  </div>
                </div>
              </div>
            )}
          </div>
          <hr className="my-8 border-t-1 border-[#717171]" />

          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => router.push("/user/apply/committee-staff")}
              className="bg-gray-300 text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-gray-400 transition-all duration-150 active:scale-95"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/user/apply/committee-staff/${committeeId}/schedule`
                )
              }
              className="whitespace-nowrap font-inter text-sm font-semibold text-[#134687] px-15 py-3 rounded-lg border-2 border-[#134687] bg-white hover:bg-[#B1CDF0] transition-all duration-150 active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <footer className="w-full mt-16 py-8 pl-20 pr-20 bg-[#044FAF] text-white flex flex-row gap-100 items-start border-b-10 border-[#287FEB]">
        <div className="flex flex-col">
          <Image
            src="/assets/logos/Logo_CSS.svg"
            alt="A descriptive alt text for your image"
            width={60}
            height={60}
          />
          <div className="font-inter text-4xl font-semibold">
            Computer Science Society
          </div>
          <div className="font-inter text-sm font-thin italic mb-2">
            The mother organization of the Computer Science Department
          </div>
          <div className="font-inter text-xs mb-2 mt-5">
            © {new Date().getFullYear()} Computer Science Society. All rights
            reserved.
          </div>
        </div>
        <div className="flex flex-col mt-10 font-inter">
          <div className="text-lg font-semibold mb-2">Partner with us:</div>
          <div className="flex flex-col items-start">
            <a
              href="mailto:css.cics@ust.edu.ph"
              className="flex items-center gap-2 text-sm mb-1 font-light hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20.1 4H4.9C3.855 4 3.0095 4.95625 3.0095 6.125L3 18.875C3 20.0438 3.855 21 4.9 21H20.1C21.145 21 22 20.0438 22 18.875V6.125C22 4.95625 21.145 4 20.1 4ZM20.1 8.25L12.5 13.5625L4.9 8.25V6.125L12.5 11.4375L20.1 6.125V8.25Z"
                  fill="white"
                />
              </svg>
              <span className="flex items-center h-6">css.cics@ust.edu.ph</span>
            </a>
            <a
              href="https://www.facebook.com/ustcss"
              className="flex items-center gap-2 text-sm mb-1 font-light hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M22.9167 12.4997C22.9167 6.74967 18.25 2.08301 12.5 2.08301C6.75004 2.08301 2.08337 6.74967 2.08337 12.4997C2.08337 17.5413 5.66671 21.7393 10.4167 22.708V15.6247H8.33337V12.4997H10.4167V9.89551C10.4167 7.88509 12.0521 6.24967 14.0625 6.24967H16.6667V9.37467H14.5834C14.0105 9.37467 13.5417 9.84343 13.5417 10.4163V12.4997H16.6667V15.6247H13.5417V22.8643C18.8021 22.3434 22.9167 17.9059 22.9167 12.4997Z"
                  fill="white"
                />
              </svg>
              <span className="flex items-center h-6">
                UST Computer Science Society
              </span>
            </a>
            <a
              href="https://www.instagram.com/ustcss"
              className="flex items-center gap-2 text-sm mb-1 font-light hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M16.6667 3.125C18.048 3.125 19.3728 3.67373 20.3495 4.65049C21.3263 5.62724 21.875 6.952 21.875 8.33333V16.6667C21.875 18.048 21.3263 19.3728 20.3495 20.3495C19.3728 21.3263 18.048 21.875 16.6667 21.875H8.33333C6.952 21.875 5.62724 21.3263 4.65049 20.3495C3.67373 19.3728 3.125 18.048 3.125 16.6667V8.33333C3.125 6.952 3.67373 5.62724 4.65049 4.65049C5.62724 3.67373 6.952 3.125 8.33333 3.125H16.6667ZM12.5 8.33333C11.3949 8.33333 10.3351 8.77232 9.55372 9.55372C8.77232 10.3351 8.33333 11.3949 8.33333 12.5C8.33333 13.6051 8.77232 14.6649 9.55372 15.4463C10.3351 16.2277 11.3949 16.6667 12.5 16.6667C13.6051 16.6667 14.6649 16.2277 15.4463 15.4463C16.2277 14.6649 16.6667 13.6051 16.6667 12.5C16.6667 11.3949 16.2277 10.3351 15.4463 9.55372C14.6649 8.77232 13.6051 8.33333 12.5 8.33333ZM12.5 10.4167C13.0525 10.4167 13.5824 10.6362 13.9731 11.0269C14.3638 11.4176 14.5833 11.9475 14.5833 12.5C14.5833 13.0525 14.3638 13.5824 13.9731 13.9731C13.5824 14.3638 13.0525 14.5833 12.5 14.5833C11.9475 14.5833 11.4176 14.3638 11.0269 13.9731C10.6362 13.5824 10.4167 13.0525 10.4167 12.5C10.4167 11.9475 10.6362 11.4176 11.0269 11.0269C11.4176 10.6362 11.9475 10.4167 12.5 10.4167ZM17.1875 6.77083C16.9112 6.77083 16.6463 6.88058 16.4509 7.07593C16.2556 7.27128 16.1458 7.53623 16.1458 7.8125C16.1458 8.08877 16.2556 8.35372 16.4509 8.54907C16.6463 8.74442 16.9112 8.85417 17.1875 8.85417C17.4638 8.85417 17.7287 8.74442 17.9241 8.54907C18.1194 8.35372 18.2292 8.08877 18.2292 7.8125C18.2292 7.53623 18.1194 7.27128 17.9241 7.07593C17.7287 6.88058 17.4638 6.77083 17.1875 6.77083Z"
                  fill="white"
                />
              </svg>
              <span className="flex items-center h-6">@ustcss</span>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
