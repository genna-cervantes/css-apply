"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import DigitalIdCard from "@/components/DigitalIdCard";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DigitalIdApiResponse {
  isEligible: boolean;
  memberId?: string;
  schoolYear?: string;
  roleTitle?: string;
  issueDate?: string;
  expirationDate?: string;
  isExpired?: boolean;
  user?: {
    id: string;
    name: string;
    studentNumber?: string;
    section?: string;
    image?: string | null;
  };
  reason?: string;
  paymentStatus?: string;
}

export default function DigitalIdPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DigitalIdApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDigitalId = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/digital-id");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load digital ID data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchDigitalId();
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return <LoadingScreen message="Loading Digital ID" />;
  }

  return (
    <div className="min-h-screen bg-[rgb(243,243,253)] bg-[url('/assets/css-apply-static-images/assets/pictures/background.webp')] bg-cover bg-no-repeat flex flex-col justify-between">
      <Header />

      <main className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          {/* Top Banner Header */}
          <div className="flex flex-col items-center text-center gap-2 max-w-xl">
            <div className="rounded-[45px] text-white text-lg sm:text-2xl lg:text-3xl font-poppins font-medium px-6 py-2 sm:py-3 [background:linear-gradient(90deg,#2F7EE3_0%,#0349A2_100%)] w-fit">
              Official Digital ID
            </div>
            <p className="text-xs sm:text-sm font-inter text-[#134687]/80">
              Computer Science Society • University of Santo Tomas
            </p>
          </div>

          {/* Navigation link back to progress */}
          <div className="w-full max-w-xl flex justify-between items-center text-xs font-semibold text-[#044FAF]">
            <Link
              href="/user"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <button
              onClick={fetchDigitalId}
              className="inline-flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh ID</span>
            </button>
          </div>

          {/* Digital ID Card or Ineligible Notice */}
          {data?.isEligible && data.memberId && data.user ? (
            <DigitalIdCard
              memberId={data.memberId}
              schoolYear={data.schoolYear || "2026-2027"}
              roleTitle={data.roleTitle}
              issueDate={data.issueDate}
              expirationDate={data.expirationDate}
              user={data.user}
              isEligible={true}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#005FD9]/15 shadow-sm p-6 sm:p-10 max-w-md text-center">
              <div className="w-16 h-16 rounded-full bg-white border border-[#B77900] text-[#8A5A00] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-poppins font-bold text-[#134687] mb-3">
                {data?.isExpired
                  ? "Digital ID Expired"
                  : "Digital ID Unavailable"}
              </h3>
              <p className="text-sm font-inter text-[#134687]/70 leading-relaxed mb-6">
                {data?.reason ||
                  "Your official Digital Member ID is strictly available if and only if your membership fee has been paid and your acknowledgement receipt check has passed."}
              </p>
              <Link
                href="/user"
                className="inline-block bg-[#044FAF] text-white px-6 py-2.5 rounded-xl font-poppins font-semibold text-xs hover:bg-[#033B85] transition-all shadow-md active:scale-95"
              >
                Go to Application Status
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
