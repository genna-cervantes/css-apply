// src/app/user/apply/member/page.tsx
"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Header from "@/components/Header";

export default function MemberApplication() {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Form state - all fields will be filled by user
  const [formData, setFormData] = useState({
    studentNumber: "",
    section: "",
  });

  // REF: gawing naka disable
  // Fetch existing application data when component mounts or session updates
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const response = await fetch("/api/applications/member");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            studentNumber: data.user?.studentNumber || "",
            section: data.user?.section || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch application data:", err);
      }
    };

    fetchApplicationData();
  }, [session, status]);

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

    // Validate all fields
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
        router.push("/user/member/application/payment");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Application submission failed");
      }
    } catch (error) {
      setError("An error occurred while submitting your application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white lg:bg-[rgb(243,243,253)]">
      <Header />

      <section className="min-h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center px-50 py-20">
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] md:bg-white lg:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] my-12 lg:my-0 md:p-20 lg:p-24"
          >
            <div className="text-2xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
              <span className="text-black">Apply as </span>
              <span className="text-[#134687]">Member</span>
            </div>
            <div className="text-black text-md font-Inter font-light">
              Be part of the Computer Science Society community. As a member,
              you'll gain access to exclusive workshops, events, and
              opportunities to grow alongside fellow students passionate about
              tech.
            </div>
            <hr className="my-8 border-t-1 border-[#717171]" />
            <div className="flex flex-col lg:flex-row gap-40">
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
                      className="w-full h-9 lg:h-12  rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                      placeholder="e.g. 2019131907"
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
                      className="w-full h-9 lg:h-12 rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
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
                    className="text-black text-sm font-normal select-none cursor-pointer text-justify"
                  >
                    The information you provide will be kept confidential and
                    used only for academic purposes. It will not be shared with
                    third parties and will be handled responsibly and ethically.
                  </label>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <img
                  src="/assets/pictures/MemberImage.jpg"
                  alt="Member"
                  className="w-190 h-110 object-cover shadow-md border border-[#2F7EE3] rounded-lg"
                />
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
                {loading ? "Submitting..." : "Pay Now"}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
