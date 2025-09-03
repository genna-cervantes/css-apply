"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
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

  return (
    <div className="">
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

          {showButton && (
            <div>
              <button className="bg-[#0077FF] font-family-inter text-white py-2 px-16 font-medium text-xl shadow-[inset_0_4px_15px_rgba(255,255,255,0.8)] absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 animate-fade-in">
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
                <button className="bg-[#0077FF] font-family-inter text-white py-2 px-8 md:py-3 md:px-12 font-medium text-sm md:text-lg shadow-[inset_0_4px_15px_rgba(255,255,255,0.8)] animate-fade-in rounded-sm">
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
            <p className="text-2xl md:text-3xl lg:text-6xl font-bold ">
              when <span className="text-[#3F74B8]">passion</span> <br /> meets{" "}
              <span className="text-[#134687]">technology?</span>
            </p>
            <div className=" text-sm md:text-xl lg:text-2xl text-justify mt-5">
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

      {/* Mobile View */}
      <section className="md:hidden">
        <div className="-space-y-16">
          <div
            className="relative w-full h-60 bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic1.png')",
            }}
          >
            <div className="p-5 ml-4 mb-7 text-left text-white border-l-4 border-white">
              <p className="font-inter text-md italic">
                CSS 2025 is going to be bigger, bolder, and innovative than ever
              </p>

              <p className="font-raleway font-bold text-3xl mt-2">
                What to Expect <br /> This Year
              </p>
            </div>
          </div>

          <div
            className="relative w-full h-60 bg-cover bg-center flex items-center"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic2.png')",
            }}
          >
            <div className="p-3 ml-4 mb-7 text-left text-white flex mt-24">
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
            className="relative w-full h-60 bg-cover bg-center flex items-center"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic3.png')",
            }}
          >
            <div className="p-3 ml-4 mb-7 text-left text-white flex mt-24">
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
            className="relative w-full h-56 bg-cover bg-center flex items-center"
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic4.png')",
            }}
          >
            <div className="p-3 mb-2 text-left text-white flex mt-24">
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
    </div>
  );
}
