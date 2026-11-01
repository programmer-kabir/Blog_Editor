import React from "react";
import { LuShieldCheck, LuFileText } from "react-icons/lu";

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-50/40 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold">
            <LuFileText className="text-xs" />
            <span>Legal Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: November 2026. Please read these terms carefully before using Blog Editor.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LuShieldCheck className="text-brand text-lg" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Blog Editor, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to all terms stated here, please refrain from accessing or utilizing the platform services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LuShieldCheck className="text-brand text-lg" />
              2. Content Ownership and Intellectual Property
            </h2>
            <p>
              Writers and creators retain full copyright ownership of the original text, imagery, and intellectual contributions they publish. By submitting articles to Blog Editor, authors grant Blog Editor a non-exclusive license to display, index, and distribute the work across our web applications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LuShieldCheck className="text-brand text-lg" />
              3. Community Standards & Acceptable Conduct
            </h2>
            <p>
              We pride ourselves on maintaining a polite, constructive, and hate-free environment. Content promoting discrimination, harassment, piracy, illegal activities, or explicit copyright infringement is strictly forbidden and subject to immediate removal and user banning.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LuShieldCheck className="text-brand text-lg" />
              4. Moderation & Administrative Oversight
            </h2>
            <p>
              All published blogs undergo administrative review before appearing in public feeds. Our editorial team reserves the right to approve, reject, or request revisions on any article to preserve quality standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LuShieldCheck className="text-brand text-lg" />
              5. Contact & Inquiries
            </h2>
            <p>
              If you have any questions regarding these terms, please contact our legal counsel at{" "}
              <span className="text-brand font-semibold">legal@blogeditor.io</span>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Terms;
