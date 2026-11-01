import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/Logo/logo1.png";
import { FaTwitter, FaGithub, FaLinkedin, FaFacebookF } from "react-icons/fa";
import { LuMapPin, LuMail, LuArrowUp } from "react-icons/lu";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 transition-colors">
      <div className="w-[94%] md:w-[95%] max-w-[1750px] mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Vision (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-white shadow-sm inline-flex">
                <img className="h-7 w-auto object-contain" src={logo} alt="Blog Editor Logo" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Blog<span className="text-brand">Editor</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A high-impact digital publishing platform connecting creative thinkers, developers, and storytellers worldwide.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <LuMapPin className="text-brand text-sm" />
                <span>Sylhet, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <LuMail className="text-brand text-sm" />
                <span>contact@blogeditor.io</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand/40 hover:bg-brand hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200"
                aria-label="Twitter"
              >
                <FaTwitter size={14} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand/40 hover:bg-brand hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand/40 hover:bg-brand hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={14} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand/40 hover:bg-brand hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200"
                aria-label="GitHub"
              >
                <FaGithub size={14} />
              </a>
            </div>
          </div>

          {/* Quick Navigation (Col 6-7) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-white hover:underline transition-colors">
                  Explore Blogs
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-white hover:underline transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-white hover:underline transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories (Col 8-10) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blogs/category/programming" className="hover:text-white hover:underline transition-colors">
                  Programming & Code
                </Link>
              </li>
              <li>
                <Link to="/blogs/category/technology" className="hover:text-white hover:underline transition-colors">
                  Technology Trends
                </Link>
              </li>
              <li>
                <Link to="/blogs/category/devops" className="hover:text-white hover:underline transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link to="/blogs/category/lifestyle" className="hover:text-white hover:underline transition-colors">
                  Lifestyle & Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust (Col 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/trems-conditions" className="hover:text-white hover:underline transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-white hover:underline transition-colors">
                  FAQ & Support
                </Link>
              </li>
              <li>
                <Link to="/dashboard/blogger/add-blog" className="text-brand font-semibold hover:underline transition-colors">
                  Become a Writer &rarr;
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Blog Editor. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span>Built with precision in Sylhet, Bangladesh</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back to top"
              aria-label="Back to top"
            >
              <LuArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
