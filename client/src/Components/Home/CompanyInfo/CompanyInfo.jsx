import React, { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { LuUsers, LuBookOpen, LuGlobe, LuArrowRight } from "react-icons/lu";

const stats = [
  {
    icon: LuUsers,
    count: 25,
    suffix: "+",
    label: "Expert Authors",
    desc: "Passionate contributors sharing domain knowledge.",
  },
  {
    icon: LuGlobe,
    count: 50,
    suffix: "K+",
    label: "Monthly Readers",
    desc: "Global developers & learners accessing our stories.",
  },
  {
    icon: LuBookOpen,
    count: 1200,
    suffix: "+",
    label: "Published Articles",
    desc: "Curated guides, tutorials, and deep-dive essays.",
  },
];

const CompanyInfo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 border-t border-slate-150">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Call to Action to Write */}
        <div className="lg:col-span-5 space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold">
            Our Growing Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Readers, <br className="hidden sm:inline" />
            Empowered by Writers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Blog Editor brings together thoughtful creators and curious readers. Join our creator network, share your expertise, and build an audience with a worldwide reach.
          </p>

          <div className="pt-2">
            <Link
              to="/dashboard/blogger/add-blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Join as a Writer</span>
              <LuArrowRight />
            </Link>
          </div>
        </div>

        {/* Right Column: Live Counters */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-brand/30 transition-all duration-300 text-center flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="text-2xl" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isVisible ? (
                    <CountUp start={0} end={stat.count} duration={2.5} suffix={stat.suffix} />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CompanyInfo;
