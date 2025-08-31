import React, { useState, useRef } from "react";
import JoditEditor from "jodit-react";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa6";
import { PiPaperPlaneRight } from "react-icons/pi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuth from "../../../Components/Hooks/useAuth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AddBlog = () => {
  const { user } = useAuth();
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [file, setFile] = useState(null);
  const editor = useRef(null);
  const [content, setContent] = useState("");

  const categoryItems = [
    { id: 1, label: "programming" },
    { id: 2, label: "technology" },
    { id: 3, label: "devops" },
    { id: 4, label: "travel" },
    { id: 6, label: "education" },
    { id: 7, label: "lifestyle" },
    { id: 8, label: "fitness" },
    { id: 9, label: "fashion" },
  ];

  const handleCategory = () => {
    setIsOpenCategory((prevState) => !prevState);
  };

  const handleSelectItem = (item) => {
    setActiveItem(item); // Set entire category item as activeItem
    setIsOpenCategory(false);
  };

  //   const handleFileChange = (event) => {
  //     const selectedFile = event.target.files[0];
  //     if (selectedFile) {
  //       setFile(URL.createObjectURL(selectedFile));
  //     }
  //   };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  const url =
    "https://api.imgbb.com/1/upload?key=f1e08dc7c44c396aa409d50dfcc797da";
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    const today = new Date().toLocaleDateString("en-CA"); // Format: YYYY-MM-DD

    // Validate category and content
    if (!activeItem) {
      toast.error("Please select your category");
      return;
    }
    if (!content.trim()) {
      toast.error("Please provide content");
      return;
    }

    // Check if an image is uploaded
    if (!file) {
      setError("image", {
        type: "manual",
        message: "Category image is required",
      });
      return;
    } else {
      clearErrors("image");
    }
    let like = 0;
    // Prepare data to be sent
    const finalData = {
      ...data,
      date: today,
      email: user.email,
      content,
      like: {
        count: 0,
        email: [],
      },
      status: "pending",
      category: activeItem.label,
    };
    delete finalData.image;
    try {
      // Handle file upload
      const image = data.image[0];
      console.log(image);
      const formData = new FormData();
      formData.append("image", image);

      const imageResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const imageResult = await imageResponse.json();

      // Check if the image was uploaded successfully
      const photo = imageResult?.data?.display_url;
      console.log(photo);
      if (!photo) {
        toast.error("Failed to upload image");
        return;
      }

      // Add photo URL to finalData
      const blogData = { ...finalData, photo };

      // Send blog data to the server
      axios
        .post("https://blogs-editor-server.vercel.app/blogs", blogData)
        .then((response) => {
          console.log(response.data);
          if (response.data.insertedId) {
            toast.success("Your Blog is Successfully Upload");
            navigate("../blogger/show-blog");
          }
        });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <section className="w-[95%] mx-auto py-10">
      <div className="max-w-3xl mx-auto shadow rounded-sm border p-2 md:p-7">
        <h2 className="text-xl md:text-2xl font-semibold text-center">
          Add Blog
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div>
            <label className="text-sm font-medium leading-none" htmlFor="">
              Title
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-[#262626] focus:border-[#F50400] focus:outline-none"
              type="text"
              placeholder="Title..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="relative">
            <div
              className="flex h-10 items-center rounded-md justify-between border border-input bg-background px-3 py-2 text-sm border-[#262626] cursor-pointer"
              onClick={handleCategory}
            >
              <span>{activeItem ? activeItem.label : "Select a Category"}</span>
              {isOpenCategory ? (
                <FaChevronUp size={14} />
              ) : (
                <FaChevronDown size={14} />
              )}
            </div>

            <div
              className={`absolute left-0 right-0 mt-2 z-50 bg-white shadow-md border rounded-md overflow-hidden transition-all duration-300 ${
                isOpenCategory
                  ? "max-h-[350px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {categoryItems.map((item) => (
                <p
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`group px-5 mx-1 gap-3 rounded-md flex items-center py-2 my-1 text-sm font-medium cursor-pointer ${
                    activeItem?.id === item.id
                      ? "bg-[#F50400] text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </p>
              ))}
            </div>
          </div>

          <JoditEditor
            ref={editor}
            value={content}
            onChange={(newContent) => setContent(newContent)}
          />

          <div className="w-full px-3 mb-8">
            <label
              className="cursor-pointer flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-400 bg-white p-4 text-center"
              htmlFor="dropzone-file"
            >
              {file ? (
                <div className="mt-4 w-full relative border border-gray-300 rounded-lg">
                  <img
                    src={file}
                    alt="Preview"
                    className="w-full p-10 h-[320px]"
                  />
                  <div
                    onClick={handleRemoveFile}
                    className="absolute bg-[#F50400] p-1 rounded-full -top-4 -right-2 cursor-pointer"
                  >
                    <FaPlus className="rotate-45" size={23} />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mt-4 text-xl font-medium text-gray-700 tracking-wide">
                    Category image
                  </h2>
                  <p className="mt-2 text-gray-500 tracking-wide">
                    Upload or drag & drop your file (SVG, PNG, JPG, or GIF)
                  </p>
                </>
              )}

              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                {...register("image", {
                  required: "Category image is required",
                  onChange: (e) => handleFileChange(e), // Ensure the change handler is here
                })}
              />
            </label>
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">
                {errors.image.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded font-medium bg-[#F50400] px-5 py-2 text-white transition-all duration-300 ease-in-out"
          >
            Create New Blog
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddBlog;
