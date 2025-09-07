"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function SchedulePage() {
  const router = useRouter();
  const { "eb-role": ebRole } = useParams<{ "eb-role": string }>();
  const ebId = ebRole;

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
          endTime.setMinutes(endTime.getMinutes() + 30);

          const slotId = `${dateStr}-${timeStr}`;
          const isBooked = daySchedule.bookedSlots.includes(timeStr);

          slots.push({
            id: slotId,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            date: dateStr,
            time: timeStr,
            isBooked: isBooked,
          });
        });
      });

      return slots;
    };

    const slots = generateAdminSlots();
    setAvailableSlots(slots);

    // Group slots by date
    const grouped = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    }, {} as Record<string, typeof slots>);

    setGroupedSlots(grouped);
    setIsLoading(false);
  }, []);

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleSubmitClick = () => {
    if (selectedSlot) {
      setShowModal(true);
    }
  };

  const handleConfirmSchedule = async () => {
    if (selectedSlot) {
      setIsSubmitting(true);
      try {
        // TODO: Re-enable API call when backend is ready
        // const response = await fetch("/api/schedule-interview", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     slotId: selectedSlot,
        //     ebId: ebId,
        //     applicationType: "executive-assistant",
        //   }),
        // });

        // Mock successful response for frontend development
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({ success: true, error: null }),
        };
        const response = mockResponse;

        if (response.ok) {
          const result = await response.json();
          setShowModal(false);

          // Store scheduled time for success page
          const selectedSlotData = availableSlots.find(
            (slot) => slot.id === selectedSlot
          );
          if (selectedSlotData) {
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

            // REF: for what ung localStorage
            localStorage.setItem(
              "scheduledTime",
              `${formattedDate} at ${formattedTime}`
            );
          }

          router.push(`/user/apply/executive-assistant/${ebId}/success`);
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        alert("Failed to submit application. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelSubmit = () => {
    setShowModal(false);
  };

  const executiveBoardRoles = [
    {
      id: "president",
      title: "President",
      description:
        "Serves as the leader and representative of the Computer Science Society. They guide the organization's vision, oversee all operations, and ensure that every project and initiative aligns with the org's goals. The President also represents CSS in college and university-wide councils, making sure the voices of members are heard at every level.",
      ebName: "Genna Cervantes",
    },
    {
      id: "internal-vice-president",
      title: "Internal Vice President",
      description:
        "Manages the internal structure and daily operations of CSS. They coordinate with committees, monitor staff performance, and provide support to ensure smooth execution of events and projects. Acting as the President's right hand, the Internal VP ensures that the organization runs efficiently from the inside.",
      ebName: "Mar Vincent De Guzman",
    },
    {
      id: "external-vice-president",
      title: "External Vice President",
      description:
        "Handles the org's outreach and partnerships. They build and maintain relationships with external organizations, other student groups, and industry partners. Their role strengthens CSS's network beyond the society itself, creating opportunities for collaboration, exposure, and growth.",
      ebName: "Christian Bhernan Buenagua",
    },
    {
      id: "secretary",
      title: "Secretary",
      description:
        "Serves as the custodian of records and communication. They document meetings, handle correspondences, and maintain the official files of the organization. With attention to detail and organization, the Secretary ensures that the society's operations are well-documented and transparent.",
      ebName: "Joevanni Paulo Gumban",
    },
    {
      id: "assistant-secretary",
      title: "Assistant Secretary",
      description:
        "Helps and supports the Secretary with paperwork, logistics, and record-keeping. They often manage attendance records, assist in preparing documents, and ensure that no detail is overlooked in the org's administrative work.",
      ebName: "Marian Therese Pineza",
    },
    {
      id: "treasurer",
      title: "Treasurer",
      description:
        "In charge of the society's financial health. They manage funds, prepare budgets, collect dues, and make financial reports. By ensuring transparency and accountability, the Treasurer helps sustain CSS activities while maximizing resources for its members.",
      ebName: "Braven Rei Goodwin",
    },
    {
      id: "auditor",
      title: "Auditor",
      description:
        "Acts as the org's financial watchdog. They review reports, check transactions, and ensure that all financial activities are ethical and accurate. Their role keeps the organization's operations transparent and trustworthy.",
      ebName: "Kendrick Beau Calvo",
    },
    {
      id: "public-relations-officer",
      title: "Public Relations Officer (PRO)",
      description:
        "Takes charge of publicity, branding, and communications. They create captions, manage social media presence, and oversee promotional campaigns to keep CSS visible and engaging. With creativity and consistency, the PRO ensures that every announcement and publication reflects the identity of the society.",
      ebName: "Nigel Roland Anunciacion",
    },
    {
      id: "representative-4th-year",
      title: "4th Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "Alexandra Antonette Palanog",
    },
    {
      id: "representative-3rd-year",
      title: "3rd Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "Nikolas Josef Dalisay",
    },
    {
      id: "representative-2nd-year",
      title: "2nd Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "Chrisry Clerry Hermoso",
    },
    {
      id: "representative-1st-year",
      title: "1st Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "John Carlo Benter",
    },
    {
      id: "chief-of-staff",
      title: "Chief of Staff",
      description:
        "Leads the pool of staff and executive assistants, making sure manpower is allocated properly during events and projects. They coordinate with the EB to deliver logistical support and ensure that every mission is carried out smoothly.",
      ebName: "Carylle Keona Ilano",
    },
    {
      id: "director-digital-productions",
      title: "Director for Digital Productions",
      description:
        "Oversees the creative and multimedia output of CSS. From posters to videos, they ensure that the society's visuals are engaging, professional, and aligned with its branding.",
      ebName: "Charmaine Chesca Villalobos",
    },
    {
      id: "director-community-development",
      title: "Director for Community Development",
      description:
        "Leads the org's outreach and social responsibility initiatives. They plan and execute projects that extend beyond academics, nurturing compassion, empathy, and service within the CSS community.",
      ebName: "Zeandarra Gaile Giva",
    },
    {
      id: "thomasian-wellness-advocate",
      title: "Thomasian Wellness Advocate (TWA)",
      description:
        "Champions the holistic well-being of members and students. They promote mental health, wellness programs, and activities that help balance academic life with personal growth. By fostering a supportive environment, the TWA ensures that the CSS community thrives not just academically, but also in well-being.",
      ebName: "Andrea Pauline Tan",
    },
  ];

  const selectedEB = executiveBoardRoles.find((role) => role.id === ebId);

  if (!selectedEB) {
    return (
      <section className="min-h-screen bg-[rgb(243,243,253)]">
        <div className="flex flex-col justify-center items-center px-50 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-inter font-bold text-black mb-4">
              Executive Board role not found
            </h1>
            <button
              onClick={() => router.push("/user/apply/executive-assistant")}
              className="bg-[#044FAF] text-white px-6 py-3 rounded-md font-inter font-normal text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[rgb(243,243,253)]">
      {/* REF: gawing component */}
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
            <span className="text-black">
              Apply as Executive Assistant for{" "}
            </span>
            <span className="text-[#134687]">{selectedEB.title}</span>
          </div>

          <div className="text-black text-md font-Inter font-light text-justify mb-8">
            {selectedEB.description}
          </div>

          <hr className="my-8 border-t-1 border-[#717171]" />

          <div className="w-full flex flex-col items-center justify-center mb-8">
            <div className="flex items-center">
              <div
                onClick={() => router.push("/user/apply/executive-assistant")}
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
                    `/user/apply/executive-assistant/application?eb=${ebId}`
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
              onClick={() =>
                router.push(
                  `/user/apply/executive-assistant/${ebId}/application`
                )
              }
              className="bg-[#E7E3E3] text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#CDCCCC] transition-all duration-150 active:scale-95"
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

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={handleCancelSubmit}
        >
          <div
            className="bg-white rounded-2xl p-10 max-w-xl w-full mx-4 shadow-2xl border-[#FFBC2B] border-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-6">
                <div className="p-3 mx-auto flex items-center justify-center h-15 w-15 rounded-full bg-[#FFE7B4] mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="35"
                    viewBox="0 0 34 35"
                    fill="none"
                  >
                    <path
                      d="M1.57861 30.0413L16.8044 3.74219L32.0303 30.0413H1.57861ZM16.8044 25.8888C17.1966 25.8888 17.5256 25.756 17.7914 25.4902C18.0571 25.2244 18.1895 24.8959 18.1886 24.5047C18.1877 24.1134 18.0548 23.7849 17.79 23.5192C17.5251 23.2534 17.1966 23.1205 16.8044 23.1205C16.4123 23.1205 16.0838 23.2534 15.8189 23.5192C15.5541 23.7849 15.4212 24.1134 15.4203 24.5047C15.4194 24.8959 15.5522 25.2249 15.8189 25.4916C16.0856 25.7583 16.4141 25.8907 16.8044 25.8888ZM15.4203 21.7364H18.1886V14.8155H15.4203V21.7364Z"
                      fill="#CE9823"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-xl font-inter font-bold text-[#CE9823]">
                    Confirm Interview Schedule
                  </h3>
                  <p className="font-inter text-sm text-black mb-6">
                    Are you sure you want to schedule your interview for{" "}
                    {(() => {
                      const selectedSlotData = availableSlots.find(
                        (slot) => slot.id === selectedSlot
                      );
                      if (selectedSlotData) {
                        const date = new Date(selectedSlotData.date);
                        const formattedDate = date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                        return (
                          <>
                            <span className="font-semibold">
                              {formattedDate}
                            </span>{" "}
                            at{" "}
                            <span className="font-semibold">
                              {(() => {
                                // Assume selectedSlotData.time is in "HH:mm" 24-hour format
                                const [hourStr, minute] =
                                  selectedSlotData.time.split(":");
                                let hour = parseInt(hourStr, 10);
                                const ampm = hour >= 12 ? "pm" : "am";
                                hour = hour % 12;
                                if (hour === 0) hour = 12;
                                return `${hour}:${minute} ${ampm}`;
                              })()}
                            </span>
                          </>
                        );
                      }
                      return (
                        <span className="font-semibold">
                          Selected time slot
                        </span>
                      );
                    })()}
                    ?
                  </p>
                </div>
              </div>
              <div className="bg-[#ECECEC] border-[#C8C5C5] border-1 rounded-lg px-14 py-9 mb-6 text-justify">
                <p className="font-inter text-sm text-[#CE9823] font-bold mb-2">
                  Note:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-black font-inter">
                  <li>
                    Once confirmed, this schedule will be final and cannot be
                    changed.
                  </li>
                  <li>Failure to attend may affect your application status.</li>
                  <li>
                    Please ensure you are available and prepared at the
                    scheduled time.
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelSubmit}
                  disabled={isSubmitting}
                  className="px-9 py-2 bg-[#E7E3E3] text-black rounded-2xl font-inter font-semibold text-sm hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSchedule}
                  disabled={isSubmitting}
                  className="px-9 py-2 bg-[#FFBC2B] text-[#5B4515] rounded-full font-inter font-semibold text-sm hover:bg-[#D9A129] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
