"use client";

import React from "react";

type WarningModalProps = {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  borderColorClass?: string; // e.g. "border-[#FFBC2B]"
  accentBgClass?: string; // e.g. "bg-[#FFE7B4]"
  accentTextClass?: string; // e.g. "text-[#CE9823]"
  icon?: React.ReactNode; // custom icon component
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function WarningModal({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  isSubmitting = false,
  borderColorClass = "border-[#FFBC2B]",
  accentBgClass = "bg-[#FFE7B4]",
  accentTextClass = "text-[#CE9823]",
  icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onCancel}
    >
      <div
        className={`bg-white rounded-2xl p-10 max-w-xl w-full mx-4 shadow-2xl border-4 ${borderColorClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-6">
            <div
              className={`p-3 mx-auto flex items-center justify-center h-15 w-15 rounded-full ${accentBgClass} mb-4`}
            >
              {icon}
            </div>
            <div className="flex flex-col items-start text-left">
              <h3 className={`text-xl font-inter font-bold ${accentTextClass}`}>
                {title}
              </h3>
              <div className="font-inter text-sm text-black mb-6 text-left">
                {message}
              </div>
            </div>
          </div>

          <div className="bg-[#ECECEC] border-[#C8C5C5] border-1 rounded-lg px-14 py-9 mb-6 text-justify">
            <p
              className={`font-inter text-sm ${accentTextClass} font-bold mb-2`}
            >
              Note:
            </p>
            <div className="font-inter text-sm text-black">
              Please ensure you are available and prepared at the scheduled
              time.
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-9 py-2 bg-[#E7E3E3] text-black rounded-2xl font-inter font-semibold text-sm hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`px-9 py-2 rounded-full font-inter font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 ${accentBgClass} ${
                accentTextClass.replace("text-", "").startsWith("[#")
                  ? "text-[#5B4515]"
                  : accentTextClass
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
