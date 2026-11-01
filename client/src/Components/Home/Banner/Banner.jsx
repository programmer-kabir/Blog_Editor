import React from "react";
import { Link } from "react-router-dom";
import { HiArrowRight, HiSparkles } from "react-icons/hi2";
import { LuPenSquare, LuFlame, LuUsers, LuBookOpen } from "react-icons/lu";

const Banner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-subtle/40 via-slate-50/50 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-150">
      {/* Ambient Decorative Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1500px] h-[400px] bg-gradient-to-tr from-brand/10 to-red-400/5 blur-3xl pointer-events-none rounded-full -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/5 blur-2xl rounded-full pointer-events-none -z-10" />

      <div className="w-[94%] md:w-[95%] max-w-[1750px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Live Pulsing Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand/20 shadow-sm text-xs font-semibold text-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-brand font-bold uppercase tracking-wider text-[11px]">New</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 flex items-center gap-1">
                <LuFlame className="text-brand text-sm" /> The Modern Creative Publishing Hub
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Where Words Create <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-red-600 to-rose-600">
                True Impact
              </span> & Stories Live
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Explore insightful analyses, deep-dive technical tutorials, and creative perspectives written by passionate authors and industry thinkers.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/blogs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-brand hover:bg-brand-dark shadow-md hover:shadow-brand transition-all duration-300 group"
              >
                Explore Articles
                <HiArrowRight className="text-base group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <Link
                to="/dashboard/blogger/add-blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:border-brand/40 transition-all duration-200"
              >
                <LuPenSquare className="text-base text-brand" />
                Start Writing
              </Link>
            </div>

            {/* Quick Metrics Social Proof */}
            <div className="pt-6 border-t border-slate-200/80 flex items-center gap-8 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-light text-brand">
                  <LuBookOpen className="text-sm" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm block leading-none">500+</span>
                  <span>Curated Articles</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <LuUsers className="text-sm" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm block leading-none">12K+</span>
                  <span>Active Readers</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <HiSparkles className="text-sm" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm block leading-none">100%</span>
                  <span>Verified Creators</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Interactive Preview Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Showcase Glass Card */}
            <div className="relative rounded-3xl bg-white p-5 sm:p-6 shadow-elevated border border-slate-200/80 backdrop-blur-md">
              
              {/* Card Header Pill */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-brand-light text-brand text-xs font-bold uppercase tracking-wider">
                    Editor's Pick
                  </span>
                  <span className="text-xs text-slate-400">• 5 min read</span>
                </div>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              </div>

              {/* Card Media Preview */}
              <div className="relative mt-4 h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
                  alt="Modern Development"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand text-white inline-block mb-1">
                    Technology
                  </span>
                  <h3 className="text-base font-bold leading-snug line-clamp-2">
                    Architecting High-Speed Scalable Systems in 2026
                  </h3>
                </div>
              </div>

              {/* Author & Stats Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-rose-500 text-white font-bold text-xs flex items-center justify-center">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 leading-tight">Alex Rivera</p>
                    <p className="text-[11px] text-slate-400">Principal Architect</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                    ❤️ 248 Likes
                  </span>
                </div>
              </div>

            </div>

            {/* Floating Decorative Chip: Top Right */}
            <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-elevated border border-slate-100 text-xs font-semibold text-slate-800 animate-bounce duration-1000">
              <span className="text-base">🚀</span>
              <span>Ultra Fast Web Experience</span>
            </div>

            {/* Floating Decorative Chip: Bottom Left */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-white shadow-elevated border border-slate-800 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-brand"></span>
              <span>Live community discussions</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;
