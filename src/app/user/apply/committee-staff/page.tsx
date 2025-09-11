"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StaffApplication() {
  const [selectedRole, setSelectedRole] = useState<string | null>("academics");
  const router = useRouter();

  const committeeRoles = [
    {
      id: "academics",
      title: "Academics Committee",
      description:
        "This committee is dedicated to enhancing the academic environment within the CSS organization. It provides reviewers and organizes tutorials to support CSS students. Additionally, the committee organizes academic-related events, such as quiz bees and programming contests, fostering a vibrant intellectual community.",
      requirements: [
        "Strong academic performance",
        "Teaching ability",
        "Subject expertise",
      ],
    },
    {
      id: "community",
      title: "Community Development Committee",
      description:
        "This committee works towards improving and sustaining the well-being of the local community. They devise and implement community-based projects and events that foster social interaction, civic engagement, and community empowerment. It may focus on areas such as housing, employment, health services, or environmental initiatives.",
      requirements: [
        "Community engagement experience",
        "Project management skills",
        "Social awareness",
      ],
    },
    {
      id: "creatives",
      title: "Creatives & Technical Committee",
      description:
        "This committee oversees the design and production of all creative outputs of the organization, including digital graphics, promotional materials, and event decoration. The technical side of the committee ensures that all technical needs for events and operations, like sound and lighting systems, are catered for.",
      requirements: [
        "Design skills",
        "Technical knowledge",
        "Creative thinking",
      ],
    },
    {
      id: "documentation",
      title: "Documentation Committee",
      description:
        "This committee is responsible for photojournalism, documenting all the activities and events of the organization. Their work ensures that the organization's achievements and memorable moments are captured and preserved for posterity.",
      requirements: [
        "Photography skills",
        "Writing ability",
        "Attention to detail",
      ],
    },
    {
      id: "external",
      title: "External Affairs Committee",
      description:
        "This committee manages relationships and communications with entities outside the organization. This includes liaising with other organizations, government bodies, sponsors, and the media. It also handles public relations, partnership development, and conflict resolution.",
      requirements: [
        "Communication skills",
        "Networking ability",
        "Diplomatic skills",
      ],
    },
    {
      id: "finance",
      title: "Finance Committee",
      description:
        "This committee oversees the organization's budgeting, expenditure, and revenue generation. It also provides financial advice to the organization, ensures fiscal responsibility, and conducts regular audits for transparency and accountability.",
      requirements: [
        "Basic accounting knowledge",
        "Attention to detail",
        "Responsibility",
      ],
    },
    {
      id: "logistics",
      title: "Logistics Committee",
      description:
        "This committee manages and maintains all properties owned by the organization. It keeps a thorough record of all expenses related to CSS activities and properties, ensuring transparency and accountability in the organization's financial operations.",
      requirements: [
        "Organization skills",
        "Problem-solving",
        "Record keeping",
      ],
    },
    {
      id: "publicity",
      title: "Publicity Committee",
      description:
        "This committee manages all promotional activities for the organization. It is responsible for creating and implementing marketing strategies, managing social media platforms, and publicizing events and activities to target audiences.",
      requirements: [
        "Marketing knowledge",
        "Social media skills",
        "Creative writing",
      ],
    },
    {
      id: "sports",
      title: "Sports & Talent Committee",
      description:
        "This committee organizes and oversees all sports-related and talent activities within the organization. It may coordinate sporting events, talent shows, or workshops and ensure the organization's members have opportunities to develop and showcase their talents.",
      requirements: [
        "Event coordination skills",
        "Sports knowledge",
        "Talent appreciation",
      ],
    },
    {
      id: "technology",
      title: "Technology Development Committee",
      description:
        "This committee is responsible for spearheading all technology-related projects and events within the organization. Key tasks include creating and maintaining the CSS website, implementing new technologies to streamline organizational operations, and organizing tech-focused workshops or seminars to enhance the digital skills of the members.",
      requirements: [
        "Technical skills",
        "Web development knowledge",
        "Innovation mindset",
      ],
    },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white sm:bg-[rgb(243,243,253)] flex flex-col justify-between">
      <Header />

      <section className="flex flex-col items-center justify-center sm:my-12 lg:my-28">
        <div className="w-[80%] flex flex-col justify-center items-center">
          <div className="rounded-[24px] sm:bg-white sm:shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-10 md:p-16 lg:py-20 lg:px-24">
            <div className="text-3xl lg:text-4xl font-raleway font-semibold mb-2 lg:mb-4">
              <span className="text-black">Apply as </span>
              <span className="text-[#134687]">Committee Staff</span>
            </div>

            <div className="text-black text-xs lg:text-lg font-Inter font-light text-justify">
              As a Committee Staff of the Computer Science Society, you will
              play a vital role in bringing our initiatives to life. From
              supporting events and managing logistics to collaborating with
              fellow members and leaders, your efforts ensure that every project
              runs smoothly and every idea has the chance to shine.
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
            <div className="flex flex-col lg:flex-row justify-center lg:gap-8 mt-5 lg:mt-8">
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
              <div className="w-full lg:w-2/3 max-w-2xl mt-4 lg:mt-0">
                {selectedRole ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left side - Text content */}
                      <div className="w-full lg:w-3/5 p-6">
                        {(() => {
                          const role = committeeRoles.find(
                            (r) => r.id === selectedRole
                          );
                          return role ? (
                            <>
                              <h4 className="text-xl font-inter font-bold text-black mb-4">
                                {role.title}
                              </h4>
                              <p className="text-[10px] lg:text-[13px] font-normal font-inter text-black lg:mb-6 leading-relaxed text-justify max-h-48 overflow-y-auto p-2">
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
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      <div className="w-full lg:w-3/5 p-6 flex items-center justify-center h-80">
                        <p className="text-gray-500 font-inter">
                          Select a role to view details
                        </p>
                      </div>
                      <div className="w-full lg:w-2/5 bg-gray-200 h-80"></div>
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
              {/* REF: lagyan ng guard pag walang selected role, naka disable  */}
              {selectedRole && (
                <button
                  onClick={() =>
                    router.push(
                      `/user/apply/committee-staff/${selectedRole}/application`
                    )
                  }
                  className="whitespace-nowrap font-inter text-sm font-semibold text-[#134687] px-15 py-3 rounded-lg border-2 border-[#134687] bg-white hover:bg-[#B1CDF0] transition-all duration-150 active:scale-95"
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
