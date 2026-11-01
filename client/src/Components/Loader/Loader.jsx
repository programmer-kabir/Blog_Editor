import React from "react";
import logo from "../../assets/Logo/logo1.png";

const Loader = ({ fullScreen = true, text = "Loading..." }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-[70vh] w-full" : "py-12 w-full"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-brand/20"></div>

        {/* Outer spinning gradient ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-brand border-r-brand"></div>

        {/* Center brand logo icon */}
        <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <img src={logo} alt="Loading..." className="h-5 w-auto object-contain" />
        </div>
      </div>

      {text && (
        <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
