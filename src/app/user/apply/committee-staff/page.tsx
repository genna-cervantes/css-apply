"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffApplication() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
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
          <button className="bg-[#134687] font-inter text-xs text-white px-8 py-2 rounded-sm">
            Log Out
          </button>
        </div>
      </header>
      <div className="flex flex-col justify-center items-center px-50 py-20">
        <div className="rounded-[24px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-28">
          <div className="text-4xl font-raleway font-semibold mb-4">
            <span className="text-black">Apply as </span>
            <span className="text-[#134687]">Committee Staff</span>
          </div>
          <div className="text-black text-md font-Inter font-light text-justify">
            As a Committee Staff of the Computer Science Society, you will play
            a vital role in bringing our initiatives to life. From supporting
            events and managing logistics to collaborating with fellow members
            and leaders, your efforts ensure that every project runs smoothly
            and every idea has the chance to shine.
          </div>
          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="w-full flex flex-col items-center justify-center">
            <div className="flex items-center ">
              <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-10 h-10">
                <span className="text-white text-xs font-bold font-inter">
                  1
                </span>
              </div>

              <div className="w-24 h-[3px] bg-[#D9D9D9]" />

              <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10">
                <span className="text-[#696767] text-xs font-bold font-inter">
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
          <div className="flex justify-center gap-8 mt-8">
            {/* Left Column - Scrollable Role List */}
            <div className="w-1/3 max-w-md">
              <div className="max-h-80 overflow-y-auto ">
                {committeeRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 border-t border-b cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                      selectedRole === role.id
                        ? "border-[#2F7EE3] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">IMG</span>
                    </div>
                    <h4 className="font-inter font-semibold text-xs text-black">
                      {role.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Role Information */}
            <div className="w-2/3 max-w-2xl">
              {selectedRole ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex">
                    {/* Left side - Text content */}
                    <div className="w-3/5 p-6">
                      {(() => {
                        const role = committeeRoles.find(
                          (r) => r.id === selectedRole
                        );
                        return role ? (
                          <>
                            <h4 className="text-xl font-inter font-bold text-black mb-4">
                              {role.title}
                            </h4>
                            <p className="text-[13px] font-normal font-inter text-black mb-6 leading-relaxed text-justify">
                              {role.description}
                            </p>
                            <button
                              onClick={() =>
                                router.push(
                                  `/user/apply/committee-staff/${selectedRole}/application`
                                )
                              }
                              className="bg-[#044FAF] text-white px-10 py-3 rounded-md font-inter font-normal text-xs hover:bg-[#04387B] transition-colors"
                            >
                              Apply
                            </button>
                          </>
                        ) : null;
                      })()}
                    </div>
                    {/* Right side - Committee picture */}
                    <div className="w-2/5 bg-gray-200 h-80"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex">
                    <div className="w-3/5 p-6 flex items-center justify-center h-80">
                      <p className="text-gray-500 font-inter">
                        Select a role to view details
                      </p>
                    </div>
                    <div className="w-2/5 bg-gray-200 h-80"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-gray-300 text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-gray-400 transition-all duration-150 active:scale-95"
            >
              Back
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
                  d="M16.6667 3.125C18.048 3.125 19.3728 3.67373 20.3495 4.65049C21.3263 5.62724 21.875 6.952 21.875 8.33333V16.6667C21.875 18.048 21.3263 19.3728 20.3495 20.3495C19.3728 21.3263 18.048 21.875 16.6667 21.875H8.33333C6.952 21.875 5.62724 21.3263 4.65049 20.3495C3.67373 19.3728 3.125 18.048 3.125 16.6667V8.33333C3.125 6.952 3.67373 5.62724 4.65049 4.65049C5.62724 3.67373 6.952 3.125 8.33333 3.125H16.6667ZM12.5 8.33333C11.3949 8.33333 10.3351 8.77232 9.55372 9.55372C8.77232 10.3351 8.33333 11.3949 8.33333 12.5C8.33333 13.6051 8.77232 14.6649 9.55372 15.4463C10.3351 16.2277 11.3949 16.6667 12.5 16.6667C13.6051 16.6667 14.6649 16.2277 15.4463 15.4463C16.2277 14.6649 16.6667 13.6051 16.6667 12.5C16.6667 11.3949 16.2277 10.3351 15.4463 9.55372C14.6649 8.77232 13.6051 8.33333 12.5 8.33333ZM12.5 10.4167C13.0525 10.4167 13.5824 10.6362 13.9731 11.0269C14.3638 11.4176 14.5833 11.9475 14.5833 12.5C14.5833 13.0525 14.3638 13.5824 13.9731 13.9731C13.5824 14.3638 13.0525 14.5833 12.5 14.5833C11.9475 14.5833 11.4176 14.3638 11.0269 13.9731C10.6362 13.5824 10.4167 13.0525 10.4167 12.5C10.4167 11.9475 10.6362 11.4176 11.0269 11.0269C11.4176 10.6362 11.9475 10.4167 12.5 10.4167ZM17.1875 6.77083C16.9112 6.77083 16.6463 6.88058 16.4509 7.07593C16.2556 7.27128 16.1458 7.53623 16.1458 7.8125C16.1458 8.08877 16.2556 8.35372 16.4509 8.54907C16.6463 8.74442 16.9112 8.85417 17.1875 8.85417C17.4638 8.85417 17.7287 8.74442 17.9241 8.54907C18.1194 8.35372 18.2292 8.08877 18.2292 7.8125C18.2292 7.53623 18.1194 7.27128 17.9241 7.07593C17.7287 6.88058 17.4638 6.77083 17.1875 6.77083Z"
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
