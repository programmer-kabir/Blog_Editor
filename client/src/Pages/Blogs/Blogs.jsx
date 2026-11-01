import React, { useEffect, useState, Suspense } from "react";
import { Link, NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import logo from "../../assets/Logo/logo1.png";
import { IoIosCode, IoMdFitness } from "react-icons/io";
import { GiProcessor } from "react-icons/gi";
import { TfiWorld } from "react-icons/tfi";
import { IoBicycleOutline, IoHomeOutline } from "react-icons/io5";
import { RiGraduationCapLine } from "react-icons/ri";
import { FaRegLifeRing } from "react-icons/fa6";
import { PiBowlFoodLight, PiDressThin } from "react-icons/pi";
import { LuLayoutDashboard, LuPenSquare, LuSearch, LuBookmark } from "react-icons/lu";
import { HiOutlineBars3BottomRight, HiXMark } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../Redux/Blogs/blogSlice";
import { fetchUsers } from "../Redux/Users/userSlice";
import { fetchCategories } from "../Redux/Categories/categorySlice";
import useAuth from "../../Components/Hooks/useAuth";
import Loader from "../../Components/Loader/Loader";
import InstantSearchModal from "../../Components/Search/InstantSearchModal";
import NotificationDropdown from "../../Components/Notification/NotificationDropdown";

const fallbackCategoryData = [
  { title: "Programming", icon: "💻", link: "programming" },
  { title: "Technology", icon: "⚡", link: "technology" },
  { title: "DevOps & Cloud", icon: "☁️", link: "devops" },
  { title: "Travel & Tours", icon: "✈️", link: "travel" },
  { title: "Education", icon: "🎓", link: "education" },
  { title: "Lifestyle", icon: "🌿", link: "lifestyle" },
  { title: "Fitness & Health", icon: "💪", link: "fitness" },
  { title: "Fashion", icon: "👗", link: "fashion" },
  { title: "Food & Drinks", icon: "🍔", link: "food" },
];

const Blogs = () => {
  const { name } = useParams();
  const location = useLocation();
  const { user, logOut } = useAuth();
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const { Blogs = [] } = useSelector((state) => state.Blogs);
  const { Users = [] } = useSelector((state) => state.Users);
  const { categories = [] } = useSelector((state) => state.Categories);

  useEffect(() => {
    dispatch(fetchBlogs());
    if (Users.length === 0) {
      dispatch(fetchUsers());
    }
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, name, Users.length, categories.length]);

  const dynamicCategories = [
    { title: "All Articles", icon: <IoHomeOutline />, link: "" },
    ...(categories.length > 0
      ? categories.map((c) => ({
          title: c.label,
          icon: c.icon || "📌",
          link: c.title,
        }))
      : fallbackCategoryData),
  ];

  const approvedBlogs = Blogs.filter((blog) => blog.status === "approved");
  const currentUser = Users.find((u) => u?.email === user?.email);

  const popularTags = React.useMemo(() => {
    const tagMap = {};
    approvedBlogs.forEach((blog) => {
      if (Array.isArray(blog.tags)) {
        blog.tags.forEach((tag) => {
          const clean = tag.toLowerCase().trim();
          if (clean) tagMap[clean] = (tagMap[clean] || 0) + 1;
        });
      }
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [approvedBlogs]);

  useEffect(() => {
    const counts = {};
    approvedBlogs.forEach((blog) => {
      const cat = blog.category;
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    setCategoryCounts(counts);
  }, [Blogs]);

  const toggleSidebar = () => setIsNavOpen(!isNavOpen);

  const dashboardRoute =
    currentUser?.role === "admin"
      ? "/dashboard/admin"
      : currentUser?.role === "blogger"
      ? "/dashboard/blogger"
      : null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 w-64 lg:w-72 h-screen bg-white border-r border-slate-200/80 z-30 justify-between">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-1 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                <img className="h-7 w-auto" src={logo} alt="Blog Editor" />
              </div>
              <span className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors">
                Blog<span className="text-brand">Editor</span>
              </span>
            </Link>
          </div>

          {/* Categories Section */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Browse Categories
            </p>

            {dynamicCategories.map((data, index) => {
              const isCurrent =
                (data.link === "" && !name) ||
                (data.link !== "" && name === data.link);
              const path = data.link ? `/blogs/category/${data.link}` : "/blogs";
              const count =
                data.link === "" ? approvedBlogs.length : categoryCounts[data.link] || 0;

              return (
                <Link
                  to={path}
                  key={index}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isCurrent
                      ? "bg-brand-light text-brand shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-base ${isCurrent ? "text-brand" : "text-slate-400"}`}>
                      {data.icon}
                    </span>
                    <span>{data.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-brand text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}

            {/* Trending Tags Section */}
            {popularTags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 mt-4 px-1">
                <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Trending Tags</span>
                  <span className="text-[10px] text-brand font-semibold">#explore</span>
                </p>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {popularTags.map(([tag, count]) => {
                    const isActive = location.pathname === `/blogs/tag/${tag}`;
                    return (
                      <Link
                        key={tag}
                        to={`/blogs/tag/${tag}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isActive
                            ? "bg-brand text-white shadow-xs font-bold"
                            : "bg-slate-100 hover:bg-brand-light hover:text-brand text-slate-600"
                        }`}
                      >
                        <span>#{tag}</span>
                        <span
                          className={`text-[9px] font-bold ${
                            isActive ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-brand transition-colors rounded-xl hover:bg-white"
          >
            <IoHomeOutline className="text-base" />
            <span>Return to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 glass-nav border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
          {/* Mobile Hamburger + Title */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 focus:outline-none"
              aria-label="Toggle Category Menu"
            >
              <HiOutlineBars3BottomRight className="w-5 h-5 text-slate-800" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img className="h-7 w-auto" src={logo} alt="Logo" />
              <span className="font-bold text-sm text-slate-900">
                Blog<span className="text-brand">Editor</span>
              </span>
            </Link>
          </div>

          {/* Breadcrumb Context / Category Heading */}
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-brand transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/blogs" className="text-slate-800 font-semibold hover:text-brand transition-colors">
              Blogs
            </Link>
            {name && (
              <>
                <span>/</span>
                <span className="capitalize text-brand font-bold bg-brand-light px-2.5 py-0.5 rounded-full text-xs">
                  {name}
                </span>
              </>
            )}
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-800 transition-all max-w-[180px] sm:max-w-xs w-full"
            title="Instant Search (Ctrl + K)"
          >
            <LuSearch className="text-xs text-brand flex-shrink-0" />
            <span className="truncate">Search stories...</span>
            <kbd className="hidden md:inline-flex ml-auto items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-400 font-bold">
              Ctrl K
            </kbd>
          </button>

          {/* Action Links & Profile */}
          <div className="flex items-center gap-3">
            {currentUser?.role === "blogger" && (
              <Link
                to="/dashboard/blogger/add-blog"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand bg-brand-light/70 hover:bg-brand-light rounded-full border border-brand/20 transition-colors"
              >
                <LuPenSquare className="text-xs" />
                Write Post
              </Link>
            )}

            {dashboardRoute && (
              <NavLink
                to={dashboardRoute}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors"
              >
                <LuLayoutDashboard className="text-xs text-brand" />
                Dashboard
              </NavLink>
            )}

            {user && (
              <>
                <Link
                  to="/dashboard/bookmarks"
                  className="hidden sm:inline-flex p-2 rounded-full border border-slate-200 bg-white hover:bg-brand-light/50 text-slate-700 hover:text-brand transition-colors"
                  title="My Bookmarks"
                >
                  <LuBookmark className="text-sm" />
                </Link>
                <NotificationDropdown />
              </>
            )}

            {user ? (
              <button
                onClick={logOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-brand bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <MdLogout className="text-xs" />
                Logout
              </button>
            ) : (
              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-brand hover:bg-brand-dark transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Outlet Component */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
          onClick={toggleSidebar}
        >
          <div
            className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img className="h-7 w-auto" src={logo} alt="Logo" />
                  <span className="font-bold text-sm text-slate-900">
                    Blog<span className="text-brand">Editor</span>
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Categories
                </p>
                {dynamicCategories.map((data, index) => {
                  const isCurrent =
                    (data.link === "" && !name) ||
                    (data.link !== "" && name === data.link);
                  const path = data.link ? `/blogs/category/${data.link}` : "/blogs";
                  const count =
                    data.link === "" ? approvedBlogs.length : categoryCounts[data.link] || 0;

                  return (
                    <Link
                      to={path}
                      key={index}
                      onClick={toggleSidebar}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        isCurrent
                          ? "bg-brand-light text-brand font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{data.icon}</span>
                        <span>{data.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Trending Tags */}
              {popularTags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Trending Tags</span>
                    <span className="text-[10px] text-brand font-semibold">#explore</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-3">
                    {popularTags.map(([tag, count]) => {
                      const isActive = location.pathname === `/blogs/tag/${tag}`;
                      return (
                        <Link
                          key={tag}
                          to={`/blogs/tag/${tag}`}
                          onClick={toggleSidebar}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isActive
                              ? "bg-brand text-white font-bold"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span>#{tag}</span>
                          <span className="text-[10px] opacity-70">({count})</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/"
                onClick={toggleSidebar}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-brand"
              >
                <IoHomeOutline />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Instant Search Command Palette Modal */}
      <InstantSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default Blogs;
