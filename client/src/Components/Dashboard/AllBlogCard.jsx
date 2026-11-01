import React, { useState } from "react";
import { Link } from "react-router-dom";
import { calculateMonthDifference } from "../DateFomate/DateFormate";
import {
  LuClock,
  LuHeart,
  LuEye,
  LuAlertCircle,
  LuCheckCircle2,
  LuX,
  LuMessageSquare,
} from "react-icons/lu";

const AllBlogCard = ({ data, link }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);

  const monthDifference = calculateMonthDifference(data?.date);
  const likeCount =
    typeof data?.like === "object"
      ? data?.like?.count || 0
      : typeof data?.like === "number"
      ? data?.like
      : 0;

  const targetLink = link || `../blogger/blog-details/${data?._id}`;

  const isApproved = data?.status === "approved";
  const isPending = data?.status === "pending";
  const isRejected = data?.status === "reject";

  return (
    <article className="group flex flex-col justify-between rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-brand/30 transition-all duration-300 overflow-hidden relative">
      <div>
        {/* Cover Photo */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={
              data?.photo ||
              "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"
            }
            alt={data?.title || "Story Cover"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Floating Status Pill */}
          <div className="absolute top-3 left-3">
            {isApproved && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                <LuCheckCircle2 className="text-xs" />
                <span>Live & Approved</span>
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Pending Review</span>
              </span>
            )}
            {isRejected && (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
                title="Click to view feedback"
              >
                <LuAlertCircle className="text-xs" />
                <span>Rejected • View Notes</span>
              </button>
            )}
          </div>

          {/* Category Pill */}
          {data?.category && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                {data.category}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <LuClock className="text-xs" />
            <span>
              {monthDifference === 0
                ? "Published this month"
                : `${monthDifference} month${monthDifference > 1 ? "s" : ""} ago`}
            </span>
            <span>•</span>
            <span>{data?.date}</span>
          </div>

          <h3 className="font-bold text-base text-slate-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
            {data?.title}
          </h3>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <LuHeart className="text-brand fill-brand text-xs" />
          <span className="font-semibold">{likeCount} Claps</span>
        </div>

        <div className="flex items-center gap-2">
          {isRejected && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Feedback
            </button>
          )}

          <Link
            to={targetLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <LuEye className="text-xs" />
            <span>Preview</span>
          </Link>
        </div>
      </div>

      {/* Feedback Modal for Rejected Posts */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-elevated p-6 border border-slate-150 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <LuAlertCircle className="text-lg" />
                <h4 className="font-bold text-slate-900 text-base">
                  Editorial Rejection Feedback
                </h4>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500">
                The editorial team reviewed your article and provided the following feedback for revision:
              </p>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-rose-900 text-sm leading-relaxed">
                <div className="flex items-start gap-2">
                  <LuMessageSquare className="text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="font-medium whitespace-pre-wrap">
                    {data?.rejectReason || "No specific comments were left by the reviewer. Please review our community guidelines before re-submitting."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default AllBlogCard;
