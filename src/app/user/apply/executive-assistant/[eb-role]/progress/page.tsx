"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplicationGuard from "@/components/ApplicationGuard";
import { roles } from "@/data/ebRoles";
import { useSession } from "next-auth/react";

function EAProgressPageContent() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [applicationData, setApplicationData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scheduledTime, setScheduledTime] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchApplicationData = async () => {
            try {
                const response = await fetch("/api/applications/executive-assistant");
                if (response.ok) {
                    const data = await response.json();
                    setApplicationData(data);
                    
                    setScheduledTime("");

                    // Format the scheduled time if it exists
                    if (
                        data.application?.interviewSlotDay &&
                        data.application?.interviewSlotTimeStart
                    ) {
                        const date = new Date(data.application.interviewSlotDay);
                        const formattedDate = date.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        });

                        const [hourStr, minute] =
                        data.application.interviewSlotTimeStart.split(":");
                        let hour = parseInt(hourStr, 10);
                        const ampm = hour >= 12 ? "pm" : "am";
                        hour = hour % 12;
                        if (hour === 0) hour = 12;
                        const formattedTime = `${hour}:${minute}${ampm}`;

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
    
    const handleDeleteApplication = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/applications/executive-assistant', {
                method: 'DELETE',
            });

            const result = await response.json();

            if (response.ok) {
                router.push('/user/apply/executive-assistant');
            } else {
                alert(result.error || 'Failed to delete application');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete application');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const canDeleteApplication = () => {
        if (!applicationData || !applicationData.application) return false;
        
        const app = applicationData.application;
        return !app.interviewSlotDay || !app.interviewSlotTimeStart;
    };

    const renderDeleteConfirmation = () => {
        if (!showDeleteConfirm) return null;

        return (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 011.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Confirm Reset
                </h3>
                <p className="text-gray-600 text-center mb-6">
                Are you sure you want to reset your application? This action cannot be undone.
                All your progress will be lost.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-150"
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleDeleteApplication}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 disabled:opacity-50"
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                    </span>
                    ) : (
                    'Reset Application'
                    )}
                </button>
                </div>
            </div>
            </div>
        );
    };

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
                You don't have an active EA application.
                </p>
                <button
                onClick={() => router.push("/user/apply/executive-assistant")}
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
    const firstEB = roles.find(
        (role) => role.id === application.firstOptionEb
    );
    const secondEB = roles.find(
        (role) => role.id === application.secondOptionEb
    );

    // Get user name from session
    const rawFirstName = session?.user?.name?.split(" ")[0];
    const firstName = rawFirstName
        ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
        : "";

    return (
        <div className="min-h-screen bg-[rgb(243,243,253)] flex flex-col justify-between">
        <Header />

        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col justify-center items-center gap-6 sm:gap-8 lg:gap-10">
            {/* Welcome Section */}
            <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 lg:gap-5 w-full max-w-2xl">
                <div className="rounded-[25px] sm:rounded-[35px] lg:rounded-[45px] text-white text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium px-4 sm:px-6 lg:px-8 py-3 sm:py-3 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-full sm:w-[85%] md:w-[75%] lg:w-[70%]">
                Welcome, {firstName} 👋
                </div>
                <div className="text-black text-sm sm:text-base lg:text-lg font-light text-center px-3 w-full leading-5 sm:leading-6 italic">
                Track your Executive Assistant application journey.
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

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                        Schedule:
                        </span>
                        <span className={`text-sm sm:text-base ${scheduledTime ? '' : 'text-gray-500'}`}>
                        {scheduledTime || "Pending"}
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
                        {firstEB?.title}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start">
                        <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                        Second Choice:
                        </span>
                        <span className="text-sm sm:text-base break-words">
                        {secondEB?.title}
                        </span>
                    </div>
                    </div>
                </div>
                </div>
            </div>

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
                        `/user/apply/executive-assistant/${application.firstOptionEb}/schedule` // ← Use firstOptionEb
                        )
                    }
                    className="bg-[#134687] text-white px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#0d3569] transition-all duration-150 active:scale-95"
                    >
                    Schedule Interview
                    </button>
                )}
                {canDeleteApplication() && (
                    <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-yellow-400 text-white px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-red-700 transition-all duration-150 active:scale-95"
                    >
                    Reset Application
                    </button>
                )}
                </div>
            </div>
        </section>

        <Footer />
        {renderDeleteConfirmation()}
        </div>
    );
}

export default function EAProgressPage() {
    return (
        <ApplicationGuard applicationType="ea">
            <EAProgressPageContent />
        </ApplicationGuard>
    );
}