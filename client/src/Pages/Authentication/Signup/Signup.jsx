import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../Components/Hooks/useAuth";
import toast from "react-hot-toast";
import axios from "axios";
const Signup = () => {
  const { RegisterUser, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("user");
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors: formError },
  } = useForm();
  const url =
    "https://api.imgbb.com/1/upload?key=f1e08dc7c44c396aa409d50dfcc797da";
  const onSubmit = (data) => {
    const today = new Date().toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
    let finalData = {
      ...data,
      date: today,
      role: activeTab,
    };
    delete finalData.image;

    // console.log(formData);

    const image = data.image[0];
    const formData = new FormData();
    formData.append("image", image);
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((image) => {
        const photo = image?.data?.display_url;
        // Add the photo URL to finalData
        finalData = {
          ...finalData,
          photo, // Add the photo URL instead of the image file
        };
        RegisterUser(data.email, data.password)
          .then((result) => {
            const user = result.user;
            updateUserProfile(data.name, photo).then((response) => {
              axios
                .post("https://blogs-editor-server.vercel.app/users", finalData)
                .then((data) => {
                  if (data.data.insertedId) {
                    toast.success("Register Successfully");
                    navigate("/");
                    console.log(data.data);
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            });
          })
          .catch((error) => {
            toast.error("Email Already Exit");
          });
      })
      .catch((error) => {
        toast.error("unfortunately Some Issue");
      });
  };
  return (
    <section className="mt-[80px] w-full md:max-w-xl mx-auto px-2">
      {/* Buttons */}
      <div className="bg-[#F5F5F5] p-1 flex items-center justify-between">
        <button
          onClick={() => setActiveTab("user")}
          className={`px-4 py-2 rounded w-1/2 text-[12px] md:text-sm ${
            activeTab === "user"
              ? "bg-white text-black shadow"
              : "bg-transparent text-[#737373]"
          }`}
        >
          Register as User
        </button>

        {/* Blogger Tab */}
        <button
          onClick={() => setActiveTab("blogger")}
          className={`px-4 py-2 rounded w-1/2 text-[12px] md:text-sm${
            activeTab === "blogger"
              ? "bg-white text-black shadow"
              : "bg-transparent text-[#737373]"
          }`}
        >
          Register as Blogger
        </button>
      </div>
      {/* Tabs Content User */}
      <div className="bg-white mt-5 w-full space-y-4 rounded-md border py-7">
        <div className="border-b-2 w-full flex flex-col items-center space-y-1 text-center pb-4">
          <h2 className="text-2xl font-semibold text-primary capitalize">
            Register as {activeTab == "user" ? "User" : "Blogger"}
          </h2>
          <Link
            to="/signin"
            className="text-primary hover:underline flex items-center gap-2"
          >
            Already have an account?
            <FaArrowRight size={14} />
          </Link>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 pt-7 space-y-5">
          {/* Email And Name */}
          <div className="md:flex items-center  gap-4">
            {/* Name */}
            <div className="md:w-1/2">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: true })}
                placeholder="Enter Your Name"
                className="px-2 py-2 text-sm outline-none border border-gray-300 rounded w-full mt-2"
              />
              {formError.name && (
                <span className="text-[#f50400] text-sm">Name is required</span>
              )}
            </div>
            {/* Email */}
            <div className="md:w-1/2 pt-5 md:pt-0">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email", { required: true })}
                placeholder="Enter Your Email"
                className="px-2 py-2 text-sm outline-none border border-gray-300 rounded w-full mt-2"
              />
              {formError.email && (
                <span className="text-[#f50400] text-sm">
                  Email is required
                </span>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700"
            >
              Password
            </label>
            <div className="px-2 py-2 flex items-center justify-between outline-none text-sm border border-gray-300 rounded">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", { required: true })}
                placeholder="Enter Your Password"
                className="outline-none flex-grow"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-700"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {formError.password && (
              <span className="text-[#f50400] text-sm">
                Password is required
              </span>
            )}
          </div>
          {/* Contact Number And Profile Photo */}
          <div className="md:flex items-center  gap-4">
            {/* Contact Number */}
            <div className="md:w-1/2">
              <label
                htmlFor="number"
                className="block text-xs font-medium text-gray-700"
              >
                Contact Number
              </label>
              <input
                type="text"
                id="number"
                {...register("number")}
                placeholder="Enter Your Number"
                className="px-2 py-2 text-sm outline-none border border-gray-300 rounded w-full mt-2"
              />
            </div>
            {/* Email */}
            <div className="md:w-1/2 pt-5 md:pt-0">
              <label
                htmlFor="photo"
                className="block text-xs font-medium text-gray-700"
              >
                Profile Photo
              </label>
              <input
                type="file"
                id="image"
                {...register("image", { required: true })}
                className="px-2 py-2 text-sm outline-none border border-gray-300 rounded w-full mt-2"
              />
              {formError.image && (
                <span className="text-[#f50400] text-sm">
                  image is required
                </span>
              )}
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-white rounded-md bg-[#f50400] hover:bg-[#d80400] px-5 py-2 text-lg transition-all duration-300 ease-in-out"
          >
            Sign in
          </button>
        </form>
        {/* {activeTab === "user" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Registration</h2>
            <p>Fill in your details to register as a user.</p>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full mt-3 p-2 border rounded"
            />
          </div>
        )} */}
      </div>
    </section>
  );
};

export default Signup;
