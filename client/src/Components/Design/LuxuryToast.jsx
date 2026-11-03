import React, { useEffect, useState } from "react";
import { toast, resolveValue } from "react-hot-toast";

/**
 * Luxury Card Toast Component (White Mood / Light Theme)
 * Inspired by modern fintech / creator apps with rounded badges,
 * crisp typography, status pills, and animated glowing progress line.
 */
const LuxuryToast = ({ t }) => {
  const resolved = resolveValue(t.message, t);
  const duration = t.duration || 3500;
  const isError = t.type === "error";
  const isLoading = t.type === "loading";
  const isSuccess = t.type === "success" || (!isError && !isLoading);

  // Parse title and subtitle
  let title = "";
  let messageText = "";
  let badgeLeft = "BlogEditor Studio";
  let badgeRight = isSuccess ? "✓ সম্পন্ন" : isError ? "✕ সতর্কবার্তা" : "⏳ প্রসেসিং";

  if (typeof resolved === "object" && resolved !== null && !React.isValidElement(resolved)) {
    title = resolved.title || "";
    messageText = resolved.message || resolved.description || "";
    if (resolved.badgeLeft) badgeLeft = resolved.badgeLeft;
    if (resolved.badgeRight) badgeRight = resolved.badgeRight;
  } else if (typeof resolved === "string") {
    // Check if the string has a colon or newline separating title and body
    if (resolved.includes(":\n")) {
      const parts = resolved.split(":\n");
      title = parts[0];
      messageText = parts.slice(1).join(":\n");
    } else if (resolved.includes(": ")) {
      const parts = resolved.split(": ");
      title = parts[0];
      messageText = parts.slice(1).join(": ");
    } else {
      // Default contextual title based on type
      if (isSuccess) title = "অ্যাকশন সফল হয়েছে! 🎉";
      else if (isError) title = "একটি সমস্যা হয়েছে! ⚠️";
      else if (isLoading) title = "প্রসেস হচ্ছে...";
      else title = "নোটিফিকেশন";
      messageText = resolved;
    }
  } else {
    messageText = resolved;
  }

  return (
    <div
      className={`relative w-[360px] sm:w-[410px] bg-white rounded-[18px] border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 font-['Poppins',sans-serif] ${
        t.visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"
      }`}
      style={{
        boxShadow:
          "0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="p-4 pb-3.5">
        {/* Top Header Row */}
        <div className="flex items-start gap-3">
          {/* Left Icon Badge */}
          <div className="shrink-0 mt-0.5">
            {isSuccess && (
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border-[1.5px] border-emerald-300/80 flex items-center justify-center text-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                <svg
                  className="w-5 h-5 stroke-[2.8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {isError && (
              <div className="w-11 h-11 rounded-xl bg-rose-50 border-[1.5px] border-rose-300/80 flex items-center justify-center text-rose-600 shadow-[0_2px_8px_rgba(244,63,94,0.15)]">
                <svg
                  className="w-5 h-5 stroke-[2.8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            {isLoading && (
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border-[1.5px] border-indigo-300/80 flex items-center justify-center text-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.15)]">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Middle Text Area */}
          <div className="flex-1 min-w-0 pr-1">
            {title && (
              <h4 className="text-[14.5px] font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h4>
            )}
            <p className="text-[12.8px] text-slate-600 font-normal leading-relaxed mt-0.5 break-words">
              {messageText}
            </p>
          </div>

          {/* Right Close Button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            aria-label="Close Notification"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0 mt-0.5"
          >
            <svg
              className="w-3.5 h-3.5 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Bottom Status Badges Row (Fintech/Creator Card Look) */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
            {badgeLeft}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold border ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isError
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {badgeRight}
          </span>
        </div>
      </div>

      {/* Animated Glowing Progress Line at Bottom Edge */}
      {!isLoading && (
        <div
          className={`absolute bottom-0 left-0 h-[3.5px] ${
            isSuccess
              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
              : isError
              ? "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
              : "bg-gradient-to-r from-indigo-500 to-blue-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]"
          }`}
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};

export default LuxuryToast;
