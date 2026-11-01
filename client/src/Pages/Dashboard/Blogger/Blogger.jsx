import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBloggerBlogs } from "../../Redux/BloggerBlogs/bloggerBlogSlice";
import useAuth from "../../../Components/Hooks/useAuth";
import {
  LuBookOpen,
  LuCheckCircle2,
  LuClock,
  LuAlertCircle,
  LuPenSquare,
  LuArrowRight,
  LuSparkles,
  LuEye,
} from "react-icons/lu";

const Blogger = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
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

  const recentBlogs = [...BloggerBlog].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Creator Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-10 shadow-elevated border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Creator"}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand/30 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand text-white font-extrabold text-2xl flex items-center justify-center ring-2 ring-brand/30 shadow-md">
                {(user?.displayName || user?.email || "C").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/20 text-brand text-[10px] font-bold uppercase tracking-wider mb-1">
                <LuSparkles className="text-xs" /> Creator Studio
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Welcome back, {user?.displayName || user?.email?.split("@")[0] || "Writer"}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage your articles, track approval statuses, and draft new stories.
              </p>
            </div>
          </div>

          <Link
            to="add-blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand flex-shrink-0"
          >
            <LuPenSquare className="text-base" />
            <span>Write New Story</span>
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Posts */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Submissions
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center text-lg">
              <LuBookOpen />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {BloggerBlog.length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">All created articles</p>
          </div>
        </div>

        {/* Approved Posts */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Approved & Live
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <LuCheckCircle2 />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {approvedBlogs.length}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Active in public feed
            </p>
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <LuClock />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pendingBlogs.length}
            </h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              Awaiting admin approval
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Needs Revision
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
              <LuAlertCircle />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {rejectBlogs.length}
            </h3>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Feedback provided
            </p>
          </div>
        </div>

      </div>

      {/* Recent Submissions & Studio Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Submissions Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Submissions</h2>
              <p className="text-xs text-slate-500">Your latest created articles and their live status</p>
            </div>
            <Link
              to="show-blog"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <LuArrowRight />
            </Link>
          </div>

          {recentBlogs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-slate-500">You haven't written any blogs yet.</p>
              <Link
                to="add-blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-dark"
              >
                <LuPenSquare />
                <span>Write Your First Blog</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBlogs.map((blog) => {
                const statusColor =
                  blog.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : blog.status === "pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";

                return (
                  <div
                    key={blog._id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {blog.photo ? (
                        <img
                          src={blog.photo}
                          alt={blog.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                          <LuBookOpen />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {blog.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span className="capitalize">{blog.category}</span>
                          <span>•</span>
                          <span>{blog.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}
                      >
                        {blog.status}
                      </span>
                      <Link
                        to={`blog-details/${blog._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-100 transition-colors"
                        title="View Blog Details"
                      >
                        <LuEye className="text-base" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Creator Tips & Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LuSparkles className="text-brand" />
              <span>Publishing Tips for Fast Approval</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">1. High-Resolution Cover Image</p>
                <p className="text-slate-500 mt-0.5">
                  Choose crisp landscape photos that represent your article theme clearly.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">2. Clear Structure & Headings</p>
                <p className="text-slate-500 mt-0.5">
                  Use H2 and H3 tags, bullet points, and code snippets in the rich text editor.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">3. Select Correct Category</p>
                <p className="text-slate-500 mt-0.5">
                  Categorizing properly ensures interested readers find your story immediately.
                </p>
              </div>
            </div>

            <Link
              to="add-blog"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-brand bg-brand-light hover:bg-brand/10 transition-colors"
            >
              <LuPenSquare />
              <span>Draft a Post Now</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blogger;
