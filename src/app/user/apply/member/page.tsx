"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function MemberApplication() {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  // Form state - all fields will be filled by user
  const [formData, setFormData] = useState({
    studentNumber: "",
    firstName: "",
    lastName: "",
    section: ""
  });

  useEffect(() => {
    // Pre-fill with any existing user data if available
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        studentNumber: session.user.studentNumber || "",
        firstName: session.user.name?.split(' ')[0] || "",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
        section: session.user.section || ""
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'studentNumber') {
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10); // Limit to 10 for studentNumber
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isChecked) {
      setError("Please agree to the data privacy terms");
      setLoading(false);
      return;
    }

    // Validate all fields
    if (!formData.studentNumber || formData.studentNumber.length !== 10) {
      setError("Please enter a valid 10-digit student number");
      setLoading(false);
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your first and last name");
      setLoading(false);
      return;
    }

    if (!formData.section) {
      setError("Please enter your section");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/applications/member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentNumber: formData.studentNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          section: formData.section,
          fullName: `${formData.firstName} ${formData.lastName}`.trim()
        }),
      });

      if (response.ok) {
        router.push('/user/member/application/payment');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Application submission failed');
      }
    } catch (error) {
      setError('An error occurred while submitting your application');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/', // Redirect to home page after logout
        redirect: true 
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
          <button 
          onClick={handleLogout}
          className="bg-[#134687] font-inter text-xs text-white px-8 py-2 rounded-sm">
            Log Out
          </button>
        </div>
      </header>
      <div className="flex flex-col justify-center items-center px-50 py-20">
        <form onSubmit={handleSubmit} className="rounded-[24px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.31)] p-28">
          <div className="text-4xl font-raleway font-semibold mb-4">
            <span className="text-black">Apply as </span>
            <span className="text-[#134687]">Member</span>
          </div>
          <div className="text-black text-md font-Inter font-light">
            Be part of the Computer Science Society community. As a member,
            you'll gain access to exclusive workshops, events, and opportunities
            to grow alongside fellow students passionate about tech.
          </div>
          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="flex gap-40">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  Student Number *
                </div>
                <div className="text-black text-sm font-Inter w-[400px]">
                  <input
                    type="text"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="w-full rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. 2019131907"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  First Name *
                </div>
                <div className="text-black text-sm font-Inter w-[400px]">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. Juan"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  Last Name *
                </div>
                <div className="text-black text-sm font-Inter w-[400px]">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. Dela Cruz"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-black text-sm font-Inter font-normal">
                  Section *
                </div>
                <div className="text-black text-sm font-Inter w-[200px]">
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-[#A8A8A8] focus:border-1 focus:border-[#044FAF] focus:outline-none bg-white px-4 py-3 text-base"
                    placeholder="e.g. 1CSA"
                  />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    id="circle-checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    required
                    className="w-6 h-6 appearance-none rounded-full border-2 border-gray-400 transition-all duration-200 focus:outline-none
              hover:border-[#134687]
              checked:bg-blue-500
              shadow-inner cursor-pointer"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <svg
                      className={`w-4 h-4 text-white transition-opacity duration-20 ${
                        isChecked ? "opacity-100" : "opacity-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 26 26"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor="circle-checkbox"
                  className="text-black text-sm font-normal select-none cursor-pointer text-justify"
                >
                  The information you provide will be kept confidential and used
                  only for academic purposes. It will not be shared with third
                  parties and will be handled responsibly and ethically.
                </label>
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <img
                src="/assets/pictures/MemberImage.jpg"
                alt="Member"
                className="w-190 h-110 object-cover shadow-md border border-[#2F7EE3] rounded-lg"
              />
            </div>
          </div>
          <hr className="my-8 border-t-1 border-[#717171]" />
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/user")}
              className="bg-gray-300 text-gray-700 px-15 py-3 rounded-lg font-inter font-semibold text-sm hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !formData.studentNumber || formData.studentNumber.length !== 10 || !formData.firstName || !formData.lastName || !formData.section}
              className="whitespace-nowrap font-inter text-sm font-semibold text-white px-12 py-3 rounded-lg bg-[#134687] hover:bg-[#0d3569] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Pay Now'}
            </button>
          </div>
        </form>
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
