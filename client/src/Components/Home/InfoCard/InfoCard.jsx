import React from "react";
import { LuCompass, LuSparkles, LuPenTool, LuShieldCheck } from "react-icons/lu";

const cardInfo = [
  {
    icon: LuCompass,
    title: "Diverse Perspectives",
    desc: "Discover rich articles ranging from web engineering and cloud DevOps to travel, lifestyle, and design.",
    color: "text-brand",
    bg: "bg-brand-light",
  },
  {
    icon: LuPenTool,
    title: "Rich Media Editor",
    desc: "Craft beautiful articles effortlessly with our intuitive, distraction-free WYSIWYG publishing suite.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: LuSparkles,
    title: "Vibrant Community",
    desc: "Connect with authors, share thoughts, like your favorite posts, and build your digital audience.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: LuShieldCheck,
    title: "Editorial Quality",
    desc: "Curated and moderated content ensuring every story is authentic, engaging, and worth your valuable time.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const InfoCard = () => {
  return (
    <section className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardInfo.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-brand/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm`}
                >
                  <Icon className="text-2xl" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-400 group-hover:text-brand transition-colors">
                <span>Learn more</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InfoCard;
