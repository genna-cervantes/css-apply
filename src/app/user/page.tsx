import Image from "next/image";

export default function UserDashboard() {
  return (
    <section className="min-h-screen bg-[#F3F3FD]">
      <header className="flex p-5 items-center justify-between shadow-md shadow-black/40 bg-white">
        <Image
          src="assets/logos/Logo_CSS Apply.svg"
          alt="A descriptive alt text for your image"
          width={110}
          height={190}
          className="drop-shadow-md"
        />
        <button className="bg-[#134687] font-inter text-xs text-white px-8 py-2 rounded-sm transition-all duration-150 active:scale-95">
          Log Out
        </button>
      </header>

      <div className="flex flex-col justify-center items-center py-[100px]">
        <div className="flex flex-col justify-center items-center gap-16">
          <div className="flex flex-col gap-5">
            <div className="rounded-[45px] text-white text-4xl font-poppins font-medium px-0 py-4 text-center [background:linear-gradient(90deg,_#2F7EE3_0%,_#0349A2_100%)]">
              Welcome, Mar De Guzman 👋
            </div>
            <div className="text-black text-md font-Inter font-light">
              Manage your applications and explore opportunities with the
              Computer Science Society. Choose how you'd like to be part of CSS
              this year.
            </div>
          </div>
          <div className="flex gap-10">
            <div className="relative flex flex-col w-80 h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                className="pt-5"
              >
                <path
                  d="M27.2708 34.7082C27.2708 32.7548 27.6556 30.8205 28.4031 29.0158C29.1507 27.211 30.2463 25.5712 31.6276 24.19C33.0089 22.8087 34.6487 21.713 36.4534 20.9655C38.2581 20.2179 40.1924 19.8332 42.1458 19.8332C44.0992 19.8332 46.0335 20.2179 47.8382 20.9655C49.643 21.713 51.2828 22.8087 52.6641 24.19C54.0453 25.5712 55.141 27.211 55.8885 29.0158C56.6361 30.8205 57.0208 32.7548 57.0208 34.7082C57.0208 38.6533 55.4537 42.4368 52.6641 45.2264C49.8744 48.016 46.0909 49.5832 42.1458 49.5832C38.2007 49.5832 34.4172 48.016 31.6276 45.2264C28.838 42.4368 27.2708 38.6533 27.2708 34.7082ZM42.1458 9.9165C35.5707 9.9165 29.2648 12.5285 24.6155 17.1778C19.9661 21.8272 17.3542 28.133 17.3542 34.7082C17.3542 41.2833 19.9661 47.5892 24.6155 52.2385C29.2648 56.8879 35.5707 59.4998 42.1458 59.4998C48.721 59.4998 55.0269 56.8879 59.6762 52.2385C64.3255 47.5892 66.9375 41.2833 66.9375 34.7082C66.9375 28.133 64.3255 21.8272 59.6762 17.1778C55.0269 12.5285 48.721 9.9165 42.1458 9.9165ZM76.8542 9.9165H71.8958V19.8332H76.8542C78.8076 19.8332 80.7419 20.2179 82.5466 20.9655C84.3513 21.713 85.9911 22.8087 87.3724 24.19C88.7537 25.5712 89.8493 27.211 90.5969 29.0158C91.3444 30.8205 91.7292 32.7548 91.7292 34.7082C91.7292 36.6616 91.3444 38.5959 90.5969 40.4006C89.8493 42.2053 88.7537 43.8451 87.3724 45.2264C85.9911 46.6077 84.3513 47.7033 82.5466 48.4509C80.7419 49.1984 78.8076 49.5832 76.8542 49.5832H71.8958V59.4998H76.8542C83.4293 59.4998 89.7352 56.8879 94.3845 52.2385C99.0339 47.5892 101.646 41.2833 101.646 34.7082C101.646 28.133 99.0339 21.8272 94.3845 17.1778C89.7352 12.5285 83.4293 9.9165 76.8542 9.9165ZM0 94.2082C0 87.633 2.61197 81.3271 7.26131 76.6778C11.9107 72.0285 18.2165 69.4165 24.7917 69.4165H59.5C66.0752 69.4165 72.381 72.0285 77.0304 76.6778C81.6797 81.3271 84.2917 87.633 84.2917 94.2082V104.125H74.375V94.2082C74.375 90.2631 72.8078 86.4796 70.0182 83.6899C67.2286 80.9003 63.4451 79.3332 59.5 79.3332H24.7917C20.8466 79.3332 17.0631 80.9003 14.2735 83.6899C11.4839 86.4796 9.91667 90.2631 9.91667 94.2082V104.125H0V94.2082ZM119 94.2082C119 90.9525 118.359 87.7287 117.113 84.7208C115.867 81.7129 114.041 78.9799 111.739 76.6778C109.437 74.3757 106.704 72.5495 103.696 71.3036C100.688 70.0578 97.464 69.4165 94.2083 69.4165H89.25V79.3332H94.2083C98.1534 79.3332 101.937 80.9003 104.727 83.6899C107.516 86.4796 109.083 90.2631 109.083 94.2082V104.125H119V94.2082Z"
                  fill="#044FAF"
                />
              </svg>
              <div className="text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                Member
                <div className="text-black text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-5 h-[270px] w-[280px]"></div>
              </div>
              <a
                href="/user/apply/member"
                className="whitespace-nowrap absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-sm text-white px-15 py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
              >
                Apply as Member
              </a>
            </div>
            <div className="relative flex flex-col w-80 h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                className="pt-5"
              >
                <path
                  d="M69.375 9.25H41.625C39.0707 9.25 37 11.3207 37 13.875V23.125C37 25.6793 39.0707 27.75 41.625 27.75H69.375C71.9293 27.75 74 25.6793 74 23.125V13.875C74 11.3207 71.9293 9.25 69.375 9.25Z"
                  stroke="#044FAF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M74 18.5H83.25C85.7033 18.5 88.056 19.4746 89.7907 21.2093C91.5254 22.944 92.5 25.2967 92.5 27.75V92.5C92.5 94.9533 91.5254 97.306 89.7907 99.0407C88.056 100.775 85.7033 101.75 83.25 101.75H57.8125M18.5 62.4375V27.75C18.5 25.2967 19.4746 22.944 21.2093 21.2093C22.944 19.4746 25.2967 18.5 27.75 18.5H37"
                  stroke="#044FAF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M61.8733 72.2705C62.7855 71.3582 63.5092 70.2752 64.0029 69.0833C64.4966 67.8913 64.7507 66.6138 64.7507 65.3237C64.7507 64.0336 64.4966 62.7561 64.0029 61.5641C63.5092 60.3722 62.7855 59.2892 61.8733 58.3769C60.961 57.4647 59.878 56.741 58.6861 56.2473C57.4941 55.7536 56.2166 55.4995 54.9265 55.4995C53.6364 55.4995 52.3589 55.7536 51.167 56.2473C49.975 56.741 48.892 57.4647 47.9798 58.3769L24.8085 81.5575C23.7089 82.6565 22.904 84.0149 22.4683 85.5072L18.5971 98.7809C18.4811 99.1789 18.4741 99.6008 18.577 100.002C18.6799 100.404 18.8888 100.77 19.182 101.064C19.4751 101.357 19.8416 101.566 20.2432 101.669C20.6448 101.771 21.0667 101.765 21.4646 101.648L34.7384 97.7773C36.2307 97.3416 37.5891 96.5367 38.6881 95.4371L61.8733 72.2705Z"
                  stroke="#044FAF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                Committee Staff
                <div className="text-black text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-5 h-[270px] w-[280px]"></div>
              </div>
              <a
                href="/user/apply/committee-staff"
                className="whitespace-nowrap absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-sm text-white px-10 py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
              >
                Apply as Committee Staff
              </a>
            </div>
            <div className="relative flex flex-col w-80 h-[480px] rounded-[28px] border-2 border-[#005FD9] bg-white shadow-[0_8px_13px_0_rgba(0,0,0,0.25)] items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                className="pt-5"
              >
                <path
                  d="M78.5555 100V13.7778C78.5555 10.9193 77.4199 8.17796 75.3987 6.15674C73.3775 4.13551 70.6361 3 67.7777 3H46.2221C43.3637 3 40.6223 4.13551 38.6011 6.15674C36.5799 8.17796 35.4443 10.9193 35.4443 13.7778V100"
                  stroke="#044FAF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M100.111 24.5557H13.8889C7.93646 24.5557 3.11108 29.381 3.11108 35.3334V89.2223C3.11108 95.1747 7.93646 100 13.8889 100H100.111C106.063 100 110.889 95.1747 110.889 89.2223V35.3334C110.889 29.381 106.063 24.5557 100.111 24.5557Z"
                  stroke="#044FAF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="text-lg text-[#134687] flex flex-col font-poppins items-center text-center w-full">
                Executive Assistant
                <div className="text-black text-base font-inter font-light border-2 border-[#D1D1D1] bg-[#ECECEC] rounded-lg mt-5 h-[270px] w-[280px]"></div>
              </div>
              <a
                href="/user/apply/executive-assistant"
                className="whitespace-nowrap absolute bottom-9 left-1/2 -translate-x-1/2 bg-[#044FAF] font-inter text-sm text-white px-7 py-3 rounded-md hover:bg-[#0349A2] transition-all duration-150 active:scale-95"
              >
                Apply as Executive Assistant
              </a>
            </div>
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
