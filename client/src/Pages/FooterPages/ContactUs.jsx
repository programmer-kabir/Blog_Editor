import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { LuMail, LuMapPin, LuPhone, LuSend, LuSparkles } from "react-icons/lu";

const ContactUs = () => {
  const form = useRef();
  const [isSending, setIsSending] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);

    emailjs
      .sendForm("service_5ky4w18", "template_yhopkxj", form.current, {
        publicKey: "jN1OoaI7XqGtsW1L1",
      })
      .then(
        () => {
          setIsSending(false);
          toast.success("Message delivered successfully! We'll be in touch soon.");
          form.current.reset();
        },
        (error) => {
          setIsSending(false);
          toast.error("Failed to send message. Please try again or reach out by email.");
          console.error("EmailJS Error:", error?.text);
        }
      );
  };

  return (
    <div className="min-h-screen bg-slate-50/40 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold">
            <LuSparkles className="text-xs" />
            <span>We'd Love to Hear From You</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Have questions about writing on Blog Editor, partnering with us, or reporting an issue? Drop us a note!
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          
          {/* Left Info Panel */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Contact Information</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-4 pt-4 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand">
                    <LuMapPin className="text-lg" />
                  </div>
                  <span>Sylhet, Bangladesh</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand">
                    <LuMail className="text-lg" />
                  </div>
                  <span>support@blogeditor.io</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand">
                    <LuPhone className="text-lg" />
                  </div>
                  <span>+880 1700-000000</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-xs text-slate-400">
              <p>Operating Hours:</p>
              <p className="text-white font-medium mt-0.5">Sunday - Thursday, 9:00 AM - 6:00 PM BST</p>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-8 sm:p-10">
            <form ref={form} onSubmit={sendEmail} className="space-y-5">
              <div>
                <label
                  htmlFor="from_name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="from_name"
                  name="from_name"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="from_email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="from_email"
                  name="from_email"
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="How can we help you today?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-800"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LuSend className="text-base" />
                <span>{isSending ? "Sending message..." : "Send Message"}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactUs;
