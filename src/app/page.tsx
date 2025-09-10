"use client";
// REF: di kailangan na use client ung buong file

import Footer from "@/components/Footer";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import heroStyles from "@/styles/Hero.module.css";
import {
  getScrollAnimationClasses,
  getScrollAnimationStyles,
  getStaggeredAnimationStyles,
} from "@/utils/animations";

export default function Home() {
  // Scroll animation hook
  const { refs, visibility } = useScrollAnimation();
  const { aboutRef, perksRef, expectRefMobile, expectRefDesktop, joinRef } =
    refs;
  const { isAboutVisible, isPerksVisible, isExpectVisible, isJoinVisible } =
    visibility;

  // GSAP refs for hero elements
  const heroSubRef = useRef<HTMLHeadingElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroCtaRef = useRef<HTMLButtonElement | null>(null);

  // Removed GSAP: using pure CSS animations below

  // Hover will handle color reveal via CSS utilities

  // Auth button state and handler (migrated from old LoginButton)
  const searchParams = useSearchParams();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/user";

  const handleEnterClick = async () => {
    setIsLoggingIn(true);
    try {
      await signIn("google", { callbackUrl, redirect: true });
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsLoggingIn(false);
    }
  };

  const committeeRoles = [
    { id: "academics", title: "Academics Committee", icon: "ri:book-fill" },
    {
      id: "community",
      title: "Community Development Committee",
      icon: "ri:community-fill",
    },
    {
      id: "creatives",
      title: "Creatives & Technical Committee",
      icon: "mdi:art",
    },
    {
      id: "documentation",
      title: "Documentation Committee",
      icon: "mdi:camera",
    },
    {
      id: "external",
      title: "External Affairs Committee",
      icon: "mdi:handshake",
    },
    {
      id: "finance",
      title: "Finance Committee",
      icon: "material-symbols:money-bag-rounded",
    },
    { id: "logistics", title: "Logistics Committee", icon: "mdi:truck" },
    { id: "publicity", title: "Publicity Committee", icon: "mdi:bullhorn" },
    { id: "sports", title: "Sports & Talent Committee", icon: "mdi:trophy" },
    {
      id: "technology",
      title: "Technology Development Committee",
      icon: "mdi:laptop",
    },
  ];

  const partnerLogos = [
    {
      src: "/assets/partners/BiteSlice.jpg",
      alt: "BiteSlice",
      size: "h-20 w-20",
    },
    {
      src: "/assets/partners/HomeRoom.jpg",
      alt: "HomeRoom",
      size: "h-20 w-20",
    },
    {
      src: "/assets/partners/MindZone.jpg",
      alt: "MindZone",
      size: "h-20 w-20",
    },
    {
      src: "/assets/partners/NomuCafe.png",
      alt: "NomuCafe",
      size: "h-20 w-20",
    },
    { src: "/assets/partners/Sumu.jpg", alt: "Sumu", size: "h-20 w-20" },
    {
      src: "/assets/partners/TheCatalyst.jpg",
      alt: "TheCatalyst",
      size: "h-28 w-28",
    },
    {
      src: "/assets/partners/Yorokobi.jpg",
      alt: "Yorokobi",
      size: "h-20 w-20",
    },
    {
      src: "/assets/partners/ZeroCafe.png",
      alt: "ZeroCafe",
      size: "h-20 w-20",
      shape: "rounded-lg",
    },
  ];

  const scrollToNextSection = () => {
    const nextSection = document.getElementById("about-css-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="h-full w-full overflow-x-hidden">
      <section className="min-h-screen w-full bg-gradient-to-b from-[#000000] via-[rgb(1,124,238)] via-69% to-[#0054FF] relative overflow-hidden">
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/90 via-black/50 to-transparent flex justify-center sm:justify-start p-6 z-30">
          <div className="inline-flex items-center justify-center transition-transform duration-200 hover:scale-105 hover:opacity-90 active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded cursor-pointer">
            <div className="w-16 h-12 md:w-28 md:h-20  flex items-center justify-center">
              <img
                src="/assets/logos/Logo_CSS Apply.svg"
                alt="CSS Apply Logo"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
          </div>
        </header>

        {/* Middle Layer with Three Rows */}
        <div className="absolute inset-0 z-20 grid grid-rows-[1fr_auto_1fr] isolate">
          {/* Row 1: Top Images */}
          <div className="w-full relative overflow-hidden z-10">
            <div className="absolute top-0 left-0 w-[200%] h-full flex animate-[slideRight_30s_linear_infinite]">
              <div className="flex w-full h-full">
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage1.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage2.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage3.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage4.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage5.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage6.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex w-full h-full">
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage7.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage8.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage9.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage10.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage11.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/6 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage12.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Text Content */}
          <div className="w-full flex flex-col items-center z-50 relative py-6 min-h-[240px]">
            <div className="relative z-30 flex flex-col items-center text-center font-inter">
              <h3
                ref={heroSubRef}
                className="animate-fadeUp text-blue-200 text-sm md:text-base font-light tracking-wide uppercase leading-tight drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
              >
                Your journey in tech starts here
              </h3>
              <h1
                ref={heroTitleRef}
                className="animate-fadeUpDelay relative z-30 text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-b from-white from-20% to-[#0768c3] to-70% bg-clip-text text-transparent tracking-tight leading-tight drop-shadow-[0_0_18px_rgba(59,130,246,0.75)]"
              >
                READY TO JOIN CSS?
              </h1>

              {/* Enter Button */}
              <button
                ref={heroCtaRef}
                onClick={handleEnterClick}
                disabled={isLoggingIn}
                className={`animate-fadeUpDelay2 ${heroStyles.enterButton} relative z-[60] bg-[#0077FF] font-family-inter text-white py-2 px-16 font-medium text-xl opacity-100 hover:bg-[#0056CC] transition-all duration-300 hover:scale-105 animate-[glowPulseBtn_2.4s_ease-in-out_infinite]`}
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  "ENTER"
                )}
              </button>
            </div>
          </div>

          {/* Row 3: Bottom Images */}
          <div className="w-full relative overflow-hidden z-10">
            <div className="absolute bottom-0 left-0 w-[200%] h-full flex animate-[slideLeft_40s_linear_infinite]">
              <div className="flex w-full h-full">
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage13.png"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage14.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage15.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage16.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage17.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex w-full h-full">
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage18.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage19.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage20.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage21.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
                <div className="w-1/5 h-full flex items-center justify-center">
                  <img
                    src="/assets/pictures/landingpage/landingpage22.jpg"
                    alt="Landing page image"
                    className="hero-img cursor-pointer transition duration-300 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 hover:saturate-100 hover:scale-[1.03] shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center animate-bounce">
          <button
            onClick={scrollToNextSection}
            className="group flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300"
          >
            <Icon icon="mdi:chevron-down" className="text-2xl text-white" />
            <span className="font-light text-white text-xs md:text-sm group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Get to know more about CSS
            </span>
          </button>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-40 md:h-50 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 pointer-events-none"></div>
      </section>

      <section
        ref={aboutRef}
        id="about-css-section"
        className="py-20 px-10 w-full overflow-hidden"
      >
        <div className="space-y-5 lg:space-y-0 lg:flex lg:justify-around">
          {/* Text content with slide-in animation */}
          <div
            className={getScrollAnimationClasses(
              isAboutVisible,
              "left",
              "font-raleway lg:w-1/2 flex flex-col justify-center"
            )}
            style={getScrollAnimationStyles(isAboutVisible, "left")}
          >
            <p
              className={getScrollAnimationClasses(
                isAboutVisible,
                "up",
                "text-lg md:text-xl"
              )}
              style={getScrollAnimationStyles(isAboutVisible, "up", "0.2s")}
            >
              WHAT HAPPENS
            </p>
            <p
              className={getScrollAnimationClasses(
                isAboutVisible,
                "up",
                "text-4xl md:text-5xl lg:text-6xl font-bold"
              )}
              style={getScrollAnimationStyles(isAboutVisible, "up", "0.4s")}
            >
              when <span className="text-[#3F74B8]">passion</span> <br /> meets{" "}
              <span className="text-[#134687]">technology?</span>
            </p>
            <div
              className={getScrollAnimationClasses(
                isAboutVisible,
                "up",
                "text-sm md:text-[18px] lg:text-lg text-justify mt-5"
              )}
              style={getScrollAnimationStyles(isAboutVisible, "up", "0.6s")}
            >
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

          {/* Image with slide-in animation */}
          <div
            className={getScrollAnimationClasses(
              isAboutVisible,
              "right",
              "flex-shrink-0 flex justify-center items-center"
            )}
            style={{
              ...getScrollAnimationStyles(isAboutVisible, "right", "0.3s"),
              transform: isAboutVisible
                ? "translateX(0) scale(1)"
                : "translateX(48px) scale(0.95)",
            }}
          >
            <Image
              src="/assets/pictures/sec2_pic.png"
              alt=""
              width={450}
              height={450}
              className="transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </section>

      <section
        ref={perksRef}
        id="perks-section"
        className="h-50 overflow-hidden"
      >
        {/* Title with scroll-triggered animation */}
        <div
          className={getScrollAnimationClasses(
            isPerksVisible,
            "up",
            "flex justify-center"
          )}
          style={getScrollAnimationStyles(isPerksVisible, "up")}
        >
          <p className="font-inter font-bold text-lg md:text-2xl xl:text-3xl">
            🎉Enjoy Exclusive Perks🎉
          </p>
        </div>

        {/* Partners container with scroll-triggered staggered animations */}
        <div
          className={getScrollAnimationClasses(
            isPerksVisible,
            "up",
            "flex justify-center mt-8"
          )}
          style={getScrollAnimationStyles(isPerksVisible, "up", "0.3s")}
        >
          <div className="w-[90%] flex justify-center items-center overflow-x-auto gap-4 md:gap-6 lg:gap-8 pb-3">
            {partnerLogos.map((partner, index) => (
              <div
                key={partner.alt}
                className={`${partner.size} ${
                  partner.shape || "rounded-full"
                } flex-shrink-0 overflow-hidden bg-white hover:animate-pulse hover:scale-110 transition-all duration-500 cursor-pointer ${
                  isPerksVisible
                    ? "opacity-100 transform scale-100 translate-y-0"
                    : "opacity-0 transform scale-75 translate-y-8"
                } ${
                  partner.shape === "rounded-lg"
                    ? "p-2 flex items-center justify-center"
                    : ""
                }`}
                style={getStaggeredAnimationStyles(isPerksVisible, index, 0.5)}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={partner.size.includes("h-28") ? 100 : 80}
                  height={partner.size.includes("h-28") ? 100 : 80}
                  className={`w-full h-full ${
                    partner.shape === "rounded-lg"
                      ? "object-contain"
                      : "object-cover"
                  } hover:scale-110 transition-transform duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile View */}
      <section
        ref={expectRefMobile}
        id="expect-section"
        className="lg:hidden overflow-hidden"
      >
        <div className="">
          {/* Header Card */}
          <div
            className={`relative w-full h-60 bg-cover bg-center flex items-center transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-8"
            }`}
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

          {/* Card 01 */}
          <div
            className={`relative w-full h-60 bg-cover bg-center flex items-end transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-8"
            }`}
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic2.png')",
              transitionDelay: "0.2s",
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

          {/* Card 02 */}
          <div
            className={`relative w-full h-60 bg-cover bg-center flex items-end transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-8"
            }`}
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic3.png')",
              transitionDelay: "0.4s",
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

          {/* Card 03 */}
          <div
            className={`relative w-full h-60 bg-cover bg-center flex items-end transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-8"
            }`}
            style={{
              backgroundImage: "url('/assets/pictures/s4_mobile_pic4.png')",
              transitionDelay: "0.6s",
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
      <section
        ref={expectRefDesktop}
        id="expect-section-desktop"
        className="hidden lg:block bg-black overflow-hidden mt-5"
      >
        <div className="sm:flex sm:flex-row h-[700px] w-full">
          {/* Header Card */}
          <div
            className={`w-[28%] h-full bg-cover bg-center flex items-center pl-10 transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-x-0"
                : "opacity-0 transform -translate-x-12"
            }`}
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

          {/* Card 01 */}
          <div
            className={`relative w-[28%] h-full bg-cover bg-center flex flex-col justify-end transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-12"
            }`}
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic2.png')",
              transitionDelay: "0.2s",
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

          {/* Card 02 */}
          <div
            className={`relative w-[28%] h-full bg-cover bg-center flex flex-col justify-end transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-12"
            }`}
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic3.png')",
              transitionDelay: "0.4s",
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

          {/* Card 03 */}
          <div
            className={`relative w-[28%] h-full bg-cover bg-center flex flex-col justify-end transition-all duration-800 ease-out ${
              isExpectVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-12"
            }`}
            style={{
              backgroundImage: "url('/assets/pictures/s4_desktop_pic4.png')",
              transitionDelay: "0.6s",
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

      <section
        ref={joinRef}
        id="join-section"
        className="py-8 md:py-12 overflow-hidden"
      >
        <div className="min-h-screen md:min-h-[60vh] w-full flex flex-col lg:flex-row justify-center items-stretch gap-8 lg:gap-0">
          {/* Why Join Us Section */}
          <div
            className={getScrollAnimationClasses(
              isJoinVisible,
              "left",
              "flex-1 flex flex-col justify-center items-center px-4 md:px-8"
            )}
            style={getScrollAnimationStyles(isJoinVisible, "left")}
          >
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
          <div
            className={getScrollAnimationClasses(
              isJoinVisible,
              "right",
              "flex-1 flex flex-col justify-center items-center px-4 md:px-8"
            )}
            style={getScrollAnimationStyles(isJoinVisible, "right")}
          >
            <div className="text-[#1457AC] flex flex-col justify-center items-center border-b-2 border-[#1457AC] p-4 md:p-6 gap-2 w-full max-w-md">
              <p className="text-2xl md:text-3xl font-semibold text-center font-raleway">
                Our Committees
              </p>
              <p className="italic text-sm md:text-base text-center font-inter">
                Discover where you fit in
              </p>
            </div>

            {/* Scrollable committee list using original blue card design */}
            <div className="w-full max-w-md mt-6 font-inter">
              <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                {committeeRoles.map((role) => (
                  <div
                    key={role.id}
                    className="bg-[#1457AC] w-full rounded-lg flex justify-center items-center py-3 gap-2 text-white text-sm md:text-base"
                  >
                    <Icon icon={role.icon} className="text-lg" /> {role.title}
                  </div>
                ))}
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
                width={300}
                height={300}
                className="w-56 h-56 sm:w-56 sm:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain"
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
              <Link
                href="/personality-test"
                className="text-[#1C4D8C] bg-white text-sm sm:text-base lg:text-lg rounded-2xl px-6 py-1 sm:px-8 sm:py-2 font-semibold lg:ml-5 shadow-[0_12px_36px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-200 inline-block"
              >
                <div className="flex items-center justify-center gap-2">
                  <p className="font-inter">Take the Test</p>
                  <Icon
                    icon="flowbite:arrow-right-outline"
                    className="text-xl sm:text-2xl"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white lg:bg-white px-5 py-9">
        <div
          className="relative overflow-hidden flex flex-col justify-center items-center rounded-xl bg-center bg-cover"
          style={{ backgroundImage: "url('/assets/pictures/csspromo.gif')" }}
        >
          <div className="absolute inset-0 bg-[#00459C]/60"></div>
          <div className="relative py-30 px-10 z-10 flex flex-col justify-center items-center">
            <div className="text-3xl md:text-4xl lg:text-5xl text-white font-raleway drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)] text-center">
              Build the future. Start with us.
            </div>
            <div className="text-center text-xs lg:text-lg text-extralight text-white mt-2 font-inter drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]">
              Join the Computer Science Society and turn your passion into
              impact.
            </div>
            <div className="flex flex-col text-xs md:text-sm lg:text-md lg:flex-row gap-4 lg:gap-7 mt-7 font-inter">
              {/* REF: toh rin */}
              <button className="bg-white lg:w-72 px-7 py-2 lg:py-4 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-200">
                Apply as Member
              </button>

              <button className="bg-white lg:w-72 px-7 py-2 lg:py-4 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-200">
                Apply as Staff
              </button>

              <button className="bg-white lg:w-72 px-7 py-2 lg:py-4 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-200">
                Apply as Executive Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
