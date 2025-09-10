"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ExecutiveAssistantApplication() {
  const router = useRouter();
  const { "eb-role": ebRole } = useParams<{ "eb-role": string }>();
  const ebId = ebRole;
  const { data: session } = useSession(); // Backend session check

  // Replace the current handleSubmit function with this:
  // const handleSubmit = async () => {
  //   if (!isChecked) {
  //     alert('Please agree to the terms and conditions')
  //     return
  //   }

  //   if (!formData.studentNumber || !formData.firstName || !formData.lastName ||
  //       !formData.section || !formData.secondChoice || !formData.cv) {
  //     alert('Please fill in all required fields')
  //     return
  //   }

  //   try {
  //     // Use your existing API endpoint
  //     const response = await fetch('/api/applications/ea/complete', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         studentNumber: formData.studentNumber,
  //         section: formData.section,
  //         firstName: formData.firstName,
  //         lastName: formData.lastName,
  //         firstOptionEb: ebId, // This comes from the URL parameter
  //         secondOptionEb: formData.secondChoice,
  //         cvLink: formData.cv, // This should be a URL/link, not file content
  //         portfolioLink: '', // Add if needed
  //       }),
  //     })

  //     if (response.ok) {
  //       router.push('/user/apply/executive-assistants/schedule')
  //     } else {
  //       const errorData = await response.json()
  //       alert(errorData.error || 'Application failed. Please try again.')
  //     }
  //   } catch (error) {
  //     console.error('Error submitting application:', error)
  //     alert('Application failed. Please try again.')
  //   }
  // }

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles = [
    {
      id: "president",
      title: "President",
      ebName: "Genna Cervantes",
      description:
        "Serves as the leader and representative of the Computer Science Society. They guide the organization’s vision, oversee all operations, and ensure that every project and initiative aligns with the org’s goals. The President also represents CSS in college and university-wide councils, making sure the voices of members are heard at every level.",
    },
    {
      id: "internal-vice-president",
      title: "Internal Vice President",
      ebName: "Mar Vincent De Guzman",
      description:
        "Manages the internal structure and daily operations of CSS. They coordinate with committees, monitor staff performance, and provide support to ensure smooth execution of events and projects. Acting as the President’s right hand, the Internal VP ensures that the organization runs efficiently from the inside.",
    },
    {
      id: "external-vice-president",
      title: "External Vice President",
      ebName: "Christian Bhernan Buenagua",
      description:
        "Handles the org’s outreach and partnerships. They build and maintain relationships with external organizations, other student groups, and industry partners. Their role strengthens CSS’s network beyond the society itself, creating opportunities for collaboration, exposure, and growth.",
    },
    {
      id: "secretary",
      title: "Secretary",
      ebName: "Joevanni Paulo Gumban",
      description:
        "Serves as the custodian of records and communication. They document meetings, handle correspondences, and maintain the official files of the organization. With attention to detail and organization, the Secretary ensures that the society’s operations are well-documented and transparent.",
    },
    {
      id: "assistant-secretary",
      title: "Assistant Secretary",
      ebName: "Marian Therese Pineza",
      description:
        "Helps and supports the Secretary with paperwork, logistics, and record-keeping. They often manage attendance records, assist in preparing documents, and ensure that no detail is overlooked in the org’s administrative work.",
    },
    {
      id: "treasurer",
      title: "Treasurer",
      ebName: "Braven Rei Goodwin",
      description:
        "In charge of the society’s financial health. They manage funds, prepare budgets, collect dues, and make financial reports. By ensuring transparency and accountability, the Treasurer helps sustain CSS activities while maximizing resources for its members.",
    },
    {
      id: "auditor",
      title: "Auditor",
      ebName: "Kendrick Beau Calvo",
      description:
        "Acts as the org’s financial watchdog. They review reports, check transactions, and ensure that all financial activities are ethical and accurate. Their role keeps the organization’s operations transparent and trustworthy.",
    },
    {
      id: "public-relations-officer",
      title: "Public Relations Officer (PRO)",
      ebName: "Nigel Roland Anunciacion",
      description:
        "Takes charge of publicity, branding, and communications. They create captions, manage social media presence, and oversee promotional campaigns to keep CSS visible and engaging. With creativity and consistency, the PRO ensures that every announcement and publication reflects the identity of the society.",
    },
    {
      id: "representative-4th-year",
      title: "4th Year Level Representative",
      ebName: "Alexandra Antonette Palanog",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
    },
    {
      id: "representative-3rd-year",
      title: "3rd Year Level Representative",
      ebName: "Nikolas Josef Dalisay",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
    },
    {
      id: "representative-2nd-year",
      title: "2nd Year Level Representative",
      ebName: "Chrisry Clerry Hermoso",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
    },
    {
      id: "representative-1st-year",
      title: "1st Year Level Representative",
      ebName: "John Carlo Benter",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
    },
    {
      id: "chief-of-staff",
      title: "Chief of Staff",
      ebName: "Carylle Keona Ilano",
      description:
        "Leads the pool of staff and executive assistants, making sure manpower is allocated properly during events and projects. They coordinate with the EB to deliver logistical support and ensure that every mission is carried out smoothly.",
    },
    {
      id: "director-digital-productions",
      title: "Director for Digital Productions",
      ebName: "Charmaine Chesca Villalobos",
      description:
        "Oversees the creative and multimedia output of CSS. From posters to videos, they ensure that the society’s visuals are engaging, professional, and aligned with its branding.",
    },
    {
      id: "director-community-development",
      title: "Director for Community Development",
      ebName: "Zeandarra Gaile Giva",
      description:
        "Leads the org’s outreach and social responsibility initiatives. They plan and execute projects that extend beyond academics, nurturing compassion, empathy, and service within the CSS community.",
    },
    {
      id: "thomasian-wellness-advocate",
      title: "Thomasian Wellness Advocate (TWA)",
      ebName: "Andrea Pauline Tan",
      description:
        "Champions the holistic well-being of members and students. They promote mental health, wellness programs, and activities that help balance academic life with personal growth. By fostering a supportive environment, the TWA ensures that the CSS community thrives not just academically, but also in well-being.",
    },
  ];

  const selectedRole = roles.find((r) => r.id === ebId);

  const [isChecked, setIsChecked] = useState(false);
  // REF: react hook form and zod
  const [formData, setFormData] = useState({
    studentNumber: "",
    firstName: "",
    lastName: "",
    section: "",
    secondChoice: "",
    phone: "",
    cv: "",
    motivation: "",
  });

  useEffect(() => {
    // Reset form when role changes
    setFormData({
      studentNumber: "",
      firstName: "",
      lastName: "",
      section: "",
      secondChoice: "",
      phone: "",
      cv: "",
      motivation: "",
    });
    setIsChecked(false);
  }, [ebId]);

  const committeeRoles = [
    { id: "academics", title: "Academics" },
    { id: "community", title: "Community Development" },
    { id: "creatives", title: "Creatives & Technical" },
    { id: "documentation", title: "Documentation" },
    { id: "external", title: "External Affairs" },
    { id: "finance", title: "Finance" },
    { id: "logistics", title: "Logistics" },
    { id: "publicity", title: "Publicity" },
    { id: "sports", title: "Sports & Talent" },
    { id: "technology", title: "Technology Development" },
  ];

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
    <div className="min-h-screen bg-white sm:bg-[rgb(243,243,253)] flex flex-col justify-between">
      <Header />

      <section className="flex flex-col items-center justify-center sm:my-12 lg:my-28">
        <div className="flex flex-col justify-center items-center">
          <div className="w-[80%] rounded-[24px] sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-10 md:p-16 lg:py-20 lg:px-24">
            <div className="text-2xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
              <span className="text-black">Apply as EA to the </span>
              <span className="text-[#134687]">{selectedRole.title}</span>
            </div>

            <div className="text-black text-xs lg:text-lg font-Inter font-light text-justify mb-4 lg:mb-8">
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

            {/* Application Form */}
            <div className="flex lg:px-20 lg:gap-60 lg:mt-8 justify-centerxl:px-32">
              <div className="flex flex-col gap-4 lg:gap-6">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <div className="text-black text-xs lg:text-sm font-Inter font-normal">
                    Student Number *
                  </div>
                  <div className="text-black text-xs lg:text-sm font-Inter w-full lg:w-[400px]">
                    <input
                      type="text"
                      value={formData.studentNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentNumber: e.target.value,
                        })
                      }
                      className="w-full h-9 lg:h-12  rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-sm lg:text-base"
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
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full h-9 lg:h-12 rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3  text-sm lg:text-base"
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
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full h-9 lg:h-12  rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3  text-sm lg:text-base"
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
                          {committeeRoles.map((role) => (
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

              <div className="hidden lg:flex justify-center mt-8">
                <div className="lg:w-50 lg:h-64 xl:w-80 xl:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">EB Image</span>
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
                onClick={() =>
                  router.push(
                    `/user/apply/executive-assistant/${ebId}/schedule`
                  )
                }
                className="whitespace-nowrap font-inter text-sm font-semibold text-[#134687] px-15 py-3 rounded-lg border-2 border-[#134687] bg-white hover:bg-[#B1CDF0] transition-all duration-150 active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
