"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplicationGuard from "@/components/ApplicationGuard";
import { useSession } from "next-auth/react";
import { truncateToLast7 } from "@/lib/truncate-utils";

function MemberProgressPageContent() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState<{
    hasApplication: boolean;
    application: {id: string; hasAccepted?: boolean; paymentProof?: string; createdAt: string} | null;
    user: {id: string; studentNumber: string; name: string; section: string};
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await fetch("/api/applications/member");
        if (response.ok) {
          const data = await response.json();
          console.log("Member application data:", data);
          console.log("User ID:", data.user?.id);
          console.log("Has accepted:", data.application?.hasAccepted);
          setApplicationData(data);
        }
      } catch (error) {
        console.error("Failed to fetch application data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, []);

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
              No Member Application Found
            </h1>
            <p className="text-gray-600 mb-6">
              You don&apos;t have an active member application.
            </p>
            <button
              onClick={() => router.push("/user/apply/member")}
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

  // Get user name from session
  const rawFirstName = session?.user?.name?.split(" ")[0];
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : "";

  return (
    <div className="min-h-screen bg-[rgb(243,243,253)] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] bg-cover bg-no-repeat flex flex-col justify-between">
      <Header />

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
                      {applicationData.user.name}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Student Number:
                    </span>
                    <span className="text-sm sm:text-base">
                      {applicationData.user.studentNumber}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-2 sm:space-y-3 md:pl-4 lg:pl-8">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Section:
                    </span>
                    <span className="text-sm sm:text-base">
                      {applicationData.user.section}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-sm sm:text-base mb-1 sm:mb-0 sm:mr-3 min-w-fit">
                      Member ID:
                    </span>
                    <span className={`text-sm sm:text-base ${applicationData.application?.hasAccepted ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                      {applicationData.application?.hasAccepted ? truncateToLast7(applicationData.user.id).toUpperCase() : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions - Only show for accepted members */}
          {applicationData.application?.hasAccepted && (
            <div className="rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.15)] sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-4 sm:p-6 lg:p-10 w-full max-w-4xl">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 sm:mb-5 text-center">
                💳 Payment Instructions
              </h3>
              
              <div className="bg-gradient-to-r from-[#fff7ed] to-[#fed7aa] border-2 border-[#f59e0b] rounded-xl p-4 sm:p-6 lg:p-8">
                <p className="text-[#92400e] line-height-1.6 font-weight-bold text-center mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                  To complete your membership, please proceed with the payment of <strong className="text-[#134687] text-lg sm:text-xl">₱250.00</strong> using the GCash QR code below:
                </p>
                
                <div className="text-center mb-4 sm:mb-6">
                  <Image 
                    src="https://itvimtcxzsubgcbnknvq.supabase.co/storage/v1/object/sign/payment/CSSPayment-Cropped.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zZDI2NmE0Mi02NGNmLTQzZjItOTE5Mi00OTk1MmViZDMxY2QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwYXltZW50L0NTU1BheW1lbnQtQ3JvcHBlZC5qcGciLCJpYXQiOjE3NTk1ODE4MjksImV4cCI6MTc5MTExNzgyOX0.SVFyO2WgwnA0pasjevIYWNESH6udyOLJiivdGob-FP4" 
                    alt="GCash QR Code for CSS Payment" 
                    width={300}
                    height={300}
                    className="max-w-[250px] sm:max-w-[300px] w-full h-auto border-3 border-[#134687] rounded-xl shadow-lg mx-auto"
                  />
                </div>
                
                <div className="bg-gradient-to-r from-[#fef2f2] to-[#fecaca] border-2 border-[#dc2626] rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
                  <h4 className="text-[#dc2626] text-center font-bold mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg">
                    ⚠️ IMPORTANT PAYMENT MESSAGE
                  </h4>
                  <p className="text-[#dc2626] text-center font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                    When sending your payment via GCash QR, you MUST include this message:
                  </p>
                  <div className="bg-gradient-to-r from-[#134687] to-[#0f3a6b] rounded-lg p-3 sm:p-4 text-center">
                    <code className="text-white font-bold text-sm sm:text-base lg:text-lg font-mono">
                      Member ID: {truncateToLast7(applicationData.user.id).toUpperCase()}
                    </code>
                  </div>
                  <p className="text-[#dc2626] text-center text-xs sm:text-sm mt-2">
                    This message is required for payment verification and processing.
                  </p>
                </div>
                
                <p className="text-[#92400e] text-center text-xs sm:text-sm">
                  Please keep a screenshot of your payment confirmation for your records.
                </p>
              </div>
            </div>
          )}

          {/* Join Our Community - Only show for accepted members */}
          {applicationData.application?.hasAccepted && (
            <div className="rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.15)] sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-4 sm:p-6 lg:p-10 w-full max-w-4xl">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 sm:mb-5 text-center">
                👥 Join Our Community
              </h3>
              
              <div className="bg-gradient-to-r from-[#e0f2fe] to-[#b3e5fc] border-2 border-[#134687] rounded-xl p-4 sm:p-6 lg:p-8">
                <p className="text-[#1f2937] text-center mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
                  Join our exclusive private FB group for members to stay connected and receive updates:
                </p>
                <div className="text-center">
                  <a 
                    href="https://fb.me/g/6UCY6FrzU/L7r94Zcj" 
                    className="inline-block bg-gradient-to-r from-[#134687] to-[#0f3a6b] text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    👥 Join UST CSS Members 25&apos;-26&apos; Group
                  </a>
                </div>
                <p className="text-[#6b7280] text-center text-xs sm:text-sm mt-4">
                  Connect with fellow members and stay updated with exclusive announcements!
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function MemberProgressPage() {
  return (
    <ApplicationGuard applicationType="member">
      <MemberProgressPageContent />
    </ApplicationGuard>
  );
}
