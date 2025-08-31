import React, { useEffect, useState } from "react";
import logo from "../../assets/Logo/logo1.png";
import { IoIosCode, IoMdFitness } from "react-icons/io";
import { GiProcessor } from "react-icons/gi";
import { TfiWorld } from "react-icons/tfi";
import { IoBicycleOutline, IoHomeOutline } from "react-icons/io5";
import { RiGraduationCapLine } from "react-icons/ri";
import { FaBarsStaggered, FaPlus, FaRegLifeRing } from "react-icons/fa6";
import { PiBowlFoodLight, PiDressThin } from "react-icons/pi";
import { LuBookMarked, LuLogIn } from "react-icons/lu";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../Redux/Blogs/blogSlice";
import useAuth from "../../Components/Hooks/useAuth";
import { MdLogout } from "react-icons/md";
import { fetchUsers } from "../Redux/Users/userSlice";

const CategoryData = [
  { title: "programming", icon: <IoIosCode />, link: "programming" },
  { title: "technology", icon: <GiProcessor />, link: "technology" },
  { title: "devops", icon: <TfiWorld />, link: "devops" },
  { title: "travel", icon: <IoBicycleOutline />, link: "travel" },
  { title: "education", icon: <RiGraduationCapLine />, link: "education" },
  { title: "lifestyle", icon: <FaRegLifeRing />, link: "lifestyle" },
  { title: "fitness", icon: <IoMdFitness />, link: "fitness" },
  { title: "fashion", icon: <PiDressThin />, link: "fashion" },
  { title: "food", icon: <PiBowlFoodLight />, link: "food" },
];

const Blogs = () => {

  const { name } = useParams();

  const {user,logOut} = useAuth()
  const [activeIndex, setActiveIndex] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const dispatch = useDispatch();
  const { isBlogLoading, Blogs, isBlogError } = useSelector( (state) => state.Blogs)
  const { isUsersLoading, Users, isUsersError } = useSelector(
    (state) => state.Users
  );
  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchUsers());
  }, [dispatch, name]);

  const filteredBlogs = Blogs.filter((blog) => blog.status === "approved");
  const currentUser = Users.find(user => user?.email === user?.email)
console.log(currentUser?.role);
  useEffect(() => {
    const counts = {};
    filteredBlogs.forEach((blog) => {
      if (counts[blog.category]) {
        counts[blog.category] += 1;
      } else {
        counts[blog.category] = 1;
      }
    });
    setCategoryCounts(counts); // Store the counts in state
  }, [Blogs]);
  // Filter blogs based on category or show all if no category is selected
  const handleLogOut = () => {
    logOut();
  };
  const [isNavOpen, setIsNavOpen] = useState(false);
  const toggleSidebar = () => {
    setIsNavOpen(!isNavOpen);
  };
  return (
    <section className="flex items-start">
      {/* Left Side (Fixed Sidebar) */}
      <div className="fixed hidden md:flex flex-col top-0 left-0 pr-5 md:w-[20%] h-screen border-r bg-white z-10">
        {/* Logo */}
        <Link
          to="/"
          className="md:flex pl-5 h-14 gap-1 hidden items-center justify-start border-b"
        >
          <img className="h-[35px]" src={logo} alt="Logo" />
          <h2 className="text-black text-[17px] font-semibold">Blog Editor</h2>
        </Link>
        {/* Blog Category Name */}
        <div className="grid items-start py-2 lg:pl-4 gap-2 mr-5 border-b">
          {CategoryData.map((data, index) => (
            //  <Link to={`/category/${data.link}`} key={index}>
            <Link
              to={`category/${data.link}`}
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`text-[17px] flex px-2 py-2 items-center justify-start gap-2 transition-all ${
                activeIndex === index
                  ? "text-[#F50400] border-r-4 rounded-l-md pr-2 border-[#F50400] bg-gray-100"
                  : "text-gray-600"
              }`}
            >
              <div className="flex gap-3 items-center">
                {/* Display the icon and title */}
                <p className="text-[18px]">{data.icon}</p>
                {data.title}
              </div>

              {/* Notification Badge with spacing */}
              <p className="ml-auto bg-[#F50400] rounded-full w-3 h-3 flex items-center justify-center p-3 text-white">
                {categoryCounts[data.link] || 0}{" "}
                {/* Display the category count */}
              </p>
            </Link>
            // </Link>
          ))}
        </div>

        {/* Home and Bookmark Buttons */}
        <div className="mx-4 mr-4">
          <Link
            to={"/"}
            className="text-[17px] flex px-2 py-2 items-center  gap-2 transition-all group hover:text-[#F50400]"
          >
            <IoHomeOutline />
            Home
          </Link>
        </div>
      </div>

      {/* Right Side */}
      <div className="md:w-[80%] w-full md:ml-[20%] ">
        {/* md Header */}
        <div className="h-14 hidden px-5 border-b md:flex items-center justify-between">
          <div className="relative ">
            <input
              className="bg-white w-full pr-11 h-10 pl-8 py-2 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
              placeholder="Search blogs..."
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            />
            <button
              className="absolute left-0 h-8 w-8  top-1 my-auto px-2 flex items-center rounded"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3"
                stroke="currentColor"
                className="w-8 h-8 text-slate-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>

          <div className="text-white flex items-center gap-4">
            <div className="md:flex text-black gap-2 hidden ">
              {currentUser?.role ==="admin" && (
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 text-[#F50400]   border rounded-md bg-[#f5f5f5] "
                      : "px-4 py-2 text-[#737373] hover:text-[#F50400] border rounded-md "
                  }
                >
                  Dashboard
                </NavLink>
              )}
              {currentUser?.role === "blogger" && (
                <NavLink
                  to="/dashboard/blogger"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 text-[#F50400]   bg-[#f5f5f5] border rounded-md"
                      : "px-4 py-2 text-[#737373] hover:text-[#F50400] border rounded-md"
                  }
                >
                  Dashboard
                </NavLink>
              )}
            </div>
            <div>
          {user ? (
            <button onClick={handleLogOut} to="/signin" className="text-white">
              <button className="flex items-center justify-center gap-1 rounded font-medium bg-[#F50400] px-5 py-2 text-white transition-all duration-300 ease-in-out group">
                Logout{" "}
                <MdLogout   className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-2" size={21} />
              </button>
            </button>
          ) : (
            <Link to="/signin" className="text-white">
              <button className="flex items-center justify-center gap-1 rounded font-medium bg-[#F50400] px-5 py-2 text-white transition-all duration-300 ease-in-out group">
                Login <LuLogIn   className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-2" size={21} />
              </button>
            </Link>
          )}
        </div>
          </div>
        </div>
        {/* Small Hieader */}
        <div className="h-14 flex px-5 gap-3 border-b  md:hidden items-center justify-between">
        <div
          onClick={toggleSidebar}
          className="bg-[#F50400] md:hidden px-3 py-1 rounded-md"
        >
          <FaBarsStaggered color="#fff " className="bg-[#F50400]" size={22} />
        </div>

          <div className="text-white flex items-center gap-4">
            <div className="flex text-black gap-2  ">
              {currentUser?.role === "admin" && (
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) =>
                    isActive
                      ? "px-3 py-1 text-[#F50400]   border rounded-md bg-[#f5f5f5] "
                      : "px-3 py-1 text-[#737373] hover:text-[#F50400] border rounded-md "
                  }
                >
                  Dashboard
                </NavLink>
              )}
              {currentUser?.role === "blogger" && (
                <NavLink
                  to="/dashboard/blogger"
                  className={({ isActive }) =>
                    isActive
                      ? "px-3 py-1 text-[#F50400]   bg-[#f5f5f5] border rounded-md"
                      : "px-3 py-1 text-[#737373] hover:text-[#F50400] border rounded-md"
                  }
                >
                  Dashboard
                </NavLink>
              )}
            </div>
            <div>
          {user ? (
            <button onClick={handleLogOut} to="/signin" className="text-white">
              <button className="flex items-center justify-center gap-1 rounded font-medium bg-[#F50400] px-3 py-1 text-white transition-all duration-300 ease-in-out group">
                Logout{" "}
                <MdLogout   className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-2" size={21} />
              </button>
            </button>
          ) : (
            <Link to="/signin" className="text-white">
              <button className="flex items-center justify-center gap-1 rounded font-medium bg-[#F50400] px-3 py-1 text-white transition-all duration-300 ease-in-out group">
                Login <LuLogIn   className="transform transition-transform duration-300 ease-in-out group-hover:translate-x-2" size={21} />
              </button>
            </Link>
          )}
        </div>
          </div>
        </div>
        
        {/* Blog List */}
        {/* <div className="grid lg:grid-cols-3 gap-7 pt-7 px-5">
          {isBlogLoading && <p>Loading...</p>}
          {isBlogError && <p>Error loading blogs</p>}
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog._id} data={blog} />
          ))}
        </div> */}
        <Outlet />
      </div>
      <div className="flex justify-end">
        <div
          className={`fixed text-white top-0 bottom-0 flex justify-end left-0 right-0 bg-black bg-opacity-75 z-50 transition-opacity duration-500 ease-in-out ${
            isNavOpen
              ? "opacity-100  transition-opacity duration-500 ease-out "
              : "  opacity-0 pointer-events-none "
          }`}
        >
          {/* Sidebar Container */}
          <div
            className={`w-9/12 border-l bg-white overflow-y-auto py-3  md:hidden h-screen transform transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] ${
              isNavOpen ? "translate-x-0 " : "translate-x-full"
            }`}
          >
            <div className="flex px-5 justify-between border-b border-gray-400 pb-4">
              <div className="flex gap-2   items-center justify-center">
                <img className="h-[35px]" src={logo} alt="Logo" />
                <h2 className="text-black text-[17px] font-semibold">
                  Blog Editor
                </h2>
              </div>
              <button
                className="border border-[#F50400] px-1 rounded-md"
                onClick={toggleSidebar}
              >
                <FaPlus className="rotate-45" size={20} color="black" />
              </button>
            </div>
            <div className="pt-2 px-2 ">
            <div className=" top-0 left-0 pr-5 md:w-[20%] h-screen border-r bg-white z-10">
        {/* Logo */}
        <Link
          to="/"
          className="md:flex pl-5 h-14 gap-1 hidden items-center justify-start border-b"
        >
          <img className="h-[35px]" src={logo} alt="Logo" />
          <h2 className="text-black text-[17px] font-semibold">Blog Editor</h2>
        </Link>
        {/* Blog Category Name */}
        <div className="grid items-start py-2 lg:pl-4 gap-2 mr-5 border-b">
          {CategoryData.map((data, index) => (
            //  <Link to={`/category/${data.link}`} key={index}>
            <Link
              to={`category/${data.link}`}
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`text-[17px] flex px-2 py-2 items-center justify-start gap-2 transition-all ${
                activeIndex === index
                  ? "text-[#F50400] border-r-4 rounded-l-md pr-2 border-[#F50400] bg-gray-100"
                  : "text-gray-600"
              }`}
            >
              <div className="flex gap-3 items-center">
                {/* Display the icon and title */}
                <p className="text-[18px]">{data.icon}</p>
                {data.title}
              </div>

              {/* Notification Badge with spacing */}
              <p className="ml-auto bg-[#F50400] rounded-full w-3 h-3 flex items-center justify-center p-3 text-white">
                {categoryCounts[data.link] || 0}{" "}
                {/* Display the category count */}
              </p>
            </Link>
            // </Link>
          ))}
        </div>

        {/* Home and Bookmark Buttons */}
        <div className="mx-4 mr-4 text-black">
          <Link
            to={"/"}
            className="text-[17px] flex px-2 py-2 items-center  gap-2 transition-all group hover:text-[#F50400]"
          >
            <IoHomeOutline />
            Home
          </Link>
        </div>
      </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blogs;
