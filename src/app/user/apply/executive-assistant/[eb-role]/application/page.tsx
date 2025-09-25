"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { roles } from "@/data/ebRoles";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { parseFullName } from "@/lib/name-parsing";
import { useFormPersistence } from "@/lib/useFormPersistence";

export default function ExecutiveAssistantApplication() {
  const router = useRouter();
  const { "eb-role": ebId } = useParams<{ "eb-role": string }>();

  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedRole = roles.find((r) => r.id === ebId);

  const [isChecked, setIsChecked] = useState(false);
  const [hasCheckedApplications, setHasCheckedApplications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetchedData, setHasFetchedData] = useState(false);

  const [uploading, setUploading] = useState({ cv: false });
  const [uploadError, setUploadError] = useState({ cv: "" });

  const initialFormData = {
    studentNumber: "",
    firstName: "",
    lastName: "",
    section: "",
    secondOptionEb: "",
    cv: "",
  };

  const initialUIState = {
    isOpen: false,
  };

  const { formData, uiState, updateFormData, updateUIState, clearFormData, isLoaded } = useFormPersistence(
    initialFormData,
    `ea-application-${ebId}`,
    [ebId], // Clear when EB role changes
    initialUIState
  );

  // Helper function to check if a string is a valid Supabase URL
  const isValidSupabaseUrl = (url: string) => {
    if (!url) return false;
    // Check if it's a valid URL and contains supabase.co
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('supabase.co') || urlObj.hostname.includes('supabase.com');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (status !== "authenticated" || !session?.user?.email || !isLoaded || hasFetchedData) return;

      try {
        // Prefill first and last name from Google session
        const fullName = session?.user?.name || "";
        if (fullName) {
          const { firstName: extractedFirstName, lastName: extractedLastName } =
            parseFullName(fullName);
          updateFormData({
            firstName: extractedFirstName,
            lastName: extractedLastName,
          });
        }

        // Fetch existing user data
        const response = await fetch("/api/applications/executive-assistant");
        if (response.ok) {
          const data = await response.json();
          
          // Only update fields that are empty to preserve user input
          const updates: Partial<typeof formData> = {};
          
          if (!formData.studentNumber && data.user?.studentNumber) {
            updates.studentNumber = data.user.studentNumber;
          }
          
          if (!formData.section && data.user?.section) {
            updates.section = data.user.section;
          }
          
          if (!formData.cv && data.application?.cv) {
            updates.cv = data.application.cv;
          }
          
          if (!formData.secondOptionEb && data.application?.secondOptionEb) {
            updates.secondOptionEb = data.application.secondOptionEb;
          }
          
          // Only update if there are changes to make
          if (Object.keys(updates).length > 0) {
            updateFormData(updates);
          }
        }
        
        setHasFetchedData(true);
      } catch (err) {
        console.error("Failed to fetch application data:", err);
      }
    };

    fetchApplicationData();
  }, [session, status, isLoaded, updateFormData, hasFetchedData, formData.studentNumber, formData.section, formData.cv, formData.secondOptionEb]);

  // Check for if there are applications present
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
            const committeeId =
              data.applications.committee?.firstOptionCommittee;
            if (committeeId) {
              router.push(
                `/user/apply/committee-staff/${committeeId}/progress`
              );
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        updateUIState({ isOpen: false });
      }
    };
    if (uiState.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [uiState.isOpen, updateUIState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "studentNumber") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      updateFormData({ [name]: numericValue });
    } else {
      updateFormData({ [name]: value });
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

    if (!formData.secondOptionEb) {
      setError("Please select a second choice EB role");
      setLoading(false);
      return;
    }

    if (!formData.cv) {
      setError("Please upload or wait for your CV to finish uploading");
      setLoading(false);
      return;
    }

    // Validate that CV is a valid Supabase URL (not a filename)
    if (!isValidSupabaseUrl(formData.cv)) {
      setError("CV upload failed. Please re-upload your CV file.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/applications/executive-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentNumber: formData.studentNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          section: formData.section,
          ebRole: ebId,
          firstOptionEb: ebId,
          secondOptionEb: formData.secondOptionEb,
          cv: formData.cv,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        clearFormData(); // Clear the form data from localStorage
        router.push(`/user/apply/executive-assistant/${ebId}/schedule`);
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

  const handleFileUpload = async (file: File, type: "cv") => {
    if (!file || !formData.studentNumber || !formData.section) {
      setUploadError((prev) => ({
        ...prev,
        [type]: "Student number and section are required",
      }));
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadError((prev) => ({
        ...prev,
        [type]: "Only PDF files are allowed",
      }));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError((prev) => ({
        ...prev,
        [type]: "File size must be less than 10MB",
      }));
      return;
    }

    setUploading((prev) => ({ ...prev, [type]: true }));
    setUploadError((prev) => ({ ...prev, [type]: "" }));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("studentNumber", formData.studentNumber);
      uploadFormData.append("section", formData.section);
      uploadFormData.append("fileType", type);
      uploadFormData.append("applicationType", "ea");

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      if (response.ok) {
        updateFormData({ cv: result.url });
      } else {
        setUploadError((prev) => ({
          ...prev,
          [type]: result.error || "Upload failed",
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError((prev) => ({
        ...prev,
        [type]: "Upload failed. Please try again.",
      }));
      // Don't store filename - leave the field empty so user must retry upload
      updateFormData({ cv: "" });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (!selectedRole) {
    return (
      <div>
        <section className="min-h-screen bg-[rgb(243,243,253)]">
          <div className="flex flex-col justify-center items-center px-50 py-20">
            <div className="text-center">
              <h1 className="text-2xl font-inter font-bold text-black mb-4">
                EB role not found
              </h1>
              <button
                onClick={() => router.push("/user/apply/executive-assistant")}
                className="bg-[#044FAF] text-white px-6 py-3 rounded-md font-inter font-normal text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
              >
                Back to EB Selection
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white sm:bg-[rgb(243,243,253)] sm:bg-[url('https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/pictures/background.png')] sm:bg-cover  sm:bg-no-repeat flex flex-col justify-between">
      <Header />

      <section className="flex flex-col items-center justify-center sm:my-12 lg:my-28">
        <div className="w-[80%] flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-10 md:p-16 lg:py-20 lg:px-24"
          >
            <div className="text-3xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
              <span className="text-black">Apply as EA to the </span>
              <span className="text-[#134687]">{selectedRole.title}</span>
            </div>

            <div className="text-black text-xs lg:text-[16px] font-Inter font-light text-justify">
              Executive Assistants work closely with the CSS Executive Boards to
              help them with their tasks in events and committees. This role
              requires responsibility, attention to detail, and strong
              communication skills.
            </div>

            <hr className="my-5 lg:my-8 border-t-1 border-[#717171]" />

            {/* Stepper */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex items-center">
                <div
                  onClick={() => router.push("/user/apply/executive-assistant")}
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
                        updateFormData({ firstName: e.target.value })
                      }
                      readOnly
                      disabled
                      aria-readonly
                      className="w-full h-9 lg:h-12  rounded-md border-2 border-[#CDCECF] bg-gray-100 text-gray-700 px-4 py-3 text-sm lg:text-base"
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
                        updateFormData({ lastName: e.target.value })
                      }
                      readOnly
                      disabled
                      aria-readonly
                      className="w-full h-9 lg:h-12  rounded-md border-2 border-[#CDCECF] bg-gray-100 text-gray-700 px-4 py-3 text-sm lg:text-base"
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
                        onChange={handleInputChange}
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
                        onClick={() => updateUIState({ isOpen: !uiState.isOpen })}
                        className={`w-full h-9 lg:h-12 rounded-md border-2 focus:outline-none bg-white px-2 lg:px-4 lg:py-3 text-sm lg:text-base text-left appearance-none bg-no-repeat bg-right bg-[length:16px] lg:pr-10 truncate ${
                          uiState.isOpen ? "border-[#044FAF]" : "border-[#CDCECF]"
                        } ${
                          formData.secondOptionEb
                            ? "text-black"
                            : "text-[#888888]"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        }}
                      >
                        {formData.secondOptionEb
                          ? roles.find(
                              (role) => role.id === formData.secondOptionEb
                            )?.title
                          : "Select an EB role"}
                      </button>
                      {uiState.isOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#044FAF] rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                          {roles
                            .filter((role) => role.id !== ebId)
                            .map((role) => (
                              <div
                                key={role.id}
                                onClick={() => {
                                  updateFormData({
                                    secondOptionEb: role.id,
                                  });
                                  updateUIState({ isOpen: false });
                                }}
                                className={`px-4 py-3 text-base text-black cursor-pointer hover:bg-[#DCECFF] transition-colors duration-150 ${
                                  formData.secondOptionEb === role.id
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
                          {formData.cv.includes("http")
                            ? "CV Uploaded ✓"
                            : formData.cv}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateFormData({ cv: "" })}
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
                              if (file.size > 10 * 1024 * 1024) {
                                setUploadError((prev) => ({
                                  ...prev,
                                  cv: "File size must be less than 10MB",
                                }));
                                return;
                              }
                              handleFileUpload(file, "cv");
                            }
                          }}
                          className="hidden"
                          required
                        />
                        <div className="bg-[#044FAF] text-white text-xs lg:text-sm lg:font-semibold py-1 px-3 lg:px-2 lg:py-2 rounded-md hover:bg-[#04387B] transition-all duration-150 active:scale-95 text-center w-20">
                          {uploading.cv ? "..." : "Upload"}
                        </div>
                      </label>
                    )}
                    {uploadError.cv && (
                      <div className="text-red-500 text-xs mt-1">
                        {uploadError.cv}
                      </div>
                    )}
                  </div>
                </div>

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
                    I agree that the information I provide will be kept
                    confidential and used only for academic purposes. It will
                    not be shared with third parties and will be handled
                    responsibly and ethically.
                  </label>
                </div>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="w-80 h-96 rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-b from-blue-900 via-blue-90 to-[#2F7EE3] flex items-center justify-center">
                  <span className="text-white text-lg font-semibold text-center px-4">
                    {selectedRole?.title || "EB Role"}
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-8 border-t-1 border-[#717171]" />
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/user/apply/executive-assistant")}
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
