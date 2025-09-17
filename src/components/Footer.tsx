import React from "react";
import Image from "next/image";

function Footer() {
  return (
    <footer className="w-full py-8 px-5 md:px-20 bg-[#044FAF] text-white flex flex-col md:flex-row gap-8 md:gap-24 items-start border-b-10 border-[#287FEB]">
      <div className="flex flex-col gap-1">
        <Image
          src="https://odjmlznlgvuslhceobtz.supabase.co/storage/v1/object/public/css-apply-static-images/assets/logos/Logo_CSS.svg"
          alt="A descriptive alt text for your image"
          width={60}
          height={60}
        />
        <div className="font-inter text-2xl sm:text-3xl md:text-4xl font-semibold ">
          Computer Science Society
        </div>
        <div className="font-inter text-xs sm:text-sm font-thin italic mb-2">
          The mother organization of the Computer Science Department
        </div>
        <div className="font-inter text-xs sm:text-xs mb-2">
          © {new Date().getFullYear()} Computer Science Society. All rights
          reserved.
        </div>
      </div>

      <div className="flex flex-col mt-6 md:mt-10 font-inter">
        <div className="text-base sm:text-lg font-semibold mb-2">
          Partner with us:
        </div>
        <div className="flex flex-col items-start gap-1">
          <a
            href="mailto:css.cics@ust.edu.ph"
            className="flex items-center gap-2 text-sm font-light hover:underline"
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
            className="flex items-center gap-2 text-sm font-light hover:underline"
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
            <span className="whitespace-nowrap flex items-center h-6">
              UST Computer Science Society
            </span>
          </a>
          <a
            href="https://www.instagram.com/ustcss"
            className="flex items-center gap-2 text-sm font-light hover:underline"
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
  );
}

export default Footer;
