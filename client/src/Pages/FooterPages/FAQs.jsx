import React, { useState } from "react";
import { LuHelpCircle, LuChevronDown, LuSparkles } from "react-icons/lu";

const faqData = [
  {
    question: "How can I become an approved writer on Blog Editor?",
    answer:
      "Simply create an account, navigate to the Dashboard, and request blogger status or start drafting your article. Once your initial submission passes editorial review, you'll be granted full publishing permissions.",
  },
  {
    question: "Is publishing on Blog Editor free of charge?",
    answer:
      "Yes, reading and authoring articles on Blog Editor is 100% free. We believe in providing an accessible global platform for developers, creatives, and thinkers to share knowledge.",
  },
  {
    question: "What formatting tools are available in the editor?",
    answer:
      "Blog Editor is equipped with a professional WYSIWYG rich text editor supporting headings, code blocks, bullet points, image uploads via ImgBB, hyperlinks, and formatted quotes.",
  },
  {
    question: "How does the editorial approval process work?",
    answer:
      "After you submit an article, it enters our administrative queue with a 'pending' badge. Our moderation team reviews the content for quality, relevance, and guideline compliance, usually approving it within 24 hours.",
  },
  {
    question: "Can I edit or delete my published blogs?",
    answer:
      "Yes, you have full control over your submissions. In your Blogger Dashboard under 'My Blogs', you can update existing content or remove articles at any time.",
  },
  {
    question: "How do reader comments and likes work?",
    answer:
      "Registered users can like articles and participate in discussions. As a writer, you can see real-time claps and reader comments directly on your article page.",
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-slate-50/40 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold">
            <LuSparkles className="text-xs" />
            <span>Got Questions?</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Everything you need to know about reading, writing, and engaging on Blog Editor.
          </p>
        </div>

        {/* Accordion Box */}
        <div className="space-y-4">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <LuHelpCircle
                      className={`text-lg transition-colors ${
                        isOpen ? "text-brand" : "text-slate-400"
                      }`}
                    />
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`p-1 rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-brand-light text-brand" : ""
                    }`}
                  >
                    <LuChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FAQs;
