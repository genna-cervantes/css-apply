"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";
import {
  Users,
  ClipboardEdit,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedApplications, setHasCheckedApplications] = useState(false);
  const [error, setError] = useState("");

  const checkApplications = useCallback(async () => {
    try {
      console.log("UserDashboard: Checking existing applications...");
      setError("");
      
      // Check if we have application data in session first (optimistic loading)
      if (session?.user?.hasMemberApplication || session?.user?.hasEAApplication || session?.user?.hasCommitteeApplication) {
        if (session.user.hasMemberApplication) {
          router.push("/user/apply/member/progress");
          return;
        } else if (session.user.hasCommitteeApplication && session.user.committeeId) {
          router.push(`/user/apply/committee-staff/${session.user.committeeId}/progress`);
          return;
        } else if (session.user.hasEAApplication && session.user.ebRole) {
          router.push(`/user/apply/executive-assistant/${session.user.ebRole}/progress`);
          return;
        }
        // If we have applications but missing redirect info, continue with API call
      } else if (session?.user && !session.user.hasMemberApplication && !session.user.hasEAApplication && !session.user.hasCommitteeApplication) {
        // User has no applications, skip API call and show dashboard immediately
        setHasCheckedApplications(true);
        setIsLoading(false);
        return;
      }
      
      // Add a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3 second timeout
      
      const response = await fetch("/api/applications/check-existing", {
        signal: controller.signal,
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();

        // Redirect based on existing applications
        if (data.hasMemberApplication) {
          router.push("/user/apply/member/progress");
          return;
        } else if (data.hasCommitteeApplication) {
          const committeeId = data.applications.committee?.firstOptionCommittee;
          if (committeeId) {
            router.push(`/user/apply/committee-staff/${committeeId}/progress`);
            return;
          }
        } else if (data.hasEAApplication) {
          const ebRole = data.applications.ea?.firstOptionEb;
          if (ebRole) {
            router.push(`/user/apply/executive-assistant/${ebRole}/progress`);
            return;
          }
        }
        console.log("UserDashboard: No existing applications found, showing dashboard");
      } else if (response.status === 404) {
        // User not found - this is expected for new users, just show dashboard
        console.log("UserDashboard: User not found (new user), showing dashboard");
      } else {
        console.error("UserDashboard: API response not ok:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to check existing applications");
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("UserDashboard: Request timed out");
        setError("Request timed out. Please try again.");
      } else {
        console.error("UserDashboard: Error checking applications:", error);
        setError("An error occurred while checking your applications");
      }
    } finally {
      setHasCheckedApplications(true);
      setIsLoading(false);
    }
  }, [router, session?.user]);

  // Fallback mechanism for existing users who might be stuck
  useEffect(() => {
    if (status === "authenticated" && session && isLoading && !hasCheckedApplications) {
      const fallbackTimer = setTimeout(() => {
        setHasCheckedApplications(true);
        setIsLoading(false);
        setError("");
      }, 5000); // Reduced to 5 second fallback

      return () => clearTimeout(fallbackTimer);
    }
  }, [status, session, isLoading, hasCheckedApplications]);

  // Handle authentication status changes and application checking
  useEffect(() => {
    console.log("UserDashboard: useEffect triggered", { status, hasSession: !!session, hasCheckedApplications });
    
    if (status === "loading") {
      console.log("UserDashboard: Still loading...");
      return;
    }

    if (status === "unauthenticated") {
      console.log("UserDashboard: User not authenticated, redirecting to home");
      router.push("/");
      return;
    }

    if (status === "authenticated" && session) {
      console.log("UserDashboard: User authenticated", { email: session.user?.email, role: session.user?.role });
      
      // Check for .cics@ust.edu.ph users and redirect if not admin
      if (session?.user?.email.match(/\.cics@ust\.edu\.ph$/) && 
          session?.user?.role !== 'admin' && 
          session?.user?.role !== 'super_admin') {
        console.log("UserDashboard: .cics user without admin role, redirecting to home");
        router.push("/");
        return;
      }

      // Check for existing applications
      if (!hasCheckedApplications) {
        console.log("UserDashboard: Checking applications for the first time");
        checkApplications();
      } else {
        console.log("UserDashboard: Applications already checked, setting loading to false");
        setIsLoading(false);
      }
    }
  }, [session, status, router, hasCheckedApplications, checkApplications]);

  // Separate effect to handle initial load for existing users
  useEffect(() => {
    if (status === "authenticated" && session && !hasCheckedApplications && !isLoading) {
      console.log("UserDashboard: Fallback check for existing users");
      checkApplications();
    }
  }, [status, session, hasCheckedApplications, isLoading, checkApplications]);

  // Show loading screen while checking authentication or applications
  if (
    status === "loading" ||
    isLoading ||
    (status === "authenticated" && !hasCheckedApplications)
  ) {
    return <LoadingScreen />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F3FD] flex flex-col justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError("");
              setHasCheckedApplications(false);
              setIsLoading(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get user name from session with safety checks
  const rawFirstName = session?.user?.name?.split(" ")[0];
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : "User";

  // Additional safety check - if we reach here without session, something went wrong
  if (!session) {
    console.error("UserDashboard: No session available when rendering content");
    return (
      <div className="min-h-screen bg-[#F3F3FD] flex flex-col justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Session Error</h1>
          <p className="text-gray-600 mb-4">Unable to load user session. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="min-h-screen bg-[#F3F3FD] bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] flex flex-col justify-between relative bg-cover bg-repeat">
        <Header />

        <div className="flex flex-col justify-center items-center mt-14 lg:mt-20 w-full mb-10 lg:mb-16">
          <div className="flex flex-col justify-center items-center gap-7">
            <div className="flex flex-col justify-center items-center gap-2 lg:gap-5">
              <div className="rounded-[45px] text-white text-lg lg:text-4xl font-poppins font-medium px-0 py-2 lg:py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)] w-[70%]">
                Welcome, {firstName} 👋
              </div>
              <div className="text-black text-xs lg:text-lg font-Inter font-light text-center px-3 w-[85%] lg:w-full  leading-5">
                Ready to start your journey with the Computer Science Society?
                Choose how you’d like to be part of CSS this year.
              </div>
            </div>
            {/* Mobile carousel */}
            <div className="relative w-full max-w-[340px] sm:max-w-md lg:hidden">
              <button
                aria-label="Previous"
                onClick={() => setCurrentSlide((s) => (s === 0 ? 2 : s - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-9 w-9 rounded-full text-shadow-md text-[#A8A8A8] hover:bg-gray-50 active:scale-95"
              >
                <ChevronLeft size={30} className="text-[#6B7280]" />
              </button>
              <button
                aria-label="Next"
                onClick={() => setCurrentSlide((s) => (s === 2 ? 0 : s + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-9 w-9 rounded-full text-shadow-md text-[#A8A8A8] hover:bg-gray-50 active:scale-95"
              >
                <ChevronRight size={30} className="text-[#6B7280]" />
              </button>

              <div className="overflow-hidden rounded-[28px]">
                <div
                  className="flex transition-transform duration-300"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* lagyan ng validation if nag apply na ba toh and idisable lahat ng buttons show instead ung application niya */}
                  {/* Slide 1 - Member */}
                  <div className="min-w-full flex justify-center">
                    <div className="relative flex flex-col w-64 h-[440px] md:w-80 md:h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-md lg:shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                      <Users
                        size={88}
                        strokeWidth={2}
                        className="pt-5 text-[#044FAF]"
                      />
                      <div className="text-base md:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                        Member
                        <div className="text-black text-[10px] sm:text-[10px] md:text-[13px] text-justify font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 h-[240px] w-[200px] md:mt-5 md:h-[270px] md:w-[280px] p-4 flex flex-col justify-between overflow-hidden">
                          <ul className="list-disc list-outside space-y-1 flex-1 overflow-y-auto pl-4">
                            <li>
                              Gain access to exclusive events and activities
                            </li>
                            <li>
                              Build your network with fellow students and
                              professionals
                            </li>
                            <li>
                              Receive updates and opportunities directly from
                              the organization
                            </li>
                            <li className="font-semibold">
                              One-time membership fee of ₱250
                            </li>
                          </ul>
                          {/* <a
                            href="/user/apply/member"
                            className="whitespace-nowrap bg-[#044FAF] font-inter text-[11px] md:text-sm text-white px-3 py-2 md:px-4 md:py-3 rounded-md hover:bg-[#04387B] transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98 text-center mt-2 flex-shrink-0 shadow-md hover:shadow-lg"
                          >
                            Apply as Member
                          </a> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Slide 2 - Committee Staff */}
                  <div className="min-w-full flex justify-center">
                    <div className="relative flex flex-col w-64 h-[440px] md:w-80 md:h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                      <ClipboardEdit
                        size={88}
                        strokeWidth={1.7}
                        className="pt-5 text-[#044FAF]"
                      />

                      <div className="text-base md:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                        Committee Staff
                        <div className="text-black text-[10px] sm:text-[10px] md:text-[13px] text-justify font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 h-[240px] w-[200px] md:mt-5 md:h-[270px] md:w-[280px] p-4 flex flex-col justify-between overflow-hidden">
                          <ul className="list-disc list-outside space-y-1 flex-1 overflow-y-auto pl-4">
                            <li>Aid in the preparation and needs of events</li>
                            <li>
                              Be part of the behind-the-scenes work of events
                            </li>
                            <li>
                              Upskill through exposure to new projects and tasks
                            </li>
                            <li className="font-semibold">
                              One-time membership fee of ₱250
                            </li>
                          </ul>
                          {/* <a
                            href="/user/apply/committee-staff"
                            className="whitespace-nowrap bg-[#044FAF] font-inter text-[11px] md:text-sm text-white px-3 py-2 md:px-4 md:py-3 rounded-md hover:bg-[#04387B] transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98 text-center mt-2 flex-shrink-0 shadow-md hover:shadow-lg"
                          >
                            Apply as Committee Staff
                          </a> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Slide 3 - Executive Assistant */}
                  <div className="min-w-full flex justify-center">
                    <div className="relative flex flex-col w-64 h-[440px] md:w-80 md:h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                      <Briefcase
                        size={100}
                        strokeWidth={1.5}
                        className="pt-5 text-[#044FAF]"
                      />

                      <div className="text-base md:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                        Executive Assistant
                        <div className="text-black text-[10px] sm:text-[10px] md:text-[13px] text-justify font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 h-[240px] w-[200px] md:mt-5 md:h-[270px] md:w-[280px] p-4 flex flex-col justify-between overflow-hidden">
                          <ul className="list-disc list-outside space-y-1 flex-1 overflow-y-auto pl-4">
                            <li>
                              Work closely with the Executive Board in daily
                              operations
                            </li>
                            <li>Assist in planning and organizing events</li>
                            <li>
                              Handle paperworks and tasks assigned by the
                              Executive Board
                            </li>
                            <li className="font-semibold">
                              One-time membership fee of ₱250
                            </li>
                          </ul>
                          {/* <a
                            href="/user/apply/executive-assistant"
                            className="whitespace-nowrap bg-[#044FAF] font-inter text-[10px] md:text-sm text-white px-3 py-2 md:px-4 md:py-3 rounded-md hover:bg-[#04387B] transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 text-center mt-2 flex-shrink-0 shadow-md hover:shadow-lg"
                          >
                            Apply as Executive Assistant
                          </a> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* dots */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2.5 w-2.5 rounded-full ${
                      currentSlide === i ? "bg-[#044FAF]" : "bg-[#D1D1D1]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex gap-7 xl:gap-11 mt-10">
              <div className="relative flex flex-col w-64 xl:w-80 h-[400px] xl:h-[480px] rounded-[20px] xl:rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                <Users
                  size={100}
                  strokeWidth={1.7}
                  className="pt-3 xl:pt-5 xl:w-[120px] xl:h-[120px] text-[#044FAF]"
                />
                <div className="text-base xl:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                  Member
                  <div className="text-black lg:text-[10px] xl:text-[12px] text-justify  font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 xl:mt-5 h-[220px] xl:h-[270px] w-[220px] xl:w-[280px] p-4 flex flex-col justify-between overflow-hidden">
                    <ul className="list-disc list-outside space-y-2 flex-1 overflow-y-auto pl-4">
                      <li>Gain access to exclusive events and activities</li>
                      <li>
                        Build your network with fellow students and
                        professionals
                      </li>
                      <li>
                        Receive updates and opportunities directly from the
                        organization
                      </li>
                      <li className="font-semibold">
                        One-time membership fee of ₱250
                      </li>
                    </ul>
                    {/* <a
                      href="/user/apply/member"
                      className="whitespace-nowrap bg-[#044FAF] font-inter text-xs xl:text-sm text-white px-4 xl:px-6 py-2.5 xl:py-3 rounded-md hover:bg-[#04387B] transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98 text-center mt-2 flex-shrink-0 shadow-md hover:shadow-lg"
                    >
                      Apply as Member
                    </a> */}
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col w-64 xl:w-80 h-[400px] xl:h-[480px] rounded-[20px] xl:rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                <ClipboardEdit
                  size={100}
                  strokeWidth={1.7}
                  className="pt-3 xl:pt-5 xl:w-[120px] xl:h-[120px] text-[#044FAF]"
                />

                <div className="text-base xl:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                  Committee Staff
                  <div className="text-black lg:text-[10px] xl:text-[12px] text-justify font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 xl:mt-5 h-[220px] xl:h-[270px] w-[220px] xl:w-[280px] p-4 flex flex-col justify-between overflow-hidden">
                    <ul className="list-disc list-outside space-y-2 flex-1 overflow-y-auto pl-4">
                      <li>Aid in the preparation and needs of events</li>
                      <li>Be part of the behind-the-scenes work of events</li>
                      <li>
                        Upskill through exposure to new projects and tasks
                      </li>
                      <li className="font-semibold">
                        One-time membership fee of ₱250
                      </li>
                    </ul>
                    {/* <a
                      href="/user/apply/committee-staff"
                      className="whitespace-nowrap bg-[#044FAF] font-inter text-xs xl:text-sm text-white px-4 xl:px-6 py-2.5 xl:py-3 rounded-md hover:bg-[#04387B] transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98 text-center mt-2 flex-shrink-0 shadow-md hover:shadow-lg"
                    >
                      Apply as Committee Staff
                    </a> */}
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col w-64 xl:w-80 h-[400px] xl:h-[480px] rounded-[20px] xl:rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                <Briefcase
                  size={120}
                  strokeWidth={1.5}
                  className="pt-3 xl:pt-5 xl:w-[120px] xl:h-[120px] text-[#044FAF]"
                />

                <div className="text-base xl:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                  Executive Assistant
                  <div className="text-black lg:text-[10px] xl:text-[12px] text-justify font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 xl:mt-5 h-[220px] xl:h-[270px] w-[220px] xl:w-[280px] p-4 flex flex-col justify-between overflow-hidden">
                    <ul className="list-disc list-outside space-y-2 flex-1 overflow-y-auto pl-4">
                      <li>
                        Work closely with the Executive Board in daily
                        operations
                      </li>
                      <li>Assist in planning and organizing events</li>
                      <li>
                        Handle paperworks and tasks assigned by the Executive
                        Board
                      </li>
                      <li className="font-semibold">
                        One-time membership fee of ₱250
                      </li>
                    </ul>
                    {/* <a
                      href="/user/apply/executive-assistant"
                      className="whitespace-nowrap bg-[#044FAF] font-inter text-xs xl:text-sm text-white px-4 xl:px-6 py-2.5 xl:py-3 rounded-md hover:bg-[#04387B] transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98 text-center mt-2 flex-shrink-0 shadow-md hover:shadow-lg"
                    >
                      Apply as Executive Assistant
                    </a> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </section>
    </div>
  );
}
