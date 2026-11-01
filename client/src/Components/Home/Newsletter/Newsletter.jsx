import React, { useState } from "react";
import { LuMail, LuCheckCircle2, LuSparkles } from "react-icons/lu";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubmitted(true);
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-elevated border border-slate-800">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Copy */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-semibold">
            <LuSparkles className="text-xs" />
            <span>Weekly Editorial Newsletter</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Stay Ahead with Insights Delivered Directly to Your Inbox
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Join thousands of curious developers, creators, and leaders receiving our weekly digest of curated essays, tutorials, and community highlights.
          </p>

          {/* Trust Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <LuCheckCircle2 className="text-emerald-400 text-sm" /> No spam, guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <LuCheckCircle2 className="text-emerald-400 text-sm" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <LuCheckCircle2 className="text-emerald-400 text-sm" /> 1-click unsubscribe
            </span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-5">
          <div className="bg-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl">
            {isSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="font-bold text-lg text-white">You're Subscribed!</h3>
                <p className="text-xs text-slate-300">
                  Check your inbox for our latest edition. Welcome to the community!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="newsletter-email" className="block text-xs font-medium text-slate-300">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-brand hover:bg-brand-dark shadow-md hover:shadow-brand transition-all duration-200"
                >
                  Subscribe for Free
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  By subscribing you agree to our Terms and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
