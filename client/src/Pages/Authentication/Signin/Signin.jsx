import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuth from "../../../Components/Hooks/useAuth";
import logo from "../../../assets/Logo/logo1.png";
import {
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuArrowRight,
  LuShieldCheck,
  LuSparkles,
  LuPenSquare,
  LuUser,
  LuCheck,
} from "react-icons/lu";

const demoCredentials = [
  {
    role: "Admin",
    email: "admin@gmail.com",
    password: "admin123@#",
    badge: "Full Control",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    icon: LuShieldCheck,
  },
  {
    role: "Blogger",
    email: "blogger@gmail.com",
    password: "blogger 123@#",
    badge: "Creator Studio",
    color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    icon: LuPenSquare,
  },
  {
    role: "Reader",
    email: "user@gmail.com",
    password: "user123@#",
    badge: "Community",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    icon: LuUser,
  },
];

const Signin = () => {
  const { SingInUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleDemoFill = async (cred) => {
    setValue("email", cred.email, { shouldValidate: true });
    setValue("password", cred.password, { shouldValidate: true });
    setActiveDemo(cred.role);
    toast.success(`Loaded ${cred.role} credentials! Logging in...`);

    // Auto-login for instant 1-click test experience
    setIsSubmitting(true);
    try {
      const result = await SingInUser(cred.email, cred.password);
      if (result?.user) {
        toast.success(`Welcome back, ${cred.role}!`);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Demo login error:", error);
      toast.error(error?.message || "Failed to log in with demo account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await SingInUser(data.email, data.password);
      if (result?.user) {
        toast.success("Signed in successfully!");
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      let errMsg = "Invalid email or password";
      if (error?.code === "auth/user-not-found") errMsg = "No user found with this email";
      else if (error?.code === "auth/wrong-password") errMsg = "Incorrect password";
      else if (error?.code === "auth/too-many-requests") errMsg = "Too many attempts. Try again later";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-slate-200/80 shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Editorial Brand Panel */}
        <div className="lg:col-span-5 bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient red glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-white shadow-sm inline-flex">
                <img className="h-7 w-auto object-contain" src={logo} alt="Logo" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Blog<span className="text-brand">Editor</span>
              </span>
            </Link>

            <div className="space-y-3 pt-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-semibold">
                <LuSparkles className="text-xs" />
                <span>Next-Gen Content Platform</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Where Words Create Impact & Stories Live
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Join thousands of creative writers, tech leaders, and curious readers exploring authentic perspectives.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-3 pt-8 pb-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs">
                ✓
              </span>
              <span>Fast WYSIWYG editor with rich media embedding</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs">
                ✓
              </span>
              <span>Real-time community likes, claps, and discussions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs">
                ✓
              </span>
              <span>Curated editorial categories across tech, cloud & lifestyle</span>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>© 2026 Blog Editor. Engineered for creators worldwide.</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* Header */}
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-sm text-slate-500">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-brand font-semibold hover:underline">
                Create one for free
              </Link>
            </p>
          </div>

          {/* 1-Click Fast Demo Login Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <LuSparkles className="text-brand" /> 1-Click Quick Demo Login:
              </span>
              <span className="text-[10px] text-slate-400">Click role to auto-sign in</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoCredentials.map((cred) => {
                const Icon = cred.icon;
                const isSelected = activeDemo === cred.role;
                return (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => handleDemoFill(cred)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      cred.color
                    } ${isSelected ? "ring-2 ring-brand shadow-sm" : ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="text-sm" />
                      <span>{cred.role}</span>
                    </div>
                    {isSelected ? (
                      <LuCheck className="text-xs font-bold text-brand" />
                    ) : (
                      <span className="text-[10px] opacity-70">{cred.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                      : "border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Password is required" })}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                      : "border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LuArrowRight className="text-base" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

export default Signin;
