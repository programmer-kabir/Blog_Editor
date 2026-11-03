import React from "react";
import { toast, resolveValue } from "react-hot-toast";

/**
 * Intelligent Toast Message Formatter
 * Produces crisp, luxury Title + Subtitle pairs in natural modern English
 * e.g. "Signed in successfully!" -> Title: "Login Successful! 🎉", Subtitle: "Welcome back to your creator studio."
 */
const formatToastContent = (rawMessage, type) => {
  const isError = type === "error";
  const isLoading = type === "loading";
  const isSuccess = type === "success" || (!isError && !isLoading);

  // If already an object with explicit title/message
  if (typeof rawMessage === "object" && rawMessage !== null && !React.isValidElement(rawMessage)) {
    return {
      title: rawMessage.title || (isSuccess ? "Success! 🎉" : "Notice"),
      subtitle: rawMessage.message || rawMessage.description || "",
      badgeLeft: rawMessage.badgeLeft || "BlogEditor Studio",
      badgeRight: rawMessage.badgeRight || (isSuccess ? "✓ Verified" : isError ? "✕ Failed" : "⏳ Pending"),
    };
  }

  const str = String(rawMessage || "").trim();

  // 1. Sign In / Login / Welcome Back
  if (/welcome\s*back/i.test(str) || /sign(ed)?\s*in|log(ged)?\s*in|login/i.test(str)) {
    if (isError) {
      if (/please\s*sign\s*in|must\s*be\s*logged/i.test(str)) {
        return {
          title: "Sign In Required 🔒",
          subtitle: "Please sign in to continue with this action.",
          badgeLeft: "Authentication",
          badgeRight: "✕ Required",
        };
      }
      return {
        title: "Login Failed ✕",
        subtitle: str || "Invalid email or password. Please try again.",
        badgeLeft: "Security",
        badgeRight: "✕ Error",
      };
    }

    if (/welcome\s*back/i.test(str)) {
      return {
        title: "Welcome Back! 👋",
        subtitle: str,
        badgeLeft: "Creator Auth",
        badgeRight: "✓ Verified",
      };
    }

    return {
      title: "Login Successful! 🎉",
      subtitle: "Welcome back to your creator studio.",
      badgeLeft: "Creator Auth",
      badgeRight: "✓ Verified",
    };
  }

  // 2. Sign Up / Registration
  if (/sign(ed)?\s*up|account\s*created|registered/i.test(str)) {
    if (isError) {
      return {
        title: "Sign Up Failed ✕",
        subtitle: str || "Could not complete registration. Please try again.",
        badgeLeft: "Account",
        badgeRight: "✕ Error",
      };
    }
    return {
      title: "Account Created! 🚀",
      subtitle: "Welcome to the BlogEditor community.",
      badgeLeft: "New Creator",
      badgeRight: "✓ Registered",
    };
  }

  // 3. Logout
  if (/log(ged)?\s*out|sign(ed)?\s*out/i.test(str)) {
    return {
      title: "Signed Out 👋",
      subtitle: "You have been safely signed out.",
      badgeLeft: "Session",
      badgeRight: "✓ Closed",
    };
  }

  // 4. Copied / Clipboard
  if (/cop(y|ied)/i.test(str)) {
    return {
      title: "Link Copied! 📋",
      subtitle: "Article URL copied to your clipboard.",
      badgeLeft: "Clipboard",
      badgeRight: "✓ Copied",
    };
  }

  // 5. Comments & Discussions
  if (/comment|reply|discussion/i.test(str)) {
    if (isError) {
      return {
        title: "Action Failed ✕",
        subtitle: str || "Failed to update discussion.",
        badgeLeft: "Discussion",
        badgeRight: "✕ Error",
      };
    }
    if (/delet|remov/i.test(str)) {
      return {
        title: "Comment Removed 🗑️",
        subtitle: "The comment was removed from discussion.",
        badgeLeft: "Discussion",
        badgeRight: "✓ Removed",
      };
    }
    return {
      title: "Comment Published! 💬",
      subtitle: "Your reply was added to the thread.",
      badgeLeft: "Discussion",
      badgeRight: "✓ Published",
    };
  }

  // 6. Bookmarks & Reading List
  if (/bookmark|reading\s*list/i.test(str)) {
    if (isError) {
      return {
        title: "Bookmark Failed ✕",
        subtitle: str || "Could not update your reading list.",
        badgeLeft: "Library",
        badgeRight: "✕ Error",
      };
    }
    return {
      title: "Reading List Updated 🔖",
      subtitle: "Story saved to your private collection.",
      badgeLeft: "Library",
      badgeRight: "✓ Saved",
    };
  }

  // 7. Likes / Reactions / Claps
  if (/like|clap|applaud|react/i.test(str)) {
    if (isError) {
      return {
        title: "Reaction Failed ✕",
        subtitle: str || "Could not record your reaction.",
        badgeLeft: "Reaction",
        badgeRight: "✕ Error",
      };
    }
    return {
      title: "Reaction Received! ❤️",
      subtitle: "Thanks for supporting this story.",
      badgeLeft: "Engagement",
      badgeRight: "✓ Recorded",
    };
  }

  // 8. Blogs / Drafts / Stories
  if (/\bblog\b|\bdraft\b|\bstory\b|\bpost\b/i.test(str)) {
    if (isError) {
      return {
        title: "Action Failed ✕",
        subtitle: str || "Failed to complete blog action.",
        badgeLeft: "Creator Studio",
        badgeRight: "✕ Error",
      };
    }
    if (/draft/i.test(str)) {
      return {
        title: "Draft Saved 💾",
        subtitle: "Your progress is backed up in the cloud.",
        badgeLeft: "Auto-Save",
        badgeRight: "✓ Synced",
      };
    }
    if (/update|edit|saved/i.test(str)) {
      return {
        title: "Changes Saved! ✨",
        subtitle: "Your blog post was successfully updated.",
        badgeLeft: "Creator Studio",
        badgeRight: "✓ Updated",
      };
    }
    return {
      title: "Blog Published! ✍️",
      subtitle: "Your story has been submitted for review.",
      badgeLeft: "Creator Studio",
      badgeRight: "✓ Submitted",
    };
  }

  // 9. Generic Fallbacks
  if (isError) {
    return {
      title: "Something Went Wrong ✕",
      subtitle: str || "An unexpected error occurred. Please try again.",
      badgeLeft: "System Alert",
      badgeRight: "✕ Error",
    };
  }

  if (isLoading) {
    return {
      title: "Processing Request ⏳",
      subtitle: str || "Please wait a moment...",
      badgeLeft: "System",
      badgeRight: "⏳ In Progress",
    };
  }

  // Short message (<= 4 words) can become the Title directly!
  const words = str.split(/\s+/).filter(Boolean);
  if (words.length > 0 && words.length <= 4) {
    return {
      title: `${str} 🎉`,
      subtitle: "Action completed successfully.",
      badgeLeft: "BlogEditor",
      badgeRight: "✓ Completed",
    };
  }

  return {
    title: "Action Successful! 🎉",
    subtitle: str,
    badgeLeft: "BlogEditor",
    badgeRight: "✓ Completed",
  };
};

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

  const { title, subtitle, badgeLeft, badgeRight } = formatToastContent(resolved, t.type);

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
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
            <h4 className="text-[14.5px] font-bold text-slate-900 tracking-tight leading-snug">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[12.8px] text-slate-600 font-normal leading-relaxed mt-0.5 break-words">
                {subtitle}
              </p>
            )}
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
