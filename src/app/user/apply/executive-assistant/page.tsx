"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function AssistantApplication() {
  const [selectedRole, setSelectedRole] = useState<string | null>("president");
  const router = useRouter();

  const committeeRoles = [
    {
      id: "president",
      title: "President",
      description:
        "Serves as the leader and representative of the Computer Science Society. They guide the organization’s vision, oversee all operations, and ensure that every project and initiative aligns with the org’s goals. The President also represents CSS in college and university-wide councils, making sure the voices of members are heard at every level.",
      ebName: "Genna Cervantes",
    },
    {
      id: "internal-vice-president",
      title: "Internal Vice President",
      description:
        "Manages the internal structure and daily operations of CSS. They coordinate with committees, monitor staff performance, and provide support to ensure smooth execution of events and projects. Acting as the President’s right hand, the Internal VP ensures that the organization runs efficiently from the inside.",
      ebName: "Mar Vincent De Guzman",
    },
    {
      id: "external-vice-president",
      title: "External Vice President",
      description:
        "Handles the org’s outreach and partnerships. They build and maintain relationships with external organizations, other student groups, and industry partners. Their role strengthens CSS’s network beyond the society itself, creating opportunities for collaboration, exposure, and growth.",
      ebName: "Christian Bhernan Buenagua",
    },
    {
      id: "secretary",
      title: "Secretary",
      description:
        "Serves as the custodian of records and communication. They document meetings, handle correspondences, and maintain the official files of the organization. With attention to detail and organization, the Secretary ensures that the society’s operations are well-documented and transparent.",
      ebName: "Joevanni Paulo Gumban",
    },
    {
      id: "assistant-secretary",
      title: "Assistant Secretary",
      description:
        "Helps and supports the Secretary with paperwork, logistics, and record-keeping. They often manage attendance records, assist in preparing documents, and ensure that no detail is overlooked in the org’s administrative work.",
      ebName: "Marian Therese Pineza",
    },
    {
      id: "treasurer",
      title: "Treasurer",
      description:
        "In charge of the society’s financial health. They manage funds, prepare budgets, collect dues, and make financial reports. By ensuring transparency and accountability, the Treasurer helps sustain CSS activities while maximizing resources for its members.",
      ebName: "Braven Rei Goodwin",
    },
    {
      id: "auditor",
      title: "Auditor",
      description:
        "Acts as the org’s financial watchdog. They review reports, check transactions, and ensure that all financial activities are ethical and accurate. Their role keeps the organization’s operations transparent and trustworthy.",
      ebName: "Kendrick Beau Calvo",
    },
    {
      id: "public-relations-officer",
      title: "Public Relations Officer (PRO)",
      description:
        "Takes charge of publicity, branding, and communications. They create captions, manage social media presence, and oversee promotional campaigns to keep CSS visible and engaging. With creativity and consistency, the PRO ensures that every announcement and publication reflects the identity of the society.",
      ebName: "Nigel Roland Anunciacion",
    },
    {
      id: "representative-4th-year",
      title: "4th Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
      ebName: "Alexandra Antonette Palanog",
    },
    {
      id: "representative-3rd-year",
      title: "3rd Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
      ebName: "Nikolas Josef Dalisay",
    },
    {
      id: "representative-2nd-year",
      title: "2nd Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
      ebName: "Chrisry Clerry Hermoso",
    },
    {
      id: "representative-1st-year",
      title: "1st Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student’s voice is heard. Through active engagement, they represent their year level’s interests while strengthening unity across all batches.",
      ebName: "John Carlo Benter",
    },
    {
      id: "chief-of-staff",
      title: "Chief of Staff",
      description:
        "Leads the pool of staff and executive assistants, making sure manpower is allocated properly during events and projects. They coordinate with the EB to deliver logistical support and ensure that every mission is carried out smoothly.",
      ebName: "Carylle Keona Ilano",
    },
    {
      id: "director-digital-productions",
      title: "Director for Digital Productions",
      description:
        "Oversees the creative and multimedia output of CSS. From posters to videos, they ensure that the society’s visuals are engaging, professional, and aligned with its branding.",
      ebName: "Charmaine Chesca Villalobos",
    },
    {
      id: "director-community-development",
      title: "Director for Community Development",
      description:
        "Leads the org’s outreach and social responsibility initiatives. They plan and execute projects that extend beyond academics, nurturing compassion, empathy, and service within the CSS community.",
      ebName: "Zeandarra Gaile Giva",
    },
    {
      id: "thomasian-wellness-advocate",
      title: "Thomasian Wellness Advocate (TWA)",
      description:
        "Champions the holistic well-being of members and students. They promote mental health, wellness programs, and activities that help balance academic life with personal growth. By fostering a supportive environment, the TWA ensures that the CSS community thrives not just academically, but also in well-being.",
      ebName: "Andrea Pauline Tan",
    },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white sm:bg-[rgb(243,243,253)] flex flex-col justify-between">
      <Header />

      <section className="flex flex-col items-center justify-center sm:my-12 lg:my-28">
        <div className="w-[80%] rounded-[24px] flex flex-col justify-center items-center">
          <div className=" sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-10 md:p-16 lg:py-20 lg:px-24">
            <div className="text-3xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
              <span className="text-black">Apply as </span>
              <span className="text-[#134687]">Executive Assistant</span>
            </div>

            <div className="text-black text-xs lg:text-lg font-Inter font-light text-justify">
              Executive Assistants work closely with the CSS Executive Boards to
              help them with their tasks in events and committees. This role
              requires responsibility, attention to detail, and strong
              communication skills.
            </div>

            <hr className="my-5 lg:my-8 border-t-1 border-[#717171]" />

            {/* Stepper */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex items-center">
                <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-5 h-5 lg:w-10 lg:h-10">
                  <span className="text-white text-[9px] lg:text-xs lg:font-bold font-inter">
                    1
                  </span>
                </div>

                <div className="w-20 lg:w-24 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />

                <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-5 h-5 lg:w-10 lg:h-10">
                  <span className="text-[#696767] text-[9px] lg:text-xs lg:font-bold font-inter">
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
            <div className="flex flex-col lg:flex-row justify-center lg:gap-8 lg:mt-8">
              {/* Left Column - Scrollable Role List / Mobile Dropdown */}
              <div className="">
                {/* Mobile Dropdown (below lg) */}
                <div className="lg:hidden relative mt-6">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-5 border h-9 border-gray-300 rounded-lg bg-white flex items-center justify-between"
                  >
                    <span className="font-inter text-xs text-[#7a7a7a]">
                      {selectedRole
                        ? committeeRoles.find(
                            (role) => role.id === selectedRole
                          )?.title
                        : "Select an EB role"}
                    </span>
                    <span className="text-[#7a7a7a] text-xs font-extralight">
                      ▼
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      {committeeRoles.map((role) => (
                        <div
                          key={role.id}
                          onClick={() => {
                            setSelectedRole(role.id);
                            setIsDropdownOpen(false);
                          }}
                          className="p-2 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-3 last:border-b-0"
                        >
                          <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs">IMG</span>
                          </div>
                          <h4 className="font-inter font-semibold text-xs text-black">
                            {role.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Scrollable List (lg and above) */}
                <div className="hidden lg:block max-h-80 overflow-y-auto">
                  {committeeRoles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-7 border-t border-b cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                        selectedRole === role.id
                          ? "border-[#2F7EE3] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <h4 className="font-inter font-semibold text-xs text-black">
                        {role.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Role Information */}
              <div className="lg:w-[80%] flex flex-col items-center justify-center">
                {selectedRole ? (
                  <div className="lg:bg-white rounded-lg lg:border lg:border-gray-200">
                    <div className="flex overflow-hidden items-center">
                      {/* Left side - Text content */}
                      <div className="lg:w-3/5  lg:p-4">
                        {(() => {
                          const role = committeeRoles.find(
                            (r) => r.id === selectedRole
                          );
                          return role ? (
                            <>
                              <div className="flex items-center gap-5 mt-5 lg:mt-0">
                                <div className="lg:hidden w-14 h-14 min-w-14 min-h-14 rounded-full overflow-hidden bg-[#7a7a7a]">
                                  img
                                </div>
                                <div>
                                  <div className="text-[10px] lg:text-xs font-inter text-[#7a7a7a] lg:mb-1">
                                    <p>Be an Executive Assistant of</p>
                                  </div>
                                  <h4 className="flex text-md lg:text-xl font-inter font-bold text-black">
                                    {role.title}
                                  </h4>
                                  {role.ebName && (
                                    <p className="text-xs lg:text-sm italic font-inter text-[#134687] mb-3">
                                      {role.ebName}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <p className="text-[10px] lg:text-[13px] font-normal font-inter text-black lg:mb-6 leading-relaxed text-justify max-h-36 overflow-y-auto p-2">
                                {role.description}
                              </p>
                            </>
                          ) : null;
                        })()}
                      </div>

                      {/* Right side - Committee picture */}
                      <div className="hidden w-2/5 lg:block bg-gray-200 lg:h-80">
                        is it here
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-1 hidden lg:block">
                    <div className="flex">
                      <div className="lg:w-3/5 p-4 lg:p-6 flex items-center justify-center lg:h-80">
                        <p className="text-gray-500 font-inter text-center text-sm lg:text-base">
                          Select an EB role to be their Executive Assistant
                        </p>
                      </div>
                      <div className="lg:w-2/5 bg-gray-200 lg:h-80"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-8 border-t-1 border-[#717171]" />

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/user")}
                className="hidden lg:block bg-[#E7E3E3] text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#CDCCCC] transition-all duration-150 active:scale-95"
              >
                Back
              </button>
              {selectedRole && (
                <button
                  onClick={() =>
                    router.push(
                      `/user/apply/executive-assistant/${selectedRole}/application`
                    )
                  }
                  className="bg-[#044FAF] text-white px-15 py-3 rounded-lg font-inter font-normal text-sm hover:bg-[#04387B] transition-colors"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
