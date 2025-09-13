"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <div>
        <Header />
        <section className="min-h-screen bg-[rgb(243,243,253)]">
          <div className="flex flex-col justify-center items-center px-4 sm:px-8 lg:px-50 py-20">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-inter font-bold text-black mb-4">
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(243,243,253)]">
      <Header />

      <section>
        <div className="flex flex-col items-center py-8 sm:py-12 lg:py-20 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
          {/* CSAR Excited Image */}
          <div>
            <Image
              src="/assets/pictures/CSAR_Excited.png"
              alt="CSAR Excited"
              width={150}
              height={150}
              className="object-contain drop-shadow-lg sm:w-[200px] sm:h-[200px]"
            />
          </div>

          {/* Success Message */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-raleway font-bold text-black mb-4 flex flex-col items-center leading-tight">
              Thank you for applying as
              <span className="text-[#134687] mt-2 break-words">
                Executive Assistant to the {selectedEB.title}
              </span>
            </h1>
            <p className="text-sm sm:text-md font-inter text-gray-700 px-2 sm:px-4">
              Your application to the Computer Science Society has been
              successfully submitted. <br className="hidden sm:block" />
              We're excited to have you take this step toward becoming part of
              our mission to inspire, innovate, and lead.
            </p>
          </div>

          <p className="text-sm sm:text-md font-bold font-inter text-black">
            You are now FOR INTERVIEW
          </p>

          {/* Progress Tracker */}
          <div className="bg-white border-1 rounded-2xl border-[#BFBFBF] px-4 py-12 max-w-xl w-full mx-auto">
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex items-center">
                <div className="flex items-center justify-center rounded-full bg-[#2F7EE3] w-7 h-7 lg:w-10 lg:h-10">
                  <span className="text-white text-xs font-bold font-inter">
                    1
                  </span>
                </div>
                <div className="w-20 lg:w-28 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />
                <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-7 h-7 lg:w-10 lg:h-10">
                  <span className="text-[#696767] text-xs font-bold font-inter">
                    2
                  </span>
                </div>
                <div className="w-20 lg:w-28 h-[2px] lg:h-[3px] bg-[#D9D9D9]" />
                <div className="flex items-center justify-center rounded-full bg-[#D9D9D9] w-7 h-7 lg:w-10 lg:h-10">
                  <span className="text-[#696767] text-xs font-bold font-inter">
                    3
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 w-80 lg:w-114 mt-3 gap-x-0 place-items-center font-inter font-medium">
                <span className="text-[11px] leading-none whitespace-nowrap text-center">
                  For Interview
                </span>
                <span className="text-[11px] leading-none whitespace-nowrap text-center">
                  Evaluation
                </span>
                <span className="text-[11px] leading-none whitespace-nowrap text-center">
                  Application Results
                </span>
              </div>
              {scheduledTime && (
                <p className="text-xs font-inter mt-6 text-gray-600">
                  Interview scheduled for: <br className="lg:hidden" />
                  <span className="font-semibold">{scheduledTime}</span>
                </p>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-white border border-[#BFBFBF] rounded-2xl px-6 sm:px-10 lg:px-14 py-6 sm:py-8 lg:py-10 max-w-4xl w-full">
            <h3 className="text-sm sm:text-md font-inter font-semibold text-black text-center">
              Reminders before the Interview:
            </h3>
            <hr className="my-3 border-t border-black" />
            <ul className="space-y-2 text-xs sm:text-sm font-inter text-black">
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0">•</span>
                <span>
                  You will receive a confirmation email with your interview
                  details
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0">•</span>
                <span>
                  Please arrive 10 minutes before your scheduled interview time
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex-shrink-0">•</span>
                <span>Results will be announced on</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={() => router.push("/user")}
              className="bg-[#044FAF] text-white px-6 sm:px-8 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-[#04387B] transition-all duration-150 active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
