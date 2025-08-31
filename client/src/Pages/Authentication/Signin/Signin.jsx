import React, { useState } from "react";
import { FaArrowRight, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import { IoMdArrowDropright, IoMdCopy } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast'
import useAuth from "../../../Components/Hooks/useAuth";
const Signin = () => {
  const {SingInUser} = useAuth()
  const [showPassword, setShowPassword] = useState(false);
  const [isCredentialsModal, setIsCredentialsModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Toggle credentials modal visibility
  const toggleCredentialsModal = () => {
    setIsCredentialsModal((prevState) => !prevState);
  };

  const {
    handleSubmit,
    register,
    formState: { errors: formError },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data.email, data.password);
    SingInUser(data.email, data.password)
    .then(result =>{
      const user = result.user
      toast.success('login successful')
      navigate(from , {replace:true})
    })
  };
 
  const credentials = [
    { role: "Admin", email: "admin@gmail.com", password: "admin123@#" },
    { role: "User", email: "user@gmail.com", password: "user123@#" },
    { role: "Blogger", email: "blogger@gmail.com", password: "blogger 123@#" },
  ];
// Copy Handler
const handleCopy = (text, label) => {
  navigator.clipboard.writeText(text)
  .then(() => toast.success(`${label} copied to clipboard!`))
  .catch((err) => console.error("Failed to copy: ", err));
  console.log(text);
  };
  return (
    <section className="mt-[120px] px-2">
      <div className="max-w-xl  mx-auto w-full space-y-4 rounded-lg border py-7">
        {/* Heading */}
        <div className="border-b w-full flex flex-col items-center space-y-1 text-center pb-4">
          <h2 className="text-2xl font-semibold text-primary capitalize">
            Sign in to your account
          </h2>
          <Link
            to="/signup"
            className="text-primary hover:underline flex items-center gap-2"
          >
            Don't have an account? <FaArrowRight size={14} />
          </Link>
        </div>

        {/* Login Credentials */}
        <div
          onClick={toggleCredentialsModal}
          className="text-primary hover:underline flex items-center gap-1 pt-4 px-7 cursor-pointer"
        >
          Login Credentials
          <IoMdArrowDropright size={24} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 pt-7 space-y-5">
          {/* Email */}
          <div>
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
              <span className="text-[#f50400] text-sm">Email is required</span>
            )}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-white rounded-md bg-[#f50400] hover:bg-[#d80400] px-5 py-2 text-lg transition-all duration-300 ease-in-out"
          >
            Sign in
          </button>
        </form>

        {/* Background Overlay */}
        {isCredentialsModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={toggleCredentialsModal}
          ></div>
        )}

        {/* Credentials Modal */}
        {isCredentialsModal && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[780px] p-6 bg-white rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-semibold mb-3 text-center">
                Login Credentials
              </h2>
              <button onClick={toggleCredentialsModal}>
                <FaPlus className="rotate-45" />
              </button>
            </div>
           
            {credentials.map((credential) => (
         
                <div key={credential.role} className=" space-y-2">
                  <h2 className="text-xl font-medium pt-7">
                    {credential.role} Credentials
                  </h2>

                  {/* Email Section */}
                  <div className="text-base flex items-center justify-between">
                    <p>Email: {credential.email}</p>
                    <button
                      onClick={() => handleCopy(credential?.email, "Email")}
                      className="text-[#1677ff] flex items-center gap-1"
                    >
                      <IoMdCopy size={20} className="rotate-180" /> Copy Email
                    </button>
                  </div>

                  {/* Password Section */}
                  <div className="text-base flex items-center justify-between">
                    <p>Password: {credential.password}</p>
                    <button
                      onClick={() => handleCopy(credential?.password, "Password")}
                      className="text-[#1677ff] flex items-center gap-1"
                    >
                      <IoMdCopy size={20} className="rotate-180" /> Copy
                      Password
                    </button>
                  </div>
               
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Signin;
