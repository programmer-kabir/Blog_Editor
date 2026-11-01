import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getBlogSlugUrl } from "../../Utils/slugify";
import {
  LuBookOpen,
  LuArrowLeft,
  LuArrowRight,
  LuChevronDown,
  LuChevronUp,
  LuCheckCircle2,
  LuSparkles,
  LuLayers,
  LuListOrdered,
} from "react-icons/lu";

const SeriesNavigator = ({ currentBlog, position = "bottom" }) => {
  const [seriesData, setSeriesData] = useState(null);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const seriesName = currentBlog?.series?.name;
  const currentPart = currentBlog?.series?.part || 1;

  useEffect(() => {
    if (seriesName) {
      setIsLoading(true);
      axios
        .get(`${import.meta.env.VITE_API_URL}/series/${encodeURIComponent(seriesName)}`)
        .then((res) => {
          setSeriesData(res.data);
        })
        .catch((err) => {
          console.error("Failed to load series details:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [seriesName]);

  if (!seriesName || !seriesData) return null;

  const blogs = seriesData.blogs || [];
  const totalParts = seriesData.totalParts || blogs.length;

  const currentIdx = blogs.findIndex(
    (b) => b._id === currentBlog._id || b.part === currentPart
  );

  const prevBlog = currentIdx > 0 ? blogs[currentIdx - 1] : null;
  const nextBlog =
    currentIdx >= 0 && currentIdx < blogs.length - 1 ? blogs[currentIdx + 1] : null;

  // Render Top Banner
  if (position === "top") {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand/10 to-indigo-500/10 border border-brand/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <LuBookOpen />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand-light px-2 py-0.5 rounded-full">
                  Series Article
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Part {currentPart} of {totalParts}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                {seriesName}
              </h4>
            </div>
          </div>

          <button
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand/40 text-xs font-bold text-slate-700 hover:text-brand shadow-xs transition-all self-start sm:self-auto"
          >
            <LuListOrdered className="text-sm text-brand" />
            <span>{isIndexOpen ? "Hide Series Index" : "All Chapters"}</span>
            {isIndexOpen ? (
              <LuChevronUp className="text-xs" />
            ) : (
              <LuChevronDown className="text-xs" />
            )}
          </button>
        </div>

        {/* Collapsible Index Card */}
        {isIndexOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200/60 animate-in fade-in duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Complete Series Index:
            </p>
            <div className="space-y-2">
              {blogs.map((b) => {
                const isCurrent = b._id === currentBlog._id || b.part === currentPart;
                return (
                  <Link
                    key={b._id}
                    to={getBlogSlugUrl(b._id, b.title)}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                      isCurrent
                        ? "bg-brand text-white font-bold shadow-sm"
                        : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/70 hover:border-brand/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {b.part}
                      </span>
                      <span className="text-xs truncate">{b.title}</span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold shrink-0 ${
                        isCurrent ? "text-white/90" : "text-slate-400"
                      }`}
                    >
                      {isCurrent ? "Currently Reading" : "Read →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Bottom Chapter Navigation Bar
  return (
    <div className="my-10 space-y-4">
      {/* Series Full Index Card (Embedded) */}
      <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-xl shadow-xs">
              📚
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                Featured Series & Collection
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {seriesName}
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-xs">
            {totalParts} {totalParts === 1 ? "Chapter" : "Chapters"}
          </span>
        </div>

        {/* Chapters List */}
        <div className="mt-4 space-y-2">
          {blogs.map((b) => {
            const isCurrent = b._id === currentBlog._id || b.part === currentPart;
            return (
              <Link
                key={b._id}
                to={getBlogSlugUrl(b._id, b.title)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                  isCurrent
                    ? "bg-white border-2 border-brand shadow-sm"
                    : "bg-white border border-slate-200/70 hover:border-brand/40 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isCurrent
                        ? "bg-brand text-white shadow-xs"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {b.part}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className={`text-xs truncate ${
                        isCurrent
                          ? "font-extrabold text-brand"
                          : "font-semibold text-slate-800"
                      }`}
                    >
                      {b.title}
                    </h4>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-light text-brand">
                      <LuCheckCircle2 className="text-xs" />
                      <span>Reading Now</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-brand">
                      Part {b.part} →
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Prev / Next Chapter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Chapter */}
        {prevBlog ? (
          <Link
            to={getBlogSlugUrl(prevBlog._id, prevBlog.title)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand/40 shadow-xs hover:shadow-card transition-all flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-light text-slate-600 group-hover:text-brand flex items-center justify-center text-lg transition-colors shrink-0">
              <LuArrowLeft />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand transition-colors block">
                ← Previous Chapter ({prevBlog.part})
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                {prevBlog.title}
              </h4>
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 text-slate-400 flex items-center gap-3 opacity-60 cursor-not-allowed">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-lg shrink-0">
              <LuArrowLeft />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Previous Chapter
              </span>
              <p className="text-xs font-medium">This is the first chapter</p>
            </div>
          </div>
        )}

        {/* Next Chapter */}
        {nextBlog ? (
          <Link
            to={getBlogSlugUrl(nextBlog._id, nextBlog.title)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand/40 shadow-xs hover:shadow-card transition-all flex items-center justify-between gap-3 group text-right"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand transition-colors block">
                Next Chapter ({nextBlog.part}) →
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                {nextBlog.title}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center text-lg shadow-sm transition-transform group-hover:translate-x-1 shrink-0">
              <LuArrowRight />
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 text-slate-400 flex items-center justify-between gap-3 opacity-60 cursor-not-allowed text-right">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Next Chapter
              </span>
              <p className="text-xs font-medium">You reached the latest chapter!</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-lg shrink-0">
              <LuCheckCircle2 />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesNavigator;
