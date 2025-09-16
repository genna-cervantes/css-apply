// member application page.tsx
"use client";

import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Header from "@/components/Header";

export default function MemberApplication() {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasCheckedApplications, setHasCheckedApplications] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    studentNumber: "",
    section: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        // Prefill first and last name from Google session
        const fullName = session?.user?.name || "";
        if (fullName) {
          const nameParts = fullName.trim().split(/\s+/);
          const extractedLastName = nameParts.length > 1 ? nameParts.pop() as string : "";
          const extractedFirstName = nameParts.join(" ");
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || extractedFirstName,
            lastName: prev.lastName || extractedLastName,
          }));
        }

        const response = await fetch("/api/applications/member");
        if (response.ok) {
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            studentNumber: data.user?.studentNumber || "",
            section: data.user?.section || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch application data:", err);
      }
    };

    fetchApplicationData();
  }, [session, status]);

  if (status === "authenticated" && !hasCheckedApplications) {
    const checkApplications = async () => {
      try {
        const response = await fetch("/api/applications/check-existing");
        if (response.ok) {
          const data = await response.json();

          // Redirect based on existing applications
          if (data.hasMemberApplication) {
            router.push("/user/apply/member/progress");
          } else if (data.hasCommitteeApplication) {
            const committeeId = data.applications.committee?.firstOptionCommittee;
            if (committeeId) {
              router.push(`/user/apply/committee-staff/${committeeId}/progress`);
            }
          } else if (data.hasEAApplication) {
            const ebRole = data.applications.ea?.firstOptionEb;
            if (ebRole) {
              router.push(`/user/apply/executive-assistant/${ebRole}/progress`);
            }
          }
        }
      } catch (error) {
        console.error("Error checking applications:", error);
      } finally {
        setHasCheckedApplications(true);
      }
    };

    checkApplications();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "studentNumber") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isChecked) {
      setError("Please agree to the data privacy terms");
      setLoading(false);
      return;
    }

    if (!formData.studentNumber || formData.studentNumber.length !== 10) {
      setError("Please enter a valid 10-digit student number");
      setLoading(false);
      return;
    }

    if (!formData.section) {
      setError("Please enter your section");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/applications/member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber: formData.studentNumber,
          section: formData.section,
        }),
      });

      if (response.ok) {
        router.push("/user/apply/member/progress");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Application submission failed");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while submitting your application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:bg-[rgb(243,243,253)] md:bg-[url('/assets/pictures/background.png')] flex flex-col justify-between bg-cover bg-repeat">
      <Header />

      <section className="flex flex-col justify-between items-center px-20 py-10 lg:px-50 lg:py-20">
        <form
          onSubmit={handleSubmit}
          className="rounded-[24px]  md:bg-white lg:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] md:p-20 lg:p-28"
        >
          <div className="text-2xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
            <span className="text-black">Apply as </span>
            <span className="text-[#134687]">Member</span>
          </div>
          <div className="text-black text-xs lg:text-lg font-Inter font-light">
            Be part of the Computer Science Society community. As a member,
            you&apos;ll gain access to exclusive workshops, events, and opportunities
            to grow alongside fellow students passionate about tech.
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                  Student Number *
                </div>
                <div className="text-black text-sm font-Inter lg:w-[400px]">
                  <input
                    type="text"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="w-full h-9 lg:h-12  rounded-md border-2 border-[#CDCECF] focus:border-2 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                    placeholder="e.g. 2019131907"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                  Name *
                </div>
                <div className="text-black text-sm font-Inter lg:w-[400px]">
                  <input
                    type="text"
                    name="name"
                    value={[formData.firstName, formData.lastName]
                      .filter(Boolean)
                      .join(" ")}
                    readOnly
                    disabled
                    aria-readonly
                    className="w-full h-9 lg:h-12  rounded-md border-2 border-[#CDCECF] bg-gray-100 text-gray-700 px-4 py-3 text-sm lg:text-base"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                  Section *
                </div>
                <div className="text-black text-sm font-Inter w-36 lg:w-[200px]">
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                    className="w-full h-9 lg:h-12 rounded-md border-2 border-[#CDCECF] focus:border-2 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                    placeholder="e.g. 1CSA"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center lg:items-start gap-3">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    id="circle-checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    required
                    className="w-4 h-4 lg:w-6 lg:h-6 appearance-none rounded-full border-2 border-gray-400 transition-all duration-200 focus:outline-none
                    hover:border-[#134687]
                    checked:bg-blue-500
                    shadow-inner cursor-pointer"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <svg
                      className={`w-2 h-2 lg:w-4 lg:h-4 text-white transition-opacity duration-20 ${
                        isChecked ? "opacity-100" : "opacity-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 26 26"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <label
                  htmlFor="circle-checkbox"
                  className="text-black text-xs md:text-sm font-normal select-none cursor-pointer text-justify"
                >
                  I agree that the information I provide will be kept
                  confidential and used only for academic purposes. It will not
                  be shared with third parties and will be handled responsibly
                  and ethically.
                </label>
              </div>
            </div>

            <div className="hidden lg:flex justify-center items-center mt-8">
              <div className="relative w-[300px] h-[360px]">
                <Image
                  src="/assets/pictures/MemberImage.jpg"
                  alt="Member"
                  fill
                  sizes="300px"
                  className="object-cover shadow-md border border-[#2F7EE3] rounded-lg"
                />
              </div>
            </div>
          </div>
          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/user")}
              className="bg-gray-300 text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.studentNumber ||
                formData.studentNumber.length !== 10 ||
                !formData.section
              }
              className="whitespace-nowrap font-inter text-sm font-semibold text-white px-12 py-3 rounded-lg bg-[#134687] hover:bg-[#0d3569] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}
