import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/Logo/logo1.png";
import { LuLogIn, LuLayoutDashboard, LuPenSquare, LuChevronDown, LuBookmark, LuSearch } from "react-icons/lu";
import { HiOutlineBars3BottomRight, HiXMark } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import useAuth from "../../../Components/Hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/Users/userSlice";
import InstantSearchModal from "../../../Components/Search/InstantSearchModal";

const Navbar = () => {
  const { logOut, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Global Ctrl + K / Cmd + K Shortcut Listener
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

  const { Users = [] } = useSelector((state) => state.Users);

  useEffect(() => {
    if (user?.email && Users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [user, dispatch, Users.length]);

  const currentUser = Users.find((u) => u?.email === user?.email);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile nav on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsNavOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsNavOpen(!isNavOpen);

  const handleLogOut = async () => {
    try {
      await logOut();
      setIsProfileOpen(false);
      setIsNavOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const dashboardRoute =
    currentUser?.role === "admin"
      ? "/dashboard/admin"
      : currentUser?.role === "blogger"
      ? "/dashboard/blogger"
      : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-200/80 transition-all duration-300">
      <div className="w-[94%] md:w-[95%] max-w-[1750px] mx-auto">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="Blog Editor Home"
          >
            <div className="relative flex items-center justify-center p-1 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300">
              <img className="h-8 w-auto object-contain" src={logo} alt="Blog Editor Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand transition-colors">
                Blog<span className="text-brand">Editor</span>
              </span>
              <span className="text-[10px] uppercase font-medium tracking-widest text-slate-400 -mt-1 hidden sm:block">
                Digital Stories
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white text-brand shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white text-brand shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`
              }
            >
              Explore Blogs
            </NavLink>
            <NavLink
              to="/about-us"
              className={({ isActive }) =>
                `px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white text-brand shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`
              }
            >
              About Us
            </NavLink>
            {dashboardRoute && (
              <NavLink
                to={dashboardRoute}
                className={({ isActive }) =>
                  `px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-white text-brand shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Search Button (Ctrl + K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-800 transition-all"
              title="Quick Search (Ctrl + K)"
            >
              <LuSearch className="text-xs text-brand" />
              <span className="hidden xl:inline">Search stories...</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-400 font-bold">
                Ctrl K
              </kbd>
            </button>

            {currentUser?.role === "blogger" && (
              <Link
                to="/dashboard/blogger/add-blog"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand bg-brand-light/70 hover:bg-brand-light border border-brand/20 rounded-full transition-colors"
              >
                <LuPenSquare className="text-sm" />
                Write Post
              </Link>
            )}

            {user && (
              <Link
                to="/dashboard/bookmarks"
                className="hidden sm:inline-flex p-2 rounded-full border border-slate-200/80 bg-white hover:bg-brand-light/50 text-slate-700 hover:text-brand transition-colors"
                title="My Reading List / Bookmarks"
              >
                <LuBookmark className="text-base" />
              </Link>
            )}

            {user ? (
              /* User Profile Dropdown */
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all focus:outline-none"
                  aria-expanded={isProfileOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center ring-2 ring-brand/20">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[100px] truncate">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize leading-none">
                      {currentUser?.role || "reader"}
                    </span>
                  </div>
                  <LuChevronDown
                    className={`text-slate-400 text-xs transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-elevated border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-brand-light text-brand">
                        {currentUser?.role || "reader"}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard/bookmarks"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand transition-colors"
                      >
                        <LuBookmark className="text-base text-brand" />
                        My Saved Bookmarks
                      </Link>
                      {dashboardRoute && (
                        <Link
                          to={dashboardRoute}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand transition-colors"
                        >
                          <LuLayoutDashboard className="text-base text-slate-400" />
                          Dashboard
                        </Link>
                      )}
                      {currentUser?.role === "blogger" && (
                        <Link
                          to="/dashboard/blogger/add-blog"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand transition-colors"
                        >
                          <LuPenSquare className="text-base text-slate-400" />
                          Create New Blog
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <MdLogout className="text-base" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:text-brand transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-white bg-brand hover:bg-brand-dark shadow-sm hover:shadow-brand transition-all duration-200"
                >
                  <LuLogIn className="text-sm" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Search + Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 focus:outline-none"
              title="Search"
            >
              <LuSearch className="w-5 h-5 text-slate-800" />
            </button>
            {user && (
              <div className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center">
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isNavOpen ? (
                <HiXMark className="w-6 h-6 text-brand" />
              ) : (
                <HiOutlineBars3BottomRight className="w-6 h-6 text-slate-800" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        >
          <div
            className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img className="h-7 w-auto" src={logo} alt="Logo" />
                  <span className="font-bold text-base text-slate-900">
                    Blog<span className="text-brand">Editor</span>
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <HiXMark className="w-6 h-6" />
                </button>
              </div>

              {/* User Profile Snippet in Mobile Drawer */}
              {user && (
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand text-white font-bold flex items-center justify-center">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {user.displayName || "User"}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{user.email}</span>
                    <span className="text-[10px] font-semibold text-brand uppercase tracking-wider mt-0.5">
                      Role: {currentUser?.role || "reader"}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <nav className="mt-6 flex flex-col gap-1.5">
                <NavLink
                  to="/"
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-light text-brand font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/blogs"
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-light text-brand font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  Explore Blogs
                </NavLink>
                <NavLink
                  to="/about-us"
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-light text-brand font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  About Us
                </NavLink>
                {dashboardRoute && (
                  <NavLink
                    to={dashboardRoute}
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-light text-brand font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    Dashboard ({currentUser?.role})
                  </NavLink>
                )}
                {currentUser?.role === "blogger" && (
                  <NavLink
                    to="/dashboard/blogger/add-blog"
                    onClick={toggleSidebar}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-brand bg-brand-light/50 hover:bg-brand-light flex items-center gap-2"
                  >
                    <LuPenSquare className="text-base" />
                    Write a Post
                  </NavLink>
                )}
              </nav>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-slate-100">
              {user ? (
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand-dark transition-colors"
                >
                  <MdLogout className="text-lg" />
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/signin"
                    onClick={toggleSidebar}
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={toggleSidebar}
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand-dark shadow-sm"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {/* Instant Search Command Palette Modal */}
      <InstantSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};

export default Navbar;
