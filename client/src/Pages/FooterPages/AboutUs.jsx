import React from "react";
import { LuSparkles, LuTarget, LuRocket, LuCompass } from "react-icons/lu";

const teamMembers = [
  {
    image: "https://i.ibb.co.com/0B28kqL/Saranya-B.png",
    name: "Saranya Babu",
    role: "Head of Editorial",
  },
  {
    image: "https://i.ibb.co.com/cLjMNQ2/Andrei-M.png",
    name: "Andrei Mierla",
    role: "Lead Platform Architect",
  },
  {
    image: "https://i.ibb.co.com/y8FSQFr/John.png",
    name: "John Foster",
    role: "Community Director",
  },
  {
    image: "https://i.ibb.co.com/Xkhr70s/Roxi-1.png",
    name: "Roxi Laza",
    role: "Head of Product Design",
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-50/40 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold">
            <LuSparkles className="text-xs" />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Empowering Voices, Elevating Stories
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Welcome to Blog Editor — the modern digital storytelling platform connecting thoughtful writers and curious minds around the globe.
          </p>
        </div>

        {/* Section 1: Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-card">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-xl">
              <LuTarget />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Vision
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We envision a world where every thinker, developer, and creative artist has access to frictionless publishing tools. By merging speed, design clarity, and community-driven curation, we ensure that great ideas get the audience they deserve.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src="https://i.ibb.co.com/0YJQhKd/Group-9494.png"
              alt="Our Vision"
              className="max-h-80 w-auto object-contain"
            />
          </div>
        </div>

        {/* Section 2: Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-card">
          <div className="order-2 md:order-1 flex justify-center">
            <img
              src="https://i.ibb.co.com/DgjYD6t/Group-9805.png"
              alt="Our Story"
              className="max-h-80 w-auto object-contain"
            />
          </div>
          <div className="order-1 md:order-2 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <LuCompass />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Story
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              From our beginnings in Sylhet, Bangladesh, we were inspired to create a publishing space without noise or intrusive distractions. Today, thousands of readers explore articles spanning high-speed web tech, DevOps, travel diaries, and mindful living.
            </p>
          </div>
        </div>

        {/* Section 3: Future */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-card">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <LuRocket />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Future
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We continue investing in next-generation editorial toolkits, AI-assisted writing enhancements, and fast cloud rendering so you can write, preview, and publish within seconds.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src="https://i.ibb.co.com/sm4C4vh/Group-9807.png"
              alt="Our Future"
              className="max-h-80 w-auto object-contain"
            />
          </div>
        </div>

        {/* Leadership Team */}
        <div className="text-center space-y-8 pt-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Meet the Leadership Team
            </h2>
            <p className="text-sm text-slate-600">
              Passionate professionals working behind the scenes to deliver exceptional reading and publishing experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((team, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 mb-4 ring-4 ring-slate-100 group-hover:ring-brand/20 transition-all">
                  <img
                    src={team.image}
                    alt={team.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {team.name}
                </h3>
                <p className="text-xs text-brand font-semibold mt-0.5">
                  {team.role}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
