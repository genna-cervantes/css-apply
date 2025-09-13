"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";

export default function CommitteeProgressPage() {
  const router = useRouter();
  const { committee: committeeId } = useParams<{ committee: string }>();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await fetch("/api/applications/committee-staff");
        if (response.ok) {
          const data = await response.json();
          setApplicationData(data);

          // Format the scheduled time if it exists
          if (
            data.application?.interviewSlotDay &&
            data.application?.interviewSlotTimeStart
          ) {
            const date = new Date(data.application.interviewSlotDay);
            const formattedDate = date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const [hourStr, minute] =
              data.application.interviewSlotTimeStart.split(":");
            let hour = parseInt(hourStr, 10);
            const ampm = hour >= 12 ? "pm" : "am";
            hour = hour % 12;
            if (hour === 0) hour = 12;
            const formattedTime = `${hour}:${minute} ${ampm}`;

            setScheduledTime(`${formattedDate} at ${formattedTime}`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch application data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, []);

  const committeeRoles = [
    {
      id: "academics",
      title: "Academics Committee",
    },
    {
      id: "community",
      title: "Community Development Committee",
    },
    {
      id: "creatives",
      title: "Creatives & Technical Committee",
    },
    {
      id: "documentation",
      title: "Documentation Committee",
    },
    {
      id: "external",
      title: "External Affairs Committee",
    },
    {
      id: "finance",
      title: "Finance Committee",
    },
    {
      id: "logistics",
      title: "Logistics Committee",
    },
    {
      id: "publicity",
      title: "Publicity Committee",
    },
    {
      id: "sports",
      title: "Sports & Talent Committee",
    },
    {
      id: "technology",
      title: "Technology Development Committee",
    },
  ];

  const selectedCommittee = committeeRoles.find(
    (role) => role.id === committeeId
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(243,243,253)] flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134687]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!applicationData || !applicationData.hasApplication) {
    return (
      <div className="min-h-screen bg-[rgb(243,243,253)] flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Application Found
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have an active committee application.
            </p>
            <button
              onClick={() => router.push("/user/apply/committee-staff")}
              className="bg-[#134687] hover:bg-[#0d3569] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const application = applicationData.application;
  const firstCommittee = committeeRoles.find(
    (role) => role.id === application.firstOptionCommittee
  );
  const secondCommittee = committeeRoles.find(
    (role) => role.id === application.secondOptionCommittee
  );

  // Get user name from session
  const rawFirstName = session?.user?.name?.split(" ")[0];
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : "";

  return (
    <div className="min-h-screen bg-[rgb(243,243,253)] flex flex-col justify-between">
      <Header />

      {/*  <section className="flex flex-col items-center justify-center sm:my-12 lg:my-28">
        <div className="w-[80%] flex flex-col justify-center items-center">
          <div className="rounded-[24px] sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-10 md:p-16 lg:py-20 lg:px-24 w-full max-w-4xl">
            <div className="text-3xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4 text-center">
              <span className="text-black">Application </span>
              <span className="text-[#134687]">Progress</span>
            </div>

            <div className="text-black text-xs lg:text-lg font-Inter font-light text-center mb-8">
              Your committee staff application is being processed. Here's your
              current status:
            </div>

            <hr className="my-8 border-t-1 border-[#717171]" />

           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-inter font-semibold text-gray-700 mb-2">
                  Personal Information
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span>{" "}
                  {applicationData.user?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Student Number:</span>{" "}
                  {applicationData.user?.studentNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Section:</span>{" "}
                  {applicationData.user?.section}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-inter font-semibold text-gray-700 mb-2">
                  Committee Preferences
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">First Choice:</span>{" "}
                  {firstCommittee?.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Second Choice:</span>{" "}
                  {secondCommittee?.title}
                </p>
              </div>
            </div>

           
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-inter font-semibold text-blue-800 mb-4 text-center">
                Application Status
              </h3>

              <div className="flex justify-between items-center mb-4">
                <div
                  className={`flex items-center ${
                    application.hasAccepted ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.hasAccepted ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {application.hasAccepted ? "✓" : "1"}
                  </div>
                  <span className="ml-2 font-medium">
                    Application Submitted
                  </span>
                </div>

                <div
                  className={`flex items-center ${
                    application.interviewSlotDay
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.interviewSlotDay
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {application.interviewSlotDay ? "✓" : "2"}
                  </div>
                  <span className="ml-2 font-medium">Interview Scheduled</span>
                </div>

                <div
                  className={`flex items-center ${
                    application.hasFinishedInterview
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.hasFinishedInterview
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {application.hasFinishedInterview ? "✓" : "3"}
                  </div>
                  <span className="ml-2 font-medium">Interview Completed</span>
                </div>

                <div
                  className={`flex items-center ${
                    application.hasAccepted ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.hasAccepted ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {application.hasAccepted ? "✓" : "4"}
                  </div>
                  <span className="ml-2 font-medium">Final Decision</span>
                </div>
              </div>

              {application.status && (
                <div
                  className={`p-3 rounded-lg text-center ${
                    application.status === "passed"
                      ? "bg-green-100 text-green-800"
                      : application.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : application.status === "redirected"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <span className="font-medium">Current Status:</span>{" "}
                  {application.status.toUpperCase()}
                  {application.redirection && (
                    <span className="ml-2">
                      (Redirected to: {application.redirection})
                    </span>
                  )}
                </div>
              )}
            </div>

           
            {application.interviewSlotDay && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-inter font-semibold text-green-800 mb-2">
                  Interview Scheduled
                </h3>
                <p className="text-green-700">
                  Your interview is scheduled for:{" "}
                  <strong>{scheduledTime}</strong>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Please arrive on time and be prepared. The interview will take
                  approximately 30 minutes.
                </p>
              </div>
            )}

          
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="font-inter font-semibold text-yellow-800 mb-2">
                Next Steps
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-yellow-700">
                {!application.interviewSlotDay && (
                  <li>
                    Wait for the interview scheduling email or check back later
                    to schedule your interview
                  </li>
                )}
                {application.interviewSlotDay &&
                  !application.hasFinishedInterview && (
                    <li>Prepare for your interview on {scheduledTime}</li>
                  )}
                {application.hasFinishedInterview && !application.status && (
                  <li>
                    Your interview has been completed. Wait for the results.
                  </li>
                )}
                <li>Check your email regularly for updates</li>
                <li>Contact css.cics@ust.edu.ph if you have any questions</li>
              </ul>
            </div>

            <hr className="my-8 border-t-1 border-[#717171]" />

            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push("/user")}
                className="bg-[#E7E3E3] text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#CDCCCC] transition-all duration-150 active:scale-95"
              >
                Back to Dashboard
              </button>

              {!application.interviewSlotDay && (
                <button
                  onClick={() =>
                    router.push(
                      `/user/apply/committee-staff/${committeeId}/schedule`
                    )
                  }
                  className="bg-[#134687] text-white px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#0d3569] transition-all duration-150 active:scale-95"
                >
                  Schedule Interview
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      */}

      <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center gap-6 sm:gap-8 lg:gap-10">
          {/* Welcome Section */}
          <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 lg:gap-5 w-full max-w-2xl">
            <div className="rounded-[25px] sm:rounded-[35px] lg:rounded-[45px] text-white text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium px-4 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-full sm:w-[85%] md:w-[75%] lg:w-[70%]">
              Welcome, {firstName} 👋
            </div>
            <div className="text-black text-sm sm:text-base lg:text-lg font-light text-center px-3 w-full leading-5 sm:leading-6 italic">
              Track your journey with the Computer Science Society.
            </div>
          </div>

          <hr className="w-[90%] sm:w-[85%] lg:w-[80%] border-t-1 border-[#717171]" />

          {/* Application Status */}
          <div className="rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.15)] sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] py-6 sm:py-8 lg:py-10 px-4 sm:px-8 lg:px-16 w-full max-w-2xl flex flex-col items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-7 h-7 lg:w-10 lg:h-10">
                <span className="text-white text-[9px] lg:text-xs font-bold font-inter">
                  1
                </span>
              </div>
              <div className="w-20 lg:w-28 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-7 h-7 lg:w-10 lg:h-10">
                <span className="text-[#696767] text-[9px] lg:text-xs font-bold font-inter">
                  2
                </span>
              </div>
              <div className="w-20 lg:w-28 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-7 h-7 lg:w-10 lg:h-10">
                <span className="text-[#696767] text-[9px] lg:text-xs font-bold font-inter">
                  3
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 w-80 lg:w-114 mt-3 gap-x-0 place-items-center font-inter font-medium">
              <span className="text-[9px] leading-none whitespace-nowrap text-center">
                For Interview
              </span>
              <span className="text-[9px] leading-none whitespace-nowrap text-center">
                Evaluation
              </span>
              <span className="text-[9px] leading-none whitespace-nowrap text-center">
                Application Results
              </span>
            </div>
            {scheduledTime && (
              <p className="text-[10px] text-center lg:text-xs font-inter mt-6 text-gray-600">
                Interview scheduled for: <br className="lg:hidden" />
                <span className="font-semibold">{scheduledTime}</span>
              </p>
            )}
          </div>

          {/* Application Summary */}
          <div className="rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.15)] sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-4 sm:p-6 lg:p-10 w-full max-w-4xl">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 sm:mb-5">
              Application Summary
            </h3>

            <div className="bg-[#F3F8FF] rounded-xl p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Name:
                    </span>
                    <span className="text-sm sm:text-base break-words">
                      {applicationData.user?.name}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Student Number:
                    </span>
                    <span className="text-sm sm:text-base">
                      {applicationData.user?.studentNumber}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Section:
                    </span>
                    <span className="text-sm sm:text-base">
                      {applicationData.user?.section}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-2 sm:space-y-3 md:pl-4 lg:pl-8">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Member ID:
                    </span>
                    <span className="text-sm sm:text-base text-gray-500">
                      Pending
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      First Choice:
                    </span>
                    <span className="text-sm sm:text-base break-words">
                      {firstCommittee?.title}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Second Choice:
                    </span>
                    <span className="text-sm sm:text-base break-words">
                      {secondCommittee?.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
