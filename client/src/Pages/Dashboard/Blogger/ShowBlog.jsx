import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBloggerBlogs } from "../../Redux/BloggerBlogs/bloggerBlogSlice";
import useAuth from "../../../Components/Hooks/useAuth";
import AllBlogCard from "../../../Components/Dashboard/AllBlogCard";
import { BlogGridSkeleton } from "../../../Components/Loader/BlogCardSkeleton";
import {
  LuBookOpen,
  LuPenSquare,
  LuSearch,
  LuFilter,
  LuFileQuestion,
} from "react-icons/lu";

const ShowBlog = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { isBloggerBlogLoading, BloggerBlog = [] } = useSelector(
    (state) => state.BloggerBlog
  );

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchBloggerBlogs(user.email));
    }
  }, [dispatch, user?.email]);

  const approvedBlogs = BloggerBlog.filter((b) => b.status === "approved");
  const pendingBlogs = BloggerBlog.filter((b) => b.status === "pending");
  const rejectBlogs = BloggerBlog.filter((b) => b.status === "reject");

  // Filter by status tab
  const statusFiltered = BloggerBlog.filter((blog) => {
    if (activeFilter === "approved") return blog.status === "approved";
    if (activeFilter === "pending") return blog.status === "pending";
    if (activeFilter === "reject") return blog.status === "reject";
    return true;
  });

  // Filter by search query
  const displayedBlogs = statusFiltered.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submissions & Stories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your article performance, view editorial approval statuses, and read feedback.
          </p>
        </div>

        <Link
          to="../blogger/add-blog"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex-shrink-0"
        >
          <LuPenSquare className="text-base" />
          <span>Write New Story</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 max-w-fit">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({BloggerBlog.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "approved"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live ({approvedBlogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "pending"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            In Review ({pendingBlogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("reject")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "reject"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Revision Needed ({rejectBlogs.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your stories..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
          />
        </div>

      </div>

      {/* Grid of Articles */}
      {isBloggerBlogLoading ? (
        <BlogGridSkeleton count={4} />
      ) : displayedBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-2xl">
            <LuFileQuestion />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchTerm
              ? `No stories found matching "${searchTerm}"`
              : activeFilter !== "all"
              ? `No stories currently marked as "${activeFilter}"`
              : "You haven't published any stories yet"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {searchTerm
              ? "Try clearing your search keyword or switching filter tabs."
              : "Share your tutorials, stories, and thoughts with thousands of readers worldwide."}
          </p>

          <Link
            to="../blogger/add-blog"
            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-dark transition-colors shadow-sm"
          >
            <LuPenSquare className="text-sm" />
            <span>Write New Story</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {displayedBlogs.map((blog) => (
            <AllBlogCard
              key={blog._id}
              data={blog}
              link={`../blogger/blog-details/${blog._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowBlog;
