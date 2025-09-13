// components/modals/ConfirmationModal.tsx
"use client";

import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: React.ReactNode;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  isLoading = false,
}: ConfirmationModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-4 sm:p-6 lg:p-10 max-w-xl w-full shadow-2xl border-[#FFBC2B] border-2 sm:border-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* Header section with icon and title */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 flex items-center justify-center h-12 w-12 sm:h-15 sm:w-15 rounded-full bg-[#FFE7B4] flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-8 sm:h-8"
                viewBox="0 0 34 35"
                fill="none"
              >
                <path
                  d="M1.57861 30.0413L16.8044 3.74219L32.0303 30.0413H1.57861ZM16.8044 25.8888C17.1966 25.8888 17.5256 25.756 17.7914 25.4902C18.0571 25.2244 18.1895 24.8959 18.1886 24.5047C18.1877 24.1134 18.0548 23.7849 17.79 23.5192C17.5251 23.2534 17.1966 23.1205 16.8044 23.1205C16.4123 23.1205 16.0838 23.2534 15.8189 23.5192C15.5541 23.7849 15.4212 24.1134 15.4203 24.5047C15.4194 24.8959 15.5522 25.2249 15.8189 25.4916C16.0856 25.7583 16.4141 25.8907 16.8044 25.8888ZM15.4203 21.7364H18.1886V14.8155H15.4203V21.7364Z"
                  fill="#CE9823"
                />
              </svg>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-inter font-bold text-[#CE9823] mb-2">
                Confirm Interview Schedule
              </h3>
              <div className="font-inter text-xs sm:text-sm text-black">
                {message}
              </div>
            </div>
          </div>

          {/* Note section */}
          <div className="bg-[#ECECEC] border-[#C8C5C5] border-1 rounded-lg px-4 sm:px-8 lg:px-14 py-4 sm:py-6 lg:py-9 mb-4 sm:mb-6 text-left">
            <p className="font-inter text-xs sm:text-sm text-[#CE9823] font-bold mb-2">
              Note:
            </p>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm text-black font-inter">
              <li>
                Once confirmed, this schedule will be final and cannot be
                changed.
              </li>
              <li>Failure to attend may affect your application status.</li>
              <li>
                Please ensure you are available and prepared at the scheduled
                time.
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 sm:px-9 py-2 sm:py-2.5 bg-[#E7E3E3] text-black rounded-2xl font-inter font-semibold text-xs sm:text-sm hover:bg-gray-400 transition-colors disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6 sm:px-9 py-2 sm:py-2.5 bg-[#FFBC2B] text-[#5B4515] rounded-full font-inter font-semibold text-xs sm:text-sm hover:bg-[#D9A129] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Confirm</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
