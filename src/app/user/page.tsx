"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedApplications, setHasCheckedApplications] = useState(false);

  useEffect(() => {
    const checkApplications = async () => {
      // REF: you dont need useEffect for this, this would work the same kahit nasa same level ng states ung if (status) just make sure to use useserversession instead of usesession
      if (status === "authenticated") {
        try {
          const response = await fetch('/api/applications/check-existing');
          if (response.ok) {
            const data = await response.json();
            
            // Redirect based on existing applications
            if (data.hasMemberApplication) {
              router.push('/user/member/application/progress');
            } else if (data.hasCommitteeApplication) {
              const committeeId = data.applications.committee?.firstOptionCommittee;
              if (committeeId) {
                router.push(`/user/apply/committee-staff/${committeeId}/progress`);
              }
            } else if (data.hasEAApplication) {
              router.push('/user/ea/application/progress');
            }
          }
        } catch (error) {
          console.error('Error checking applications:', error);
        } finally {
          setHasCheckedApplications(true);
        }
      }
    };

    checkApplications();
  }, [status, router]);

  // Check authentication status
  // REF: this too does not need useEffect
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  // Show loading screen while checking authentication
  if (isLoading || status === "loading" || (status === "authenticated" && !hasCheckedApplications)) {
    return <LoadingScreen />;
  }

  // Get user name from session
  const rawFirstName = session?.user?.name?.split(" ")[0];
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : "";

  return (
    <div>
      <section className="min-h-screen bg-[#F3F3FD] flex flex-col justify-between">
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
                {/* Left chevron */}
                {/* REF: not really readable, import nlng ng icon library instead */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                aria-label="Next"
                onClick={() => setCurrentSlide((s) => (s === 2 ? 0 : s + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-9 w-9 rounded-full text-shadow-md text-[#A8A8A8] hover:bg-gray-50 active:scale-95"
              >
                {/* Right chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="88"
                        height="88"
                        viewBox="0 0 120 120"
                        fill="none"
                        className="pt-5"
                      >
                        <path
                          d="M27.2708 34.7082C27.2708 32.7548 27.6556 30.8205 28.4031 29.0158C29.1507 27.211 30.2463 25.5712 31.6276 24.19C33.0089 22.8087 34.6487 21.713 36.4534 20.9655C38.2581 20.2179 40.1924 19.8332 42.1458 19.8332C44.0992 19.8332 46.0335 20.2179 47.8382 20.9655C49.643 21.713 51.2828 22.8087 52.6641 24.19C54.0453 25.5712 55.141 27.211 55.8885 29.0158C56.6361 30.8205 57.0208 32.7548 57.0208 34.7082C57.0208 38.6533 55.4537 42.4368 52.6641 45.2264C49.8744 48.016 46.0909 49.5832 42.1458 49.5832C38.2007 49.5832 34.4172 48.016 31.6276 45.2264C28.838 42.4368 27.2708 38.6533 27.2708 34.7082ZM42.1458 9.9165C35.5707 9.9165 29.2648 12.5285 24.6155 17.1778C19.9661 21.8272 17.3542 28.133 17.3542 34.7082C17.3542 41.2833 19.9661 47.5892 24.6155 52.2385C29.2648 56.8879 35.5707 59.4998 42.1458 59.4998C48.721 59.4998 55.0269 56.8879 59.6762 52.2385C64.3255 47.5892 66.9375 41.2833 66.9375 34.7082C66.9375 28.133 64.3255 21.8272 59.6762 17.1778C55.0269 12.5285 48.721 9.9165 42.1458 9.9165ZM76.8542 9.9165H71.8958V19.8332H76.8542C78.8076 19.8332 80.7419 20.2179 82.5466 20.9655C84.3513 21.713 85.9911 22.8087 87.3724 24.19C88.7537 25.5712 89.8493 27.211 90.5969 29.0158C91.3444 30.8205 91.7292 32.7548 91.7292 34.7082C91.7292 36.6616 91.3444 38.5959 90.5969 40.4006C89.8493 42.2053 88.7537 43.8451 87.3724 45.2264C85.9911 46.6077 84.3513 47.7033 82.5466 48.4509C80.7419 49.1984 78.8076 49.5832 76.8542 49.5832H71.8958V59.4998H76.8542C83.4293 59.4998 89.7352 56.8879 94.3845 52.2385C99.0339 47.5892 101.646 41.2833 101.646 34.7082C101.646 28.133 99.0339 21.8272 94.3845 17.1778C89.7352 12.5285 83.4293 9.9165 76.8542 9.9165ZM0 94.2082C0 87.633 2.61197 81.3271 7.26131 76.6778C11.9107 72.0285 18.2165 69.4165 24.7917 69.4165H59.5C66.0752 69.4165 72.381 72.0285 77.0304 76.6778C81.6797 81.3271 84.2917 87.633 84.2917 94.2082V104.125H74.375V94.2082C74.375 90.2631 72.8078 86.4796 70.0182 83.6899C67.2286 80.9003 63.4451 79.3332 59.5 79.3332H24.7917C20.8466 79.3332 17.0631 80.9003 14.2735 83.6899C11.4839 86.4796 9.91667 90.2631 9.91667 94.2082V104.125H0V94.2082ZM119 94.2082C119 90.9525 118.359 87.7287 117.113 84.7208C115.867 81.7129 114.041 78.9799 111.739 76.6778C109.437 74.3757 106.704 72.5495 103.696 71.3036C100.688 70.0578 97.464 69.4165 94.2083 69.4165H89.25V79.3332H94.2083C98.1534 79.3332 101.937 80.9003 104.727 83.6899C107.516 86.4796 109.083 90.2631 109.083 94.2082V104.125H119V94.2082Z"
                          fill="#044FAF"
                        />
                      </svg>
                      <div className="text-base md:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                        Member
                        <div className="text-black text-sm md:text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 h-[240px] w-[200px] md:mt-5 md:h-[270px] md:w-[280px]"></div>
                      </div>
                      <a
                        href="/user/apply/member"
                        className="whitespace-nowrap absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-xs md:text-sm text-white px-4 py-2 md:px-6 md:py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
                      >
                        Apply as Member
                      </a>
                    </div>
                  </div>
                  {/* Slide 2 - Committee Staff */}
                  <div className="min-w-full flex justify-center">
                    <div className="relative flex flex-col w-64 h-[440px] md:w-80 md:h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="88"
                        height="88"
                        viewBox="0 0 120 120"
                        fill="none"
                        className="pt-5"
                      >
                        <path
                          d="M69.375 9.25H41.625C39.0707 9.25 37 11.3207 37 13.875V23.125C37 25.6793 39.0707 27.75 41.625 27.75H69.375C71.9293 27.75 74 25.6793 74 23.125V13.875C74 11.3207 71.9293 9.25 69.375 9.25Z"
                          stroke="#044FAF"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M74 18.5H83.25C85.7033 18.5 88.056 19.4746 89.7907 21.2093C91.5254 22.944 92.5 25.2967 92.5 27.75V92.5C92.5 94.9533 91.5254 97.306 89.7907 99.0407C88.056 100.775 85.7033 101.75 83.25 101.75H57.8125M18.5 62.4375V27.75C18.5 25.2967 19.4746 22.944 21.2093 21.2093C22.944 19.4746 25.2967 18.5 27.75 18.5H37"
                          stroke="#044FAF"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M61.8733 72.2705C62.7855 71.3582 63.5092 70.2752 64.0029 69.0833C64.4966 67.8913 64.7507 66.6138 64.7507 65.3237C64.7507 64.0336 64.4966 62.7561 64.0029 61.5641C63.5092 60.3722 62.7855 59.2892 61.8733 58.3769C60.961 57.4647 59.878 56.741 58.6861 56.2473C57.4941 55.7536 56.2166 55.4995 54.9265 55.4995C53.6364 55.4995 52.3589 55.7536 51.167 56.2473C49.975 56.741 48.892 57.4647 47.9798 58.3769L24.8085 81.5575C23.7089 82.6565 22.904 84.0149 22.4683 85.5072L18.5971 98.7809C18.4811 99.1789 18.4741 99.6008 18.577 100.002C18.6799 100.404 18.8888 100.77 19.182 101.064C19.4751 101.357 19.8416 101.566 20.2432 101.669C20.6448 101.771 21.0667 101.765 21.4646 101.648L34.7384 97.7773C36.2307 97.3416 37.5891 96.5367 38.6881 95.4371L61.8733 72.2705Z"
                          stroke="#044FAF"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <div className="text-base md:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                        Committee Staff
                        <div className="text-black text-sm md:text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 h-[240px] w-[200px] md:mt-5 md:h-[270px] md:w-[280px]"></div>
                      </div>
                      <a
                        href="/user/apply/committee-staff"
                        className="whitespace-nowrap absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-xs md:text-sm text-white px-4 py-2 md:px-6 md:py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
                      >
                        Apply as Committee Staff
                      </a>
                    </div>
                  </div>
                  {/* Slide 3 - Executive Assistant */}
                  <div className="min-w-full flex justify-center">
                    <div className="relative flex flex-col w-64 h-[440px] md:w-80 md:h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="88"
                        height="88"
                        viewBox="0 0 120 120"
                        fill="none"
                        className="pt-5"
                      >
                        <path
                          d="M78.5555 100V13.7778C78.5555 10.9193 77.4199 8.17796 75.3987 6.15674C73.3775 4.13551 70.6361 3 67.7777 3H46.2221C43.3637 3 40.6223 4.13551 38.6011 6.15674C36.5799 8.17796 35.4443 10.9193 35.4443 13.7778V100"
                          stroke="#044FAF"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M100.111 24.5557H13.8889C7.93646 24.5557 3.11108 29.381 3.11108 35.3334V89.2223C3.11108 95.1747 7.93646 100 13.8889 100H100.111C106.063 100 110.889 95.1747 110.889 89.2223V35.3334C110.889 29.381 106.063 24.5557 100.111 24.5557Z"
                          stroke="#044FAF"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <div className="text-base md:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                        Executive Assistant
                        <div className="text-black text-sm md:text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 h-[240px] w-[200px] md:mt-5 md:h-[270px] md:w-[280px]"></div>
                      </div>
                      <a
                        href="/user/apply/executive-assistants"
                        className="whitespace-nowrap absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-xs md:text-sm text-white px-2 py-2 md:px-6 md:py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
                      >
                        Apply as Executive Assistant
                      </a>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100"
                  height="100"
                  viewBox="0 0 120 120"
                  fill="none"
                  className="pt-3 xl:pt-5 xl:w-[120px] xl:h-[120px]"
                >
                  <path
                    d="M27.2708 34.7082C27.2708 32.7548 27.6556 30.8205 28.4031 29.0158C29.1507 27.211 30.2463 25.5712 31.6276 24.19C33.0089 22.8087 34.6487 21.713 36.4534 20.9655C38.2581 20.2179 40.1924 19.8332 42.1458 19.8332C44.0992 19.8332 46.0335 20.2179 47.8382 20.9655C49.643 21.713 51.2828 22.8087 52.6641 24.19C54.0453 25.5712 55.141 27.211 55.8885 29.0158C56.6361 30.8205 57.0208 32.7548 57.0208 34.7082C57.0208 38.6533 55.4537 42.4368 52.6641 45.2264C49.8744 48.016 46.0909 49.5832 42.1458 49.5832C38.2007 49.5832 34.4172 48.016 31.6276 45.2264C28.838 42.4368 27.2708 38.6533 27.2708 34.7082ZM42.1458 9.9165C35.5707 9.9165 29.2648 12.5285 24.6155 17.1778C19.9661 21.8272 17.3542 28.133 17.3542 34.7082C17.3542 41.2833 19.9661 47.5892 24.6155 52.2385C29.2648 56.8879 35.5707 59.4998 42.1458 59.4998C48.721 59.4998 55.0269 56.8879 59.6762 52.2385C64.3255 47.5892 66.9375 41.2833 66.9375 34.7082C66.9375 28.133 64.3255 21.8272 59.6762 17.1778C55.0269 12.5285 48.721 9.9165 42.1458 9.9165ZM76.8542 9.9165H71.8958V19.8332H76.8542C78.8076 19.8332 80.7419 20.2179 82.5466 20.9655C84.3513 21.713 85.9911 22.8087 87.3724 24.19C88.7537 25.5712 89.8493 27.211 90.5969 29.0158C91.3444 30.8205 91.7292 32.7548 91.7292 34.7082C91.7292 36.6616 91.3444 38.5959 90.5969 40.4006C89.8493 42.2053 88.7537 43.8451 87.3724 45.2264C85.9911 46.6077 84.3513 47.7033 82.5466 48.4509C80.7419 49.1984 78.8076 49.5832 76.8542 49.5832H71.8958V59.4998H76.8542C83.4293 59.4998 89.7352 56.8879 94.3845 52.2385C99.0339 47.5892 101.646 41.2833 101.646 34.7082C101.646 28.133 99.0339 21.8272 94.3845 17.1778C89.7352 12.5285 83.4293 9.9165 76.8542 9.9165ZM0 94.2082C0 87.633 2.61197 81.3271 7.26131 76.6778C11.9107 72.0285 18.2165 69.4165 24.7917 69.4165H59.5C66.0752 69.4165 72.381 72.0285 77.0304 76.6778C81.6797 81.3271 84.2917 87.633 84.2917 94.2082V104.125H74.375V94.2082C74.375 90.2631 72.8078 86.4796 70.0182 83.6899C67.2286 80.9003 63.4451 79.3332 59.5 79.3332H24.7917C20.8466 79.3332 17.0631 80.9003 14.2735 83.6899C11.4839 86.4796 9.91667 90.2631 9.91667 94.2082V104.125H0V94.2082ZM119 94.2082C119 90.9525 118.359 87.7287 117.113 84.7208C115.867 81.7129 114.041 78.9799 111.739 76.6778C109.437 74.3757 106.704 72.5495 103.696 71.3036C100.688 70.0578 97.464 69.4165 94.2083 69.4165H89.25V79.3332H94.2083C98.1534 79.3332 101.937 80.9003 104.727 83.6899C107.516 86.4796 109.083 90.2631 109.083 94.2082V104.125H119V94.2082Z"
                    fill="#044FAF"
                  />
                </svg>
                <div className="text-base xl:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                  Member
                  <div className="text-black text-sm xl:text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 xl:mt-5 h-[220px] xl:h-[270px] w-[220px] xl:w-[280px]"></div>
                </div>
                <a
                  href="/user/apply/member"
                  className="whitespace-nowrap absolute bottom-6 xl:bottom-9 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-xs xl:text-sm text-white px-8 xl:px-15 py-2.5 xl:py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
                >
                  Apply as Member
                </a>
              </div>
              <div className="relative flex flex-col w-64 xl:w-80 h-[400px] xl:h-[480px] rounded-[20px] xl:rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100"
                  height="100"
                  viewBox="0 0 120 120"
                  fill="none"
                  className="pt-3 xl:pt-5 xl:w-[120px] xl:h-[120px]"
                >
                  <path
                    d="M69.375 9.25H41.625C39.0707 9.25 37 11.3207 37 13.875V23.125C37 25.6793 39.0707 27.75 41.625 27.75H69.375C71.9293 27.75 74 25.6793 74 23.125V13.875C74 11.3207 71.9293 9.25 69.375 9.25Z"
                    stroke="#044FAF"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M74 18.5H83.25C85.7033 18.5 88.056 19.4746 89.7907 21.2093C91.5254 22.944 92.5 25.2967 92.5 27.75V92.5C92.5 94.9533 91.5254 97.306 89.7907 99.0407C88.056 100.775 85.7033 101.75 83.25 101.75H57.8125M18.5 62.4375V27.75C18.5 25.2967 19.4746 22.944 21.2093 21.2093C22.944 19.4746 25.2967 18.5 27.75 18.5H37"
                    stroke="#044FAF"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M61.8733 72.2705C62.7855 71.3582 63.5092 70.2752 64.0029 69.0833C64.4966 67.8913 64.7507 66.6138 64.7507 65.3237C64.7507 64.0336 64.4966 62.7561 64.0029 61.5641C63.5092 60.3722 62.7855 59.2892 61.8733 58.3769C60.961 57.4647 59.878 56.741 58.6861 56.2473C57.4941 55.7536 56.2166 55.4995 54.9265 55.4995C53.6364 55.4995 52.3589 55.7536 51.167 56.2473C49.975 56.741 48.892 57.4647 47.9798 58.3769L24.8085 81.5575C23.7089 82.6565 22.904 84.0149 22.4683 85.5072L18.5971 98.7809C18.4811 99.1789 18.4741 99.6008 18.577 100.002C18.6799 100.404 18.8888 100.77 19.182 101.064C19.4751 101.357 19.8416 101.566 20.2432 101.669C20.6448 101.771 21.0667 101.765 21.4646 101.648L34.7384 97.7773C36.2307 97.3416 37.5891 96.5367 38.6881 95.4371L61.8733 72.2705Z"
                    stroke="#044FAF"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="text-base xl:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                  Committee Staff
                  <div className="text-black text-sm xl:text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 xl:mt-5 h-[220px] xl:h-[270px] w-[220px] xl:w-[280px]"></div>
                </div>
                <a
                  href="/user/apply/committee-staff"
                  className="whitespace-nowrap absolute bottom-6 xl:bottom-9 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-xs xl:text-sm text-white px-6 xl:px-10 py-2.5 xl:py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
                >
                  Apply as Committee Staff
                </a>
              </div>
              <div className="relative flex flex-col w-64 xl:w-80 h-[400px] xl:h-[480px] rounded-[20px] xl:rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100"
                  height="100"
                  viewBox="0 0 120 120"
                  fill="none"
                  className="pt-3 xl:pt-5 xl:w-[120px] xl:h-[120px]"
                >
                  <path
                    d="M78.5555 100V13.7778C78.5555 10.9193 77.4199 8.17796 75.3987 6.15674C73.3775 4.13551 70.6361 3 67.7777 3H46.2221C43.3637 3 40.6223 4.13551 38.6011 6.15674C36.5799 8.17796 35.4443 10.9193 35.4443 13.7778V100"
                    stroke="#044FAF"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M100.111 24.5557H13.8889C7.93646 24.5557 3.11108 29.381 3.11108 35.3334V89.2223C3.11108 95.1747 7.93646 100 13.8889 100H100.111C106.063 100 110.889 95.1747 110.889 89.2223V35.3334C110.889 29.381 106.063 24.5557 100.111 24.5557Z"
                    stroke="#044FAF"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="text-base xl:text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                  Executive Assistant
                  <div className="text-black text-sm xl:text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-4 xl:mt-5 h-[220px] xl:h-[270px] w-[220px] xl:w-[280px]"></div>
                </div>
                <a
                  href="/user/apply/executive-assistant"
                  className="whitespace-nowrap absolute bottom-6 xl:bottom-9 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-xs xl:text-sm text-white px-4 xl:px-7 py-2.5 xl:py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
                >
                  Apply as Executive Assistant
                </a>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </section>
    </div>
  );
}
