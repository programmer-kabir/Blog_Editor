import React, { useState, useRef, useEffect, Suspense } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../Components/Hooks/useAuth";
import useAdmin from "../../Components/Hooks/useAdmin";
import useBlogger from "../../Components/Hooks/useBlogger";
import logo from "../../assets/Logo/logo1.png";
import Loader from "../../Components/Loader/Loader";
import TopProgressBar from "../../Components/Loader/TopProgressBar";
import {
  LuLayoutDashboard,
  LuPenSquare,
  LuBookOpen,
  LuUsers,
  LuShieldAlert,
  LuHome,
  LuChevronDown,
  LuLayers,
  LuBookmark,
  LuUser,
} from "react-icons/lu";
import { HiOutlineBars3BottomRight, HiXMark } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import NotificationDropdown from "../../Components/Notification/NotificationDropdown";

const Dashboard = () => {
  const [isAdmin] = useAdmin();
  const [isBlogger] = useBlogger();
  const { logOut, user, loading } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <TopProgressBar />

      {/* Top Glass Dashboard Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-200/80 transition-all duration-300">
        <div className="w-[94%] md:w-[95%] max-w-[1750px] mx-auto">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Logo + Portal Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 focus:outline-none"
                aria-label="Toggle Dashboard Menu"
              >
                <HiOutlineBars3BottomRight className="w-5 h-5 text-slate-800" />
              </button>

              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-1 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                  <img className="h-7 w-auto object-contain" src={logo} alt="Logo" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors">
                    Blog<span className="text-brand">Editor</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1 hidden sm:block">
                    {isAdmin ? "Admin Portal" : isBlogger ? "Creator Studio" : "Dashboard"}
                  </span>
                </div>
              </Link>

              {/* Portal Pill */}
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-light text-brand">
                {isAdmin ? "Admin Center" : "Creator Mode"}
              </span>
            </div>

            {/* Middle: Desktop Navigation Pills */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
              {/* Admin Links */}
              {isAdmin && (
                <>
                  <NavLink
                    to="admin"
                    end
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuLayoutDashboard className="text-sm" />
                    Overview
                  </NavLink>
                  <NavLink
                    to="admin/blogs"
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuBookOpen className="text-sm" />
                    Moderation Queue
                  </NavLink>
                  <NavLink
                    to="admin/show-bloggers"
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuPenSquare className="text-sm" />
                    Bloggers
                  </NavLink>
                  <NavLink
                    to="admin/show-users"
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuUsers className="text-sm" />
                    All Users
                  </NavLink>
                  <NavLink
                    to="admin/categories"
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuLayers className="text-sm" />
                    Categories
                  </NavLink>
                </>
              )}

              {/* Blogger Links */}
              {isBlogger && !isAdmin && (
                <>
                  <NavLink
                    to="blogger"
                    end
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuLayoutDashboard className="text-sm" />
                    Studio Overview
                  </NavLink>
                  <NavLink
                    to="blogger/add-blog"
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuPenSquare className="text-sm" />
                    Write New Blog
                  </NavLink>
                  <NavLink
                    to="blogger/show-blog"
                    className={({ isActive }) =>
                      `px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-brand shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <LuBookOpen className="text-sm" />
                    My Submissions
                  </NavLink>
                </>
              )}
            </nav>

            {/* Right: User Avatar Dropdown, Bookmarks & Public Site Link */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/dashboard/bookmarks"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-brand hover:bg-slate-100 transition-colors"
                title="My Reading List"
              >
                <LuBookmark className="text-sm text-brand" />
                <span className="hidden sm:inline">Bookmarks</span>
              </Link>

              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-brand hover:bg-slate-100 transition-colors"
                title="View Live Website"
              >
                <LuHome className="text-sm" />
                <span>Live Site</span>
              </Link>

              <NotificationDropdown />

              {/* Avatar Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200 focus:outline-none transition-all"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center ring-2 ring-brand/20">
                      {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.displayName || user?.email?.split("@")[0]}
                  </span>
                  <LuChevronDown
                    className={`text-slate-400 text-xs transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-elevated border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.displayName || "User"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-brand-light text-brand">
                        {isAdmin ? "Administrator" : isBlogger ? "Blogger" : "Reader"}
                      </span>
                    </div>

                    <div className="py-1">
                      {user?.email && (
                        <Link
                          to={`/author/${user.email}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand transition-colors"
                        >
                          <LuUser className="text-sm text-slate-400" />
                          My Public Profile
                        </Link>
                      )}
                      <Link
                        to="/dashboard/bookmarks"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand transition-colors"
                      >
                        <LuBookmark className="text-sm text-slate-400" />
                        My Saved Bookmarks
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand transition-colors"
                      >
                        <LuHome className="text-sm text-slate-400" />
                        View Public Website
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <MdLogout className="text-sm" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isNavOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
            onClick={toggleSidebar}
          >
            <div
              className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-left duration-300"
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

                <nav className="mt-6 flex flex-col gap-1.5">
                  <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Dashboard Menu
                  </p>

                  {isAdmin ? (
                    <>
                      <NavLink
                        to="admin"
                        end
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuLayoutDashboard className="text-base" />
                        Overview
                      </NavLink>
                      <NavLink
                        to="admin/blogs"
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuBookOpen className="text-base" />
                        Moderation Queue
                      </NavLink>
                      <NavLink
                        to="admin/show-bloggers"
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuPenSquare className="text-base" />
                        Bloggers
                      </NavLink>
                      <NavLink
                        to="admin/show-users"
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuUsers className="text-base" />
                        All Users
                      </NavLink>
                      <NavLink
                        to="admin/categories"
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuLayers className="text-base" />
                        Categories
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="blogger"
                        end
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuLayoutDashboard className="text-base" />
                        Studio Overview
                      </NavLink>
                      <NavLink
                        to="blogger/add-blog"
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuPenSquare className="text-base" />
                        Write New Blog
                      </NavLink>
                      <NavLink
                        to="blogger/show-blog"
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                            isActive
                              ? "bg-brand-light text-brand font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`
                        }
                      >
                        <LuBookOpen className="text-base" />
                        My Submissions
                      </NavLink>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-100 my-1">
                    <NavLink
                      to="bookmarks"
                      onClick={toggleSidebar}
                      className={({ isActive }) =>
                        `px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                          isActive
                            ? "bg-brand-light text-brand font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`
                      }
                    >
                      <LuBookmark className="text-base text-brand" />
                      Saved Bookmarks
                    </NavLink>
                  </div>
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2">
                <Link
                  to="/"
                  onClick={toggleSidebar}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  <LuHome className="text-sm" />
                  Return to Website
                </Link>
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand rounded-xl hover:bg-brand-dark"
                >
                  <MdLogout className="text-sm" />
                  Logout
                </button>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Main Dashboard Content Outlet */}
      <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 w-[94%] md:w-[95%] max-w-[1750px] mx-auto w-full">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default Dashboard;
