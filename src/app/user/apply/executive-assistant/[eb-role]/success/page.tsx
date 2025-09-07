"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const { "eb-role": ebRole } = useParams<{ "eb-role": string }>();
  const [scheduledTime, setScheduledTime] = useState<string>("");

  useEffect(() => {
    // Get scheduled time from localStorage or URL params
    const time = localStorage.getItem("scheduledTime");
    if (time) {
      setScheduledTime(time);
    }
  }, []);

  const executiveBoardRoles = [
    {
      id: "president",
      title: "President",
      description:
        "Serves as the leader and representative of the Computer Science Society. They guide the organization's vision, oversee all operations, and ensure that every project and initiative aligns with the org's goals. The President also represents CSS in college and university-wide councils, making sure the voices of members are heard at every level.",
      ebName: "Genna Cervantes",
    },
    {
      id: "internal-vice-president",
      title: "Internal Vice President",
      description:
        "Manages the internal structure and daily operations of CSS. They coordinate with committees, monitor staff performance, and provide support to ensure smooth execution of events and projects. Acting as the President's right hand, the Internal VP ensures that the organization runs efficiently from the inside.",
      ebName: "Mar Vincent De Guzman",
    },
    {
      id: "external-vice-president",
      title: "External Vice President",
      description:
        "Handles the org's outreach and partnerships. They build and maintain relationships with external organizations, other student groups, and industry partners. Their role strengthens CSS's network beyond the society itself, creating opportunities for collaboration, exposure, and growth.",
      ebName: "Christian Bhernan Buenagua",
    },
    {
      id: "secretary",
      title: "Secretary",
      description:
        "Serves as the custodian of records and communication. They document meetings, handle correspondences, and maintain the official files of the organization. With attention to detail and organization, the Secretary ensures that the society's operations are well-documented and transparent.",
      ebName: "Joevanni Paulo Gumban",
    },
    {
      id: "assistant-secretary",
      title: "Assistant Secretary",
      description:
        "Helps and supports the Secretary with paperwork, logistics, and record-keeping. They often manage attendance records, assist in preparing documents, and ensure that no detail is overlooked in the org's administrative work.",
      ebName: "Marian Therese Pineza",
    },
    {
      id: "treasurer",
      title: "Treasurer",
      description:
        "In charge of the society's financial health. They manage funds, prepare budgets, collect dues, and make financial reports. By ensuring transparency and accountability, the Treasurer helps sustain CSS activities while maximizing resources for its members.",
      ebName: "Braven Rei Goodwin",
    },
    {
      id: "auditor",
      title: "Auditor",
      description:
        "Acts as the org's financial watchdog. They review reports, check transactions, and ensure that all financial activities are ethical and accurate. Their role keeps the organization's operations transparent and trustworthy.",
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
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "Alexandra Antonette Palanog",
    },
    {
      id: "representative-3rd-year",
      title: "3rd Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "Nikolas Josef Dalisay",
    },
    {
      id: "representative-2nd-year",
      title: "2nd Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
      ebName: "Chrisry Clerry Hermoso",
    },
    {
      id: "representative-1st-year",
      title: "1st Year Level Representative",
      description:
        "Acts as the bridge between their batchmates and the org. They gather feedback, address concerns, and ensure that every student's voice is heard. Through active engagement, they represent their year level's interests while strengthening unity across all batches.",
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
        "Oversees the creative and multimedia output of CSS. From posters to videos, they ensure that the society's visuals are engaging, professional, and aligned with its branding.",
      ebName: "Charmaine Chesca Villalobos",
    },
    {
      id: "director-community-development",
      title: "Director for Community Development",
      description:
        "Leads the org's outreach and social responsibility initiatives. They plan and execute projects that extend beyond academics, nurturing compassion, empathy, and service within the CSS community.",
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

  const selectedEB = executiveBoardRoles.find((role) => role.id === ebRole);

  if (!selectedEB) {
    return (
      <section className="min-h-screen bg-[rgb(243,243,253)]">
        <div className="flex flex-col justify-center items-center px-50 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-inter font-bold text-black mb-4">
              Executive Board role not found
            </h1>
            <button
              onClick={() => router.push("/user/apply/executive-assistant")}
              className="bg-[#044FAF] text-white px-6 py-3 rounded-md font-inter font-normal text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
            >
              Back to Role Selection
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[rgb(243,243,253)]">
      <header className="flex p-3 items-center justify-between shadow-md shadow-black/40 bg-white">
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

      <div className="flex flex-col items-center py-20 gap-6">
        {/* CSAR Excited Image */}
        <div>
          <Image
            src="/assets/pictures/CSAR_Excited.png"
            alt="CSAR Excited"
            width={200}
            height={200}
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h1 className="text-5xl font-raleway font-bold text-black mb-4 flex flex-col items-center">
            Thank you for applying as
            <span className="text-[#134687] mt-2">
              Executive Assistant to the {selectedEB.title}
            </span>
          </h1>
          <p className="text-md font-inter text-gray-700">
            Your application to the Computer Science Society has been
            successfully submitted. <br />
            We’re excited to have you take this step toward becoming part of our
            mission to inspire, innovate, and lead.
          </p>
        </div>
        <p className="text-md font-bold font-inter text-black">
          You are now FOR INTERVIEW
        </p>
        <div className="bg-white border-1 rounded-2xl border-[#BFBFBF] px-4 py-12 max-w-xl w-full mx-auto">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-10 h-10">
                <span className="text-white text-xs font-bold font-inter">
                  1
                </span>
              </div>
              <div className="w-28 h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10">
                <span className="text-[#696767] text-xs font-bold font-inter">
                  2
                </span>
              </div>
              <div className="w-28 h-[3px] bg-[#D9D9D9]" />
              <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-10 h-10">
                <span className="text-[#696767] text-xs font-bold font-inter">
                  3
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 w-118 mt-3 gap-x-0 place-items-center font-inter font-medium">
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                For Interview
              </span>
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Evaluation / Under Review
              </span>
              <span className="text-[11px] leading-none whitespace-nowrap text-center">
                Application Results
              </span>
            </div>
            {scheduledTime && (
              <p className="text-xs font-inter mt-6 text-gray-600">
                Interview scheduled for:{" "}
                <span className="font-semibold">{scheduledTime}</span>
              </p>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-white border-1 rounded-2xl border-[#BFBFBF] px-14 py-10 max-w-4xl w-full">
          <h3 className="text-md font-inter font-semibold text-black text-center">
            Reminders before the Interview:
          </h3>
          <hr className="my-3 border-t border-black" />
          <ul className="space-y-2 text-sm font-inter text-black">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              You will receive a confirmation email with your interview details
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Please arrive 10 minutes before your scheduled interview time
            </li>

            <li className="flex items-start">
              <span className="mr-2">•</span>
              Results will be announced on
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/user")}
            className="bg-[#044FAF] text-white px-8 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
          >
            Return to Dashboard
          </button>
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
          <div className="font-inter text-4xl font-semibold">
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
        <div className="flex flex-col mt-10 font-inter">
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
