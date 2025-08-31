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

  return (
    <div className="">
      <section className="min-h-screen bg-gradient-to-b from-[#000000] via-[rgb(1,124,238)] via-69% to-[#0054FF] relative overflow-hidden">
        <header className="flex justify-start p-4 md:p-6 relative z-30">
          <Image
            src="/assets/logos/cssapply_logo.png"
            alt=""
            width={110}
            height={190}
            className="w-16 h-auto md:w-[110px]"
          />
        </header>

        <div className="flex flex-col mt-2 md:mt-5 justify-center items-center font-family-inter relative z-10 px-4">
          <h3 className="text-[#285C9F] text-sm md:text-lg font-medium text-center">
            YOUR JOURNEY IN TECH STARTS HERE
          </h3>
          <h1 className="text-4xl md:text-6xl lg:text-9xl font-bold bg-gradient-to-b from-[#003A78] to-[#003C7F] bg-clip-text text-transparent text-center leading-tight">
            READY TO JOIN CSS?
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

          <div className="absolute top-[32%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 scale-155">
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
              <button className="bg-[#0077FF] font-family-inter text-white py-2 px-16 font-medium text-xl shadow-[inset_0_4px_15px_rgba(255,255,255,0.8)] absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 animate-fade-in">
                ENTER
              </button>
            </div>
          )}
        </div>

        {/* Mobile/Tablet layout di p done */}
        <div className="lg:hidden flex flex-col items-center mt-8 md:mt-12 relative px-4">
          <div className="relative w-full max-w-md md:max-w-lg">
            <Image
              src="/assets/pictures/laptop.png"
              alt=""
              width={800}
              height={800}
              className="w-full h-auto"
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
              <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
                <button className="bg-[#0077FF] font-family-inter text-white py-2 px-8 md:py-3 md:px-12 font-medium text-sm md:text-lg shadow-[inset_0_4px_15px_rgba(255,255,255,0.8)] animate-fade-in rounded-sm">
                  ENTER
                </button>
              </div>
            )}
          </div>

          {/* trying if mas okay na hidden images sa mobile*/}
          <div className="grid grid-cols-2 gap-2 md:gap-4 mt-8 w-full max-w-md md:max-w-lg">
            <Image
              src="/assets/pictures/landing_pic1.png"
              alt=""
              width={150}
              height={200}
              className="w-full h-auto rounded-lg"
            />
            <Image
              src="/assets/pictures/landing_pic2.png"
              alt=""
              width={150}
              height={200}
              className="w-full h-auto rounded-lg"
            />
            <Image
              src="/assets/pictures/landing_pic3.png"
              alt=""
              width={200}
              height={250}
              className="w-full h-auto rounded-lg"
            />
            <Image
              src="/assets/pictures/landing_pic4.png"
              alt=""
              width={200}
              height={250}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-32 md:h-50 bg-gradient-to-t from-[#000000] via-[#006CF8] via-52% to-transparent z-40 pointer-events-none opacity-60"></div>
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
    </div>
  );
}
