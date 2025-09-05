"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ExecutiveAssistantApplication() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ebId = searchParams.get("eb");
  const { data: session } = useSession() // Backend session check

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
      <section className="min-h-screen bg-[rgb(243,243,253)]">
        <div className="flex flex-col justify-center items-center px-50 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-inter font-bold text-black mb-4">
              EB role not found
            </h1>
            <button
              onClick={() => router.push("/apply/executive-assistant")}
              className="bg-[#044FAF] text-white px-6 py-3 rounded-md font-inter font-normal text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
            >
              Back to EB Selection
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[rgb(243,243,253)]">
      <header className="flex p-5 items-center justify-between shadow-md shadow-black/40 bg-white">
        <Image
          src="/assets/logos/Logo_CSS Apply.svg"
          alt="CSS Apply Logo"
          width={110}
          height={190}
          className="drop-shadow-md"
        />
        <div className="flex items-center gap-4">
          <button className="bg-[#134687] font-inter text-xs text-white px-8 py-2 rounded-sm transition-all duration-150 active:scale-95">
            Log Out
          </button>
        </div>
      </header>

      <div className="flex flex-col justify-center items-center px-50 py-20">
        <div className="rounded-[24px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-28  w-full">
          <div className="text-4xl font-raleway font-semibold mb-4">
            <span className="text-black">Apply as EA to </span>
            <span className="text-[#134687]">{selectedRole.title}</span>
          </div>

          <div className="text-black text-md font-Inter font-light text-justify mb-8">
            Executive Assistants work closely with the CSS Executive Boards to
            help them with their tasks in events and committees. This role
            requires responsibility, attention to detail, and strong
            communication skills.
          </div>

          <hr className="my-8 border-t-1 border-[#717171]" />

          {/* Stepper */}
          <div className="w-full flex flex-col items-center justify-center mb-8">
            <div className="flex items-center">
              <div
                onClick={() => router.push("/apply/executive-assistant")}
                className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10 cursor-pointer hover:bg-[#DAE2ED] transition-colors"
              >
                <span className="text-[#696767] text-xs font-bold font-inter">
                  1
                </span>
              </div>
              <div className="w-24 h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-10 h-10">
                <span className="text-white text-xs font-bold font-inter">
                  2
                </span>
              </div>
              <div className="w-24 h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10">
                <span className="text-[#696767] text-xs font-bold font-inter">
                  3
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 w-100 mt-3 gap-x-0 place-items-center font-inter font-medium">
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Select a Role
              </span>
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Enter Information
              </span>
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Schedule Interview
              </span>
            </div>
          </div>

          {/* Application Form */}
          <div className="flex gap-40 ">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  Student Number *
                </div>
                <div className="text-black text-sm font-Inter w-[400px]">
                  <input
                    type="text"
                    value={formData.studentNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        studentNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-2 border-[#CDCECF] focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. 2019131907"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  First Name *
                </div>
                <div className="text-black text-sm font-Inter w-[400px]">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-2 border-[#CDCECF] focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. Juan"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  Last Name *
                </div>
                <div className="text-black text-sm font-Inter w-[400px]">
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full rounded-md border-2 border-[#CDCECF] focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. Dela Cruz"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-2">
                  <div className="text-black text-sm font-Inter font-normal">
                    Section *
                  </div>
                  <div className="text-black text-sm font-Inter w-[150px]">
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          section: e.target.value,
                        })
                      }
                      className="w-full rounded-md border-2 border-[#CDCECF] focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                      placeholder="e.g. 1CSA"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-black text-sm font-Inter font-normal">
                    Second Choice *
                  </div>
                  <div className="relative w-[240px]" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className={`w-full rounded-md border-2 focus:outline-none bg-white px-4 py-3 text-base text-left appearance-none bg-no-repeat bg-right bg-[length:16px] pr-10 truncate ${
                        isOpen ? "border-[#044FAF]" : "border-[#CDCECF]"
                      } ${
                        formData.secondChoice ? "text-black" : "text-[#888888]"
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

              <div className="flex gap-2 items-center">
                <div className="text-black text-sm font-Inter font-normal">
                  Curriculum Vitae (in pdf):
                </div>
                <div className="text-black text-xs font-Inter w-[200px]">
                  {formData.cv ? (
                    <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                      <span className="text-sm text-black truncate">
                        {formData.cv}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cv: "" })}
                        className="text-black hover:text-[#044FAF] ml-2 text-lg"
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
                      <div className="bg-[#044FAF] text-white text-sm font-semibold px-2 py-2 rounded-md hover:bg-[#04387B] transition-all duration-150 active:scale-95 text-center w-20">
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
                    className="w-6 h-6 appearance-none rounded-full border-2 border-gray-400 transition-all duration-200 focus:outline-none hover:border-[#134687] checked:bg-blue-500 shadow-inner cursor-pointer"
                    required
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-20 ${
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
                  className="text-black text-sm font-normal select-none cursor-pointer text-justify"
                >
                  The information you provide will be kept confidential and used
                  only for academic purposes. It will not be shared with third
                  parties and will be handled responsibly and ethically.
                </label>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <div className="w-80 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">EB Image</span>
              </div>
            </div>
          </div>

          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => router.push("/apply/executive-assistant")}
              className="bg-gray-300 text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-gray-400 transition-all duration-150 active:scale-95"
            >
              Back
            </button>
            <button
              type="submit"
              onClick={() => router.push("/schedule")}
              className="whitespace-nowrap font-inter text-sm font-semibold text-[#134687] px-15 py-3 rounded-lg border-2 border-[#134687] bg-white hover:bg-[#B1CDF0] transition-all duration-150 active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <footer className="w-full mt-16 py-8 pl-20 pr-20 bg-[#044FAF] text-white flex flex-row gap-100 items-start border-b-10 border-[#287FEB]">
        <div className="flex flex-col">
          <Image
            src="/assets/logos/Logo_CSS.svg"
            alt="A descriptive alt text for your image"
            width={60}
            height={60}
          />
          <div className="font-inter text-4xl font-semibold ">
            Computer Science Society
          </div>
          <div className="font-inter text-sm font-thin italic mb-2">
            The mother organization of the Computer Science Department
          </div>
          <div className="font-inter text-xs mb-2 mt-5">
            © {new Date().getFullYear()} Computer Science Society. All rights
            reserved.
          </div>
        </div>
        <div className="flex flex-col mt-10 font-inter ">
          <div className="text-lg font-semibold mb-2">Partner with us:</div>
          <div className="flex flex-col items-start">
            <a
              href="mailto:css.cics@ust.edu.ph"
              className="flex items-center gap-2 text-sm mb-1 font-light hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20.1 4H4.9C3.855 4 3.0095 4.95625 3.0095 6.125L3 18.875C3 20.0438 3.855 21 4.9 21H20.1C21.145 21 22 20.0438 22 18.875V6.125C22 4.95625 21.145 4 20.1 4ZM20.1 8.25L12.5 13.5625L4.9 8.25V6.125L12.5 11.4375L20.1 6.125V8.25Z"
                  fill="white"
                />
              </svg>
              <span className="flex items-center h-6">css.cics@ust.edu.ph</span>
            </a>
            <a
              href="https://www.facebook.com/ustcss"
              className="flex items-center gap-2 text-sm mb-1 font-light hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M22.9167 12.4997C22.9167 6.74967 18.25 2.08301 12.5 2.08301C6.75004 2.08301 2.08337 6.74967 2.08337 12.4997C2.08337 17.5413 5.66671 21.7393 10.4167 22.708V15.6247H8.33337V12.4997H10.4167V9.89551C10.4167 7.88509 12.0521 6.24967 14.0625 6.24967H16.6667V9.37467H14.5834C14.0105 9.37467 13.5417 9.84343 13.5417 10.4163V12.4997H16.6667V15.6247H13.5417V22.8643C18.8021 22.3434 22.9167 17.9059 22.9167 12.4997Z"
                  fill="white"
                />
              </svg>
              <span className="flex items-center h-6">
                UST Computer Science Society
              </span>
            </a>
            <a
              href="https://www.instagram.com/ustcss"
              className="flex items-center gap-2 text-sm mb-1 font-light hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M16.6667 3.125C18.048 3.125 19.3728 3.67373 20.3495 4.65049C21.3263 5.62724 21.875 6.952 21.875 8.33333V16.6667C21.875 18.048 21.3263 19.3728 20.3495 20.3495C19.3728 21.3263 18.048 21.875 16.6667 21.875H8.33333C6.952 21.875 5.62724 21.3263 4.65049 20.3495C3.67373 19.3728 3.125 18.048 3.125 16.6667V8.33333C3.125 6.952 3.67373 5.62724 4.65049 4.65049C5.62724 3.67373 6.952 3.125 8.33333 3.125H16.6667ZM12.5 8.33333C11.3949 8.33333 10.3351 8.77232 9.55372 9.55372C8.77232 10.3351 8.33333 11.3949 8.33333 12.5C8.33333 13.6051 8.77232 14.6649 9.55372 15.4463C10.3351 16.2277 11.3949 16.6667 12.5 16.6667C13.6051 16.6667 14.6649 16.2277 15.4463 15.4463C16.2277 14.6649 16.6667 13.6051 16.6667 12.5C16.6667 11.3949 16.2277 10.3351 15.4463 9.55372C14.6649 8.77232 13.6051 8.33333 12.5 8.33333ZM12.5 10.4167C13.0525 10.4167 13.5824 10.6362 13.9731 11.0269C14.3638 11.4176 14.5833 11.9475 14.5833 12.5C14.5833 13.0525 14.3638 13.5824 13.9731 13.9731C13.5824 14.3638 13.0525 14.5833 12.5 14.5833C11.9475 14.5833 11.4176 14.3638 11.0269 13.9731C10.6362 13.5824 10.4167 13.0525 10.4167 12.5C10.4167 11.9475 10.6362 11.4176 11.0269 11.0269C11.4176 10.6362 11.9475 10.4167 12.5 10.4167ZM17.1875 6.77083C16.9112 6.77083 16.6463 6.88058 16.4509 7.07593C16.2556 7.27128 16.1458 7.53623 16.1458 7.8125C16.1458 8.08877 16.2556 8.35372 16.4509 8.54907C16.6463 8.74442 16.9112 8.85417 17.1875 8.85417Z"
                  fill="white"
                />
              </svg>
              <span className="flex items-center h-6">@ustcss</span>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
