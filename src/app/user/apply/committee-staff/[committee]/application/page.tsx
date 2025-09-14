"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CommitteeApplication() {
  const router = useRouter();
  const { committee: committeeId } = useParams<{ committee: string }>();
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    studentNumber: "",
    firstName: "",
    lastName: "",
    section: "",
    secondChoice: "",
    cv: "",
    portfolioLink: "",
  });

  // Prefill user data from session
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        // Prefill first and last name from Google session
        const fullName = session?.user?.name || "";
        if (fullName) {
          const nameParts = fullName.trim().split(/\s+/);
          const extractedFirstName = nameParts.shift() || "";
          const extractedLastName = nameParts.join(" ");
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || extractedFirstName,
            lastName: prev.lastName || extractedLastName,
          }));
        }

        // Fetch existing user data
        const response = await fetch("/api/applications/committee-staff");
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "studentNumber") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Update the handleSubmit function in your committee-staff application page.tsx
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

    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    if (!formData.section) {
      setError("Please enter your section");
      setLoading(false);
      return;
    }

    if (!formData.secondChoice) {
      setError("Please select a second choice committee");
      setLoading(false);
      return;
    }

    if (!formData.cv) {
      setError("Please upload your CV");
      setLoading(false);
      return;
    }

    if (
      (selectedCommittee?.id === "creatives" ||
        selectedCommittee?.id === "technology") &&
      !formData.portfolioLink
    ) {
      setError("Please upload your portfolio");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting application data:", {
        studentNumber: formData.studentNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        section: formData.section,
        firstOptionCommittee: committeeId,
        secondOptionCommittee: formData.secondChoice,
        cv: formData.cv,
        portfolio: formData.portfolioLink,
      });

      const response = await fetch("/api/applications/committee-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber: formData.studentNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          section: formData.section,
          firstOptionCommittee: committeeId,
          secondOptionCommittee: formData.secondChoice,
          cv: formData.cv,
          portfolio: formData.portfolioLink,
        }),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (response.ok) {
        router.push(`/user/apply/committee-staff/${committeeId}/schedule`);
      } else {
        setError(
          responseData.error ||
            responseData.details ||
            "Application submission failed"
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("An error occurred while submitting your application");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCommittee) {
    return (
      <div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white sm:bg-[rgb(243,243,253)] sm:bg-[url('/assets/pictures/background.png')] sm:bg-cover  sm:bg-no-repeat flex flex-col justify-between">
      <Header />

      <section className="flex flex-col items-center justify-center sm:my-12 lg:my-28">
        <div className="w-[80%] flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-10 md:p-16 lg:py-20 lg:px-24"
          >
            <div className="text-3xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
              <span className="text-black">Apply for </span>
              <span className="text-[#134687]">
                {selectedCommittee.title} Committee
              </span>
            </div>

            <div className="text-black text-xs lg:text-[16px] font-Inter font-light text-justify">
              {selectedCommittee.description}
            </div>

            <hr className="my-5 lg:my-8 border-t-1 border-[#717171]" />

            {/* Stepper */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex items-center">
                <div
                  onClick={() => router.push("/user/apply/committee-staff")}
                  className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-5 h-5 lg:w-10 lg:h-10 cursor-pointer hover:bg-[#DAE2ED] transition-colors"
                >
                  <span className="text-[#696767] text-[9px] lg:text-xs lg:font-bold font-inter">
                    1
                  </span>
                </div>
                <div className="w-20 lg:w-24 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />
                <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-5 h-5 lg:w-10 lg:h-10">
                  <span className="text-white text-[9px] lg:text-xs lg:font-bold font-inter">
                    2
                  </span>
                </div>
                <div className="w-20 lg:w-24 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />
                <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-5 h-5 lg:w-10 lg:h-10">
                  <span className="text-[#696767] text-[9px] lg:text-xs lg:font-bold font-inter">
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

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Application Form */}
            <div className="flex flex-col lg:flex-row justify-center lg:gap-8 mt-5 lg:mt-8">
              <div className="flex flex-col gap-4 lg:gap-6">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                    Student Number *
                  </div>
                  <div className="text-black text-xs lg:text-sm font-Inter w-full lg:w-[400px]">
                    <input
                      type="text"
                      name="studentNumber"
                      value={formData.studentNumber}
                      onChange={handleInputChange}
                      className="w-full h-9 lg:h-12 rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                      placeholder="e.g. 2019131907"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 lg:gap-2">
                  <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                    First Name *
                  </div>
                  <div className="text-black text-sm font-Inter w-full lg:w-[400px]">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full h-9 lg:h-12 rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                      placeholder="e.g. Juan"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 lg:gap-2">
                  <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                    Last Name *
                  </div>
                  <div className="text-black lg:text-sm font-Inter lg:w-[400px]">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full h-9 lg:h-12 rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                      placeholder="e.g. Dela Cruz"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 lg:gap-2">
                    <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                      Section *
                    </div>
                    <div className="text-black lg:text-sm font-Inter w-28 lg:w-[150px]">
                      <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            section: e.target.value,
                          })
                        }
                        className="w-full h-9 lg:h-12 rounded-md border-2 border-[#CDCECF] focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
                        placeholder="e.g. 1CSA"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 lg:gap-2">
                    <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                      Second Choice *
                    </div>
                    <div
                      className="relative w-44 lg:w-[240px]"
                      ref={dropdownRef}
                    >
                      <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full h-9 lg:h-12 rounded-md border-2 focus:outline-none bg-white px-2 lg:px-4 lg:py-3 text-sm lg:text-base text-left appearance-none bg-no-repeat bg-right bg-[length:16px] lg:pr-10 truncate ${
                          isOpen ? "border-[#044FAF]" : "border-[#CDCECF]"
                        } ${
                          formData.secondChoice
                            ? "text-black"
                            : "text-[#888888]"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        }}
                      >
                        {formData.secondChoice
                          ? committeeRoles.find(
                              (role) => role.id === formData.secondChoice
                            )?.title
                          : "Select a Committee"}
                      </button>
                      {isOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#044FAF] rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                          {committeeRoles
                            .filter((role) => role.id !== committeeId)
                            .map((role) => (
                              <div
                                key={role.id}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    secondChoice: role.id,
                                  });
                                  setIsOpen(false);
                                }}
                                className={`px-4 py-3 text-base text-black cursor-pointer hover:bg-[#DCECFF] transition-colors duration-150 ${
                                  formData.secondChoice === role.id
                                    ? "border-l-4 border-[#044FAF]"
                                    : ""
                                }`}
                              >
                                {role.title}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 lg:gap-2 items-center">
                  <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                    Curriculum Vitae (in pdf):
                  </div>
                  <div className="text-black lg:text-xs font-Inter lg:w-[200px]">
                    {formData.cv ? (
                      <div className="flex items-center justify-between bg-gray-100 p-2 lg:px-3 lg:py-2 rounded-md">
                        <span className="lg:text-sm text-black truncate">
                          {formData.cv}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cv: "" })}
                          className="text-black hover:text-[#044FAF] lg:ml-2 lg:text-lg"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="cv-upload" className="cursor-pointer">
                        <input
                          id="cv-upload"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, cv: file.name });
                            }
                          }}
                          className="hidden"
                          required
                        />
                        <div className="bg-[#044FAF] text-white text-xs lg:text-sm lg:font-semibold py-1 px-3 lg:px-2 lg:py-2 rounded-md hover:bg-[#04387B] transition-all duration-150 active:scale-95 text-center w-20">
                          Upload
                        </div>
                      </label>
                    )}
                  </div>
                </div>
                {(selectedCommittee.id === "creatives" ||
                  selectedCommittee.id === "technology") && (
                  <div className="flex gap-4 lg:gap-2 items-center">
                    <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                      Portfolio (in pdf):
                    </div>
                    <div className="text-black lg:text-xs font-Inter lg:w-[200px]">
                      {formData.portfolioLink ? (
                        <div className="flex items-center justify-between bg-gray-100 p-2 lg:px-3 lg:py-2 rounded-md">
                          <span className="lg:text-sm text-black truncate">
                            {formData.portfolioLink}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, portfolioLink: "" })
                            }
                            className="text-black hover:text-[#044FAF] lg:ml-2 lg:text-lg"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="portfolio-upload"
                          className="cursor-pointer"
                        >
                          <input
                            id="portfolio-upload"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData({
                                  ...formData,
                                  portfolioLink: file.name,
                                });
                              }
                            }}
                            className="hidden"
                            required
                          />
                          <div className="bg-[#044FAF] text-white text-xs lg:text-sm lg:font-semibold py-1 px-3 lg:px-2 lg:py-2 rounded-md hover:bg-[#04387B] transition-all duration-150 active:scale-95 text-center w-20">
                            Upload
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      id="agreement-checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="w-4 h-4 lg:w-6 lg:h-6 appearance-none rounded-full border-2 border-gray-400 transition-all duration-200 focus:outline-none hover:border-[#134687] checked:bg-blue-500 shadow-inner cursor-pointer"
                      required
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
                    htmlFor="agreement-checkbox"
                    className="text-black text-xs lg:text-sm font-normal select-none cursor-pointer text-justify"
                  >
                    The information you provide will be kept confidential and
                    used only for academic purposes. It will not be shared with
                    third parties and will be handled responsibly and ethically.
                  </label>
                </div>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="w-80 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Committee Image</span>
                </div>
              </div>
            </div>
            <hr className="my-8 border-t-1 border-[#717171]" />
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/user/apply/committee-staff")}
                className="hidden lg:block bg-[#E7E3E3] text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#CDCCCC] transition-all duration-150 active:scale-95"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap font-inter text-sm font-semibold text-[#134687] px-15 py-3 rounded-lg border-2 border-[#134687] bg-white hover:bg-[#B1CDF0] transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Next"}
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
