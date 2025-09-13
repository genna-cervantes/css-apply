"use client";

import { useMemo, useState, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  // Generate sample admin-created available slots
  // REF: connect sa BE
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

  const handleSubmitClick = () => {
    if (selectedSlot) {
      setShowModal(true);
    }
  };

  const handleConfirmSchedule = async () => {
    if (selectedSlot) {
      const selectedSlotData = availableSlots.find(
        (slot) => slot.id === selectedSlot
      );

      if (!selectedSlotData) {
        alert("Selected slot not found");
        return;
      }

      setIsSubmitting(true);

      try {
        // Get the student number from the user's session or application data
        // You might need to store this in localStorage or get it from an API
        const userResponse = await fetch("/api/applications/committee-staff");
        let studentNumber = "";

        if (userResponse.ok) {
          const userData = await userResponse.json();
          studentNumber = userData.user?.studentNumber || "";
        }

        if (!studentNumber) {
          throw new Error("Student number not found");
        }

        // Call the schedule API
        const response = await fetch(
          "/api/applications/committee-staff/schedule",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              studentNumber,
              interviewSlotDay: selectedSlotData.date,
              interviewSlotTimeStart: selectedSlotData.time,
              interviewSlotTimeEnd: selectedSlotData.end,
            }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          setShowModal(false);

          // Store scheduled time for success page
          const date = new Date(selectedSlotData.date);
          const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const [hourStr, minute] = selectedSlotData.time.split(":");
          let hour = parseInt(hourStr, 10);
          const ampm = hour >= 12 ? "pm" : "am";
          hour = hour % 12;
          if (hour === 0) hour = 12;
          const formattedTime = `${hour}:${minute} ${ampm}`;

          localStorage.setItem(
            "scheduledTime",
            `${formattedDate} at ${formattedTime}`
          );

          router.push(`/user/apply/committee-staff/${committeeId}/success`);
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error("Error scheduling interview:", error);
        alert("Failed to schedule interview. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelSubmit = () => {
    setShowModal(false);
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
    <div className="min-h-screen bg-white sm:bg-[rgb(243,243,253)] flex flex-col justify-between">
      <Header />

      <section className="flex flex-col items-center justify-center my-12 lg:my-28">
        <div className="w-[80%] rounded-[24px]  sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] md:p-16 lg:py-20 lg:px-24">
          <div className="text-3xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
            <span className="text-black">Apply for </span>
            <span className="text-[#134687]">
              {selectedCommittee.title} Committee
            </span>
          </div>

          <div className="text-black text-xs lg:text-lg font-Inter font-light text-justify">
            {selectedCommittee.description}
          </div>

          <hr className="my-5 lg:my-8 border-t-1 border-[#717171]" />

          <div className="flex flex-col items-center justify-center">
            {/* Stepper */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex items-center">
                <div
                  onClick={() => router.push("/user/apply/committee-staff")}
                  className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-5 h-5 lg:w-10 lg:h-10 cursor-pointer hover:bg-[#DAE2ED] transition-colors"
                >
                  <span className="text-[#696767] text-[9px] lg:text-xs font-bold font-inter">
                    1
                  </span>
                </div>

                <div className="w-20 lg:w-24 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />

                <div
                  onClick={() =>
                    router.push(
                      `/user/apply/committee-staff/${committeeId}/application`
                    )
                  }
                  className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-5 h-5 lg:w-10 lg:h-10 cursor-pointer hover:bg-[#DAE2ED] transition-colors"
                >
                  <span className="text-[#696767] text-[9px] lg:text-xs font-bold font-inter">
                    2
                  </span>
                </div>

                <div className="w-20 lg:w-24 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />

                <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-5 h-5 lg:w-10 lg:h-10">
                  <span className="text-white text-[9px] lg:text-xs font-bold font-inter">
                    3
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 w-72 lg:w-100 mt-3 gap-x-0 place-items-center font-inter font-medium">
                <span className="text-[9px] lg:text-[11px] leading-none whitespace-nowrap text-center">
                  Select a Role
                </span>
                <span className="text-[9px] lg:text-[11px] leading-none whitespace-nowrap text-center">
                  Enter Information
                </span>
                <span className="text-[9px] lg:text-[11px] leading-none whitespace-nowrap text-center">
                  Schedule Interview
                </span>
              </div>
            </div>

            {/* Scheduling Section */}
            <div className="lg:mb-8 mt-5 lg:mt-8 flex flex-col items-center justify-center w-full">
              <p className="text-black text-xs lg:text-md font-bold text-center mb-3 lg:mb-6 font-inter">
                Click on any colorless slot to reserve your interview schedule.
              </p>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134687]"></div>
                </div>
              ) : (
                <div className="space-y-6 w-full">
                  {/* Calendar Grid Schedule View */}
                  {Object.keys(groupedSlots).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-inter">
                      No available slots at the moment. Please check back later.
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-[#164E96] overflow-hidden">
                      {/* Calendar Grid Container */}
                      <div className="overflow-x-auto divide-y divide-[#164E96]">
                        {/* Header Row */}
                        <div className="flex min-w-fit">
                          {/* Time column header */}
                          <div className="sticky left-0 bg-white z-10 p-3 font-inter font-semibold text-sm text-gray-700 flex items-center justify-center text-center w-[60px] lg:w-[100px] flex-shrink-0 shadow-[8px_0_16px_-2px_rgba(0,0,0,0.40)]">
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
                                    className="bg-[#164E96] p-3 text-center flex-1 w-[60px] lg:w-[100px]"
                                  >
                                    <div className="font-inter font-semibold text-sm text-white p-1">
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
                              <div className="sticky left-0 bg-white z-10 p-3 text-center w-[60px] lg:w-[100px] flex-shrink-0 shadow-[10px_0_12px_-0px_rgba(0,0,0,0.4)]">
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
                                        className="min-h-[60px] flex-1 w-[60px] lg:w-[100px]"
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
                                            className={`w-full h-full transition-all duration-200 ${
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
              )}
            </div>

            <hr className="my-8 border-t-1 border-[#717171]" />

            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/user/apply/committee-staff/${committeeId}/application`
                  )
                }
                className="hidden lg:block bg-[#E7E3E3] text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#CDCCCC] transition-all duration-150 active:scale-95"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={!selectedSlot}
                className={`whitespace-nowrap font-inter text-sm font-semibold px-15 py-3 rounded-lg border-2 transition-all duration-150 active:scale-95 ${
                  selectedSlot
                    ? "text-[#134687] border-[#134687] bg-white hover:bg-[#B1CDF0]"
                    : "text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed"
                }`}
              >
                {selectedSlot ? "Submit" : "Select a Time Slot"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
