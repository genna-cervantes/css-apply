"use client"; 
// REF: di kailangan na use client ung buong file

import Footer from "@/components/Footer";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // REF: di need ng useEffect for this, kaya toh css animations lng and tailwind
  const [showFirstLine, setShowFirstLine] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showThirdLine, setShowThirdLine] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowFirstLine(true);

    const timer1 = setTimeout(() => {
      setShowSecondLine(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setShowThirdLine(true);
    }, 4000);

    const timer3 = setTimeout(() => {
      setShowButton(true);
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const scrollToNextSection = () => {
    const nextSection = document.getElementById("about-css-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Google Auth
  const handleEnterClick = async () => {
    if (session) {
      router.push("/user");
    } else {
      try {
        await signIn("google", { callbackUrl: "/user" });
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    }
  };

  return (
    <div className="h-full w-full">
      <section className="min-h-screen w-full bg-gradient-to-b from-[#000000] via-[rgb(1,124,238)] via-69% to-[#0054FF] relative overflow-hidden">
        <header className="flex justify-center sm:justify-start p-9 md:p-6 relative z-30">
          <Image
            src="/assets/logos/cssapply_logo.png"
            alt=""
            width={110}
            height={190}
            className="w-16 h-auto md:w-[110px]"
          />
        </header>

        <div className="flex flex-col mt-9 md:mt-5 justify-center items-center font-inter relative z-10 px-4">
          <h3 className="text-[#285C9F] text-sm md:text-lg font-medium text-center">
            YOUR JOURNEY IN TECH STARTS HERE
          </h3>
          <h1 className="text-6xl md:text-6xl lg:text-9xl font-extrabold bg-gradient-to-b from-[#003A78] to-[#003C7F] bg-clip-text text-transparent text-center">
            READY TO <br className="md:hidden" /> JOIN CSS?
          </h1>
        </div>

        {/* Desktop layout - hidden on mobile */}
        <div className="hidden lg:flex flex-col space-y-5 mt-9 relative">
          <div className="flex justify-between">
            <Image
              src="/assets/pictures/landing_pic1.png"
              alt=""
              width={300}
              height={400}
            />
            <Image
              src="/assets/pictures/landing_pic2.png"
              alt=""
              width={300}
              height={400}
            />
          </div>
          <div className="flex justify-between">
            <Image
              src="/assets/pictures/landing_pic3.png"
              alt=""
              width={400}
              height={500}
            />
            <Image
              src="/assets/pictures/landing_pic4.png"
              alt=""
              width={400}
              height={500}
            />
          </div>

          <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 scale-155">
            <Image
              src="/assets/pictures/laptop.png"
              alt=""
              width={2500}
              height={2500}
              className="w-[90vw] h-auto"
            />
          </div>

          <div className="absolute left-[45%] transform -translate-x-1/2 -translate-y-1/2 z-30 scale-90">
            <div className="flex flex-col text-[#285C9F] h-16">
              <code
                className={`${
                  showFirstLine ? "animate-fade-in opacity-100" : "opacity-0"
                }`}
              >
                &#62; Booting System...
              </code>
              <code
                className={`${
                  showSecondLine ? "animate-fade-in opacity-100" : "opacity-0"
                }`}
              >
                &#62; Connecting to Computer Science Society
              </code>
              <code
                className={`${
                  showThirdLine ? "animate-fade-in opacity-100" : "opacity-0"
                }`}
              >
                &#62; Access Granted
              </code>
            </div>
          </div>

          {/* REF: eto ilagay nalang sa client component */}
          {/* REF: lagyan ng loading state */}
          {showButton && (
            <div>
              <button
                onClick={handleEnterClick}
                className="bg-[#0077FF] font-family-inter text-white py-2 px-16 font-medium text-xl shadow-[inset_0_4px_15px_rgba(255,255,255,0.8)] absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 animate-fade-in hover:bg-[#0056CC] transition-colors duration-200 cursor-pointer"
              >
                ENTER
              </button>
            </div>
          )}
        </div>

        {/* Mobile/Tablet layout di p done */}
        <div className="lg:hidden flex flex-col items-center mt-16 relative px-4">
          <div className="relative w-full max-w-md md:max-w-lg">
            <Image
              src="/assets/pictures/laptop.png"
              alt=""
              width={1000}
              height={1000}
              className="w-full h-auto scale-170"
            />

            <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="flex flex-col text-[#285C9F] text-xs md:text-sm space-y-1">
                <code
                  className={`${
                    showFirstLine ? "animate-fade-in opacity-100" : "opacity-0"
                  }`}
                >
                  &#62; Booting System...
                </code>
                <code
                  className={`${
                    showSecondLine ? "animate-fade-in opacity-100" : "opacity-0"
                  }`}
                >
                  &#62; Connecting to CSS
                </code>
                <code
                  className={`${
                    showThirdLine ? "animate-fade-in opacity-100" : "opacity-0"
                  }`}
                >
                  &#62; Access Granted
                </code>
              </div>
            </div>

            {/* Mobile button */}
            {showButton && (
              <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
                <button
                  onClick={handleEnterClick}
                  className="bg-[#0077FF] font-family-inter text-white py-2 px-8 md:py-3 md:px-12 font-medium text-sm md:text-lg shadow-[inset_0_4px_15px_rgba(255,255,255,0.8)] animate-fade-in rounded-sm hover:bg-[#0056CC] transition-colors duration-200 cursor-pointer"
                >
                  ENTER
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center animate-bounce">
          <button
            onClick={scrollToNextSection}
            className="group flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300"
          >
            <Image
              src="/assets/logos/arrow-down.png"
              alt=""
              width={15}
              height={15}
            />
            <span className="font-inter text-white text-sm md:text-base font-bold group-hover:opacity-100 transition-opacity duration-300">
              Get to know more about CSS
            </span>
          </button>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-30 md:h-50 bg-gradient-to-t from-[#000000] via-[#006CF8] via-52% to-transparent z-10 pointer-events-none opacity-60"></div>
      </section>

      {/* REF: bakit tayo may inline styles? stick to one */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <section id="about-css-section" className="p-10 w-full">
        <div className="space-y-5 lg:space-y-0 lg:flex lg:justify-around">
          <div className="font-raleway lg:w-1/2 flex flex-col justify-center">
            <p className="text-md md:text-xl">WHAT HAPPENS</p>
            <p className="text-3xl md:text-4xl lg:text-6xl font-bold ">
              when <span className="text-[#3F74B8]">passion</span> <br /> meets{" "}
              <span className="text-[#134687]">technology?</span>
            </p>
            <div className=" text-sm md:text-lg lg:text-lg text-justify mt-5">
              The{" "}
              <span className="font-bold"> Computer Science Society (CSS)</span>{" "}
              is where curious minds, creative thinkers, and future tech leaders
              come together.{" "}
              <span className="font-bold">
                We are here to help you grow, collaborate, and make an impact
              </span>{" "}
              — inside and outside the classroom.
              <br />
              <br />
              <span className="font-bold">
                Through seminars, workshops, and flagship events,
              </span>{" "}
              we are here to expand your knowledge, embrace technology, and
              create meaningful impact.
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-center items-center">
            <Image
              src="/assets/pictures/sec2_pic.png"
              alt=""
              width={450}
              height={450}
            />
          </div>
        </div>
      </section>

      <section className="h-44">
        <div className="flex justify-center">
          <p className="font-inter font-bold text-lg md:text-2xl xl:text-3xl">
            {" "}
            🎉Enjoy Exclusive Perks🎉
          </p>
        </div>

        <div className="flex justify-center mt-5">
          <div className="w-[90%] flex justify-center items-center overflow-x-auto gap-4 md:gap-6 lg:gap-8 pb-3">
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
            <div className="bg-gray-400 h-20 w-20 rounded-full flex-shrink-0"></div>
          </div>
        </div>
      </section>

      {/* REF: bakit separate tong mobile and desktop view? hindi ba kaya ng tailwind breakpoints? */}
      {/* Mobile View */}
      <section className="lg:hidden">
        <div className="">
          <div
            className="relative w-full h-60 bg-cover bg-center flex items-center"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic1.png')",
            }}
          >
            <div className="p-5 ml-4 sm:ml-10 sm:w-[60%] md:w-[40%] md:ml-10 text-left text-white border-l-4 border-white">
              <p className="font-inter text-md italic">
                CSS 2025 is going to be bigger, bolder, and innovative than ever
              </p>

              <p className="font-raleway font-bold text-3xl mt-2">
                What to Expect <br /> This Year
              </p>
            </div>
          </div>

          <div
            className="relative w-full h-60 bg-cover bg-center flex items-end"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic2.png')",
            }}
          >
            <div className="p-5 text-left text-white flex flex-row h-1/2 sm:w-[60%] md:w-1/2 sm:ml-4 md:ml-6">
              <p className="font-inter font-extralight text-7xl">01</p>

              <div className="font-inter ml-3">
                <p className="font-semibold">UNLOCKED OPPORTUNITIES</p>
                <p className="font-extralight text-sm mt-2">
                  Events, workshops, and partnerships to power up your skills
                  and connections.
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative w-full h-60 bg-cover bg-center flex items-end"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic3.png')",
            }}
          >
            <div className="p-5 text-left text-white flex flex-row h-1/2 sm:w-[60%] md:w-[50%] sm:ml-4 md:ml-6">
              <p className="font-inter font-extralight text-7xl">02</p>

              <div className="font-inter ml-3">
                <p className="font-semibold">STRONGER TOGETHER</p>
                <p className="font-extralight text-sm mt-2">
                  A community where collabs turn into friendships that last.
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative w-full h-60 bg-cover bg-center flex items-end"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic4.png')",
            }}
          >
            <div className="p-5 text-left text-white flex flex-row h-1/2 sm:w-[60%] md:w-[50%] sm:ml-4 md:ml-6">
              <p className="font-inter font-extralight text-7xl">03</p>

              <div className="font-inter ml-3">
                <p className="font-semibold">LEARN FROM THE EXPERTS</p>
                <p className="font-extralight text-sm mt-2">
                  Exclusive talks and mentorships to guide your CS journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop View */}
      <section className="hidden lg:block bg-black">
        <div className="sm:flex sm:flex-row h-[700px] w-screen">
          <div
            className="w-[28%] h-full bg-cover bg-center flex items-center pl-10"
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic1.png')",
            }}
          >
            <div className="flex flex-col justify-end text-left text-white border-l-4 border-white h-[80%] w-[70%] pl-3 ">
              <p className="font-inter text-md italic">
                CSS 2025 is going to be bigger, bolder, and innovative than ever
              </p>

              <p className="font-raleway font-semibold text-3xl mt-2">
                What to Expect This Year
              </p>
            </div>
          </div>

          <div
            className="relative w-[28%] h-full bg-cover bg-center flex flex-col justify-end"
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic2.png')",
            }}
          >
            <div className="font-inter text-left text-white w-[80%] mb-14 ml-5">
              <p className="text-9xl font-extralight">01</p>
              <p className="font-semibold text-lg mt-2">NEW PATHS AWAIT YOU</p>
              <p className="font-extralight text-md mt-2">
                Events and workshops to power up your skills and connections.
              </p>
            </div>
          </div>

          <div
            className="relative w-[28%] h-full bg-cover bg-center flex flex-col justify-end"
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic3.png')",
            }}
          >
            <div className="font-inter text-left text-white w-[80%] mb-14 ml-5 ">
              <p className="text-9xl font-extralight">02</p>
              <p className="font-semibold text-lg mt-2">UNITED WE RISE</p>
              <p className="font-extralight text-md mt-2">
                A community where collaboration turn into friendships that last.
              </p>
            </div>
          </div>

          <div
            className="relative w-[28%] h-full bg-cover bg-center flex flex-col justify-end"
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic4.png')",
            }}
          >
            <div className="font-inter text-left text-white w-[80%] mb-14 ml-5">
              <p className="text-9xl font-extralight">03</p>
              <p className="font-semibold text-lg mt-2">LEARN FROM EXPERTS</p>
              <p className="font-extralight text-md mt-2">
                Exclusive talks and mentorships to guide your CS journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="min-h-screen md:min-h-[60vh] w-full flex flex-col lg:flex-row justify-center items-stretch gap-8 lg:gap-0">
          {/* Why Join Us Section */}
          <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8">
            <div className="text-[#1457AC] flex flex-col justify-center items-center border-b-2 border-[#1457AC] p-4 md:p-6 gap-2 w-full max-w-md">
              <p className="text-2xl md:text-3xl font-semibold text-center font-raleway">
                Why join us?
              </p>
              <p className="italic text-sm md:text-base text-center font-inter">
                Discover Why You Belong Here
              </p>
            </div>

            <div className="flex flex-col justify-center items-center text-white mt-6 gap-3 w-full max-w-md font-inter">
              <div className="bg-[#1457AC] w-full px-6 md:px-7 py-4 rounded-xl text-sm md:text-base leading-relaxed">
                Be part of exciting projects and events that shape the CSS
                community.
              </div>

              <div className="bg-[#1457AC] w-full px-6 md:px-7 py-4 rounded-xl text-sm md:text-base leading-relaxed">
                Connect with like-minded individuals and build lasting
                professional relationships.
              </div>

              <div className="bg-[#1457AC] w-full px-6 md:px-7 py-4 rounded-xl text-sm md:text-base leading-relaxed">
                Develop leadership skills and gain valuable experience in your
                field.
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex justify-center items-center">
            <div className="h-px w-[80%] lg:h-[60%] lg:w-px bg-[#AEAEAE]"></div>
          </div>

          {/* Our Committees Section */}
          <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8">
            <div className="text-[#1457AC] flex flex-col justify-center items-center border-b-2 border-[#1457AC] p-4 md:p-6 gap-2 w-full max-w-md">
              <p className="text-2xl md:text-3xl font-semibold text-center font-raleway">
                Our Committees
              </p>
              <p className="italic text-sm md:text-base text-center font-inter">
                Discover where you fit in
              </p>
            </div>

            <div className="flex w-full max-w-md flex-col justify-center items-center text-white mt-6 gap-3 font-inter">
              <div className="bg-[#1457AC] w-full rounded-lg flex justify-center items-center py-3 gap-2 text-sm md:text-base">
                <Icon icon="ri:book-fill" className="text-lg" /> Academics
              </div>

              <div className="bg-[#1457AC] w-full rounded-lg flex justify-center items-center py-3 gap-2 text-sm md:text-base">
                <Icon icon="ri:community-fill" className="text-lg" /> Community
                Development
              </div>

              <div className="bg-[#1457AC] w-full rounded-lg flex justify-center items-center py-3 gap-2 text-sm md:text-base">
                <Icon icon="mdi:partnership" className="text-lg" /> External
                Affairs
              </div>

              <div className="bg-[#1457AC] w-full rounded-lg flex justify-center items-center py-3 gap-2 text-sm md:text-base">
                <Icon icon="mdi:art" className="text-lg" />
                Creatives and Technicals
              </div>

              <div className="bg-[#1457AC] w-full rounded-lg flex justify-center items-center py-3 gap-2 text-sm md:text-base">
                <Icon
                  icon="material-symbols:money-bag-rounded"
                  className="text-lg"
                />
                Finance
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#2F7EE3] to-[#0E2A4D] py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="flex-shrink-0 order-2 lg:order-1">
              <Image
                src="/assets/logos/csar.png"
                alt="CSAR Logo"
                width={250}
                height={250}
                className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-contain"
              />
            </div>

            {/* Content - Right side on lg screens, bottom on smaller screens */}
            <div className="flex flex-col items-center lg:items-start space-y-4 text-center lg:text-left order-1 lg:order-2 flex-1 font-raleway mt-7 lg:mt-0">
              {/* Header badge */}
              <div className="text-[#1C4D8C] text-sm sm:text-base lg:text-2xl bg-white py-2 px-4 sm:py-3 sm:px-6 rounded-3xl font-bold">
                Not Sure Which Committee You Belong To?
              </div>

              {/* Main heading */}
              <div className="text-xl font-bold text-white max-w-2xl lg:ml-5">
                Find Your Perfect Committee in Just a Few Clicks!
              </div>

              {/* Description */}
              <div className="text-white text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed lg:ml-5">
                Take our quick and fun test to discover which committee matches
                your skills, passions, and goals.
              </div>

              {/* CTA Button */}
              {/* REF: san toh nakaconnect? */}
              <button className="text-[#1C4D8C] bg-white text-sm sm:text-base lg:text-lg rounded-2xl px-6 py-1 sm:px-8 sm:py-2 hover:bg-gray-100 transition-colors duration-200 font-semibold lg:ml-5">
                <div className="flex items-center justify-center gap-2">
                  <p className="font-inter">Take the Test</p>
                  <Icon
                    icon="flowbite:arrow-right-outline"
                    className="text-xl sm:text-2xl"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#00459C] lg:bg-white p-9">
        <div className="flex flex-col justify-center items-center lg:bg-[#00459C] lg:p-32 lg:rounded-3xl">
          <div className="text-2xl lg:text-5xl text-shadow-md text-white font-raleway">
            Build the future. Start with us.
          </div>
          <div className="text-center text-sm lg:text-lg text-extralight text-shadow-sm text-white mt-2 font-inter">
            Join the Computer Science Society and turn your passion into impact.
          </div>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-7 mt-7 font-inter">
            {/* REF: toh rin */}
            <button className="bg-white lg:w-72 px-7 py-2 lg:py-4 rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-200">
              Apply as Member
            </button>

            <button className="bg-white lg:w-72 px-7 py-2 lg:py-4 rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-200">
              Apply as Staff
            </button>

            <button className="bg-white lg:w-72 px-7 py-2 lg:py-4 rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-200">
              Apply as Executive Assistant
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
