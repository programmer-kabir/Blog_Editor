import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import useAuth from "../../../Components/Hooks/useAuth";
import logo from "../../../assets/Logo/logo1.png";
import {
  LuUser,
  LuMail,
  LuLock,
  LuPhone,
  LuImage,
  LuEye,
  LuEyeOff,
  LuArrowRight,
  LuSparkles,
  LuCheckCircle2,
  LuPenSquare,
} from "react-icons/lu";

const Signup = () => {
  const { RegisterUser, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const imgbbApiKey =
      import.meta.env.VITE_IMGBB_API_KEY || "f1e08dc7c44c396aa409d50dfcc797da";
    const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;

    try {
      let photoUrl = "";

      // 1. Upload photo if provided
      if (data.image && data.image[0]) {
        const formData = new FormData();
        formData.append("image", data.image[0]);

        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        photoUrl = uploadJson?.data?.display_url || "";
      }

      // 2. Register user in Firebase Auth
      const result = await RegisterUser(data.email, data.password);
      if (!result?.user) throw new Error("Registration failed in Firebase");

      // 3. Update Firebase profile
      await updateUserProfile(data.name, photoUrl || null);

      // 4. Save user metadata into MongoDB via backend API
      const finalUserData = {
        name: data.name,
        email: data.email,
        number: data.number || "",
        role: activeTab,
        photo: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=F50400&color=fff`,
        date: today,
      };

      const backendRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        finalUserData
      );

      if (backendRes.status === 200 || backendRes.data?.insertedId) {
        toast.success("Account created successfully! Welcome to Blog Editor.");
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      let errMsg = "Failed to create account. Please try again.";
      if (error?.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered. Please sign in instead.";
      } else if (error?.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters long.";
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-slate-200/80 shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Panel */}
        <div className="lg:col-span-5 bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />

          {/* Brand Header */}
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
                <span>Join the Community</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Create Your Account & Start Sharing Ideas
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Whether you're here to read curated essays or publish your own stories to a global audience, your journey starts here.
              </p>
            </div>
          </div>

          {/* Account Benefits */}
          <div className="relative z-10 space-y-3.5 pt-8 pb-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <LuCheckCircle2 className="text-brand text-base flex-shrink-0" />
              <span>Full access to all articles and interactive discussions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheckCircle2 className="text-brand text-base flex-shrink-0" />
              <span>Blogger Studio access with rich WYSIWYG editor</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheckCircle2 className="text-brand text-base flex-shrink-0" />
              <span>Real-time claps, bookmarks, and engagement analytics</span>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>By registering, you agree to our Terms of Service & Privacy Policy.</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* Header */}
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/signin" className="text-brand font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="mb-6 p-1.5 rounded-2xl bg-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("user")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "user"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LuUser className="text-sm text-brand" />
              <span>Register as Reader</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("blogger")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "blogger"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LuPenSquare className="text-sm text-brand" />
              <span>Register as Blogger</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    id="name"
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Alex Rivera"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none transition-colors ${
                      errors.name
                        ? "border-red-400 focus:ring-1 focus:ring-red-400"
                        : "border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="number" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Contact Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <LuPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    id="number"
                    type="text"
                    {...register("number")}
                    placeholder="+880 1700-000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                  />
                </div>
              </div>
            </div>

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
                  placeholder="alex@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-400 focus:ring-1 focus:ring-red-400"
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
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="relative">
                <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none transition-colors ${
                    errors.password
                      ? "border-red-400 focus:ring-1 focus:ring-red-400"
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

            {/* Avatar Photo Field with Live Preview */}
            <div className="space-y-1.5">
              <label htmlFor="image" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Profile Avatar Photo
              </label>
              <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-brand/30 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-light text-brand flex items-center justify-center text-xl flex-shrink-0">
                    <LuImage />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    {...register("image", {
                      required: "Profile avatar image is required",
                    })}
                    onChange={(e) => {
                      register("image").onChange(e);
                      handleImageChange(e);
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-light file:text-brand hover:file:bg-brand/20 file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                </div>
              </div>
              {errors.image && (
                <p className="text-xs text-red-600 font-medium">{errors.image.message}</p>
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
                  <span>Creating Account & Uploading Photo...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration ({activeTab === "blogger" ? "Blogger" : "Reader"})</span>
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

export default Signup;
