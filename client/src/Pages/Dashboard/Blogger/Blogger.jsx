import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBloggerBlogs } from "../../Redux/BloggerBlogs/bloggerBlogSlice";
import useAuth from "../../../Components/Hooks/useAuth";
import axios from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  LuBookOpen,
  LuCheckCircle2,
  LuClock,
  LuAlertCircle,
  LuPenSquare,
  LuArrowRight,
  LuSparkles,
  LuEye,
  LuTrendingUp,
  LuHeart,
  LuBarChart3,
  LuActivity,
} from "react-icons/lu";

// Custom Sleek Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-800 text-xs">
        <p className="font-bold text-slate-400 mb-1">{label}</p>
        <p className="text-brand font-extrabold text-sm flex items-center gap-1.5">
          <span>👁️</span>
          <span>
            {payload[0].value} {payload[0].value === 1 ? "reader" : "readers"}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const Blogger = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { isBloggerBlogLoading, BloggerBlog = [] } = useSelector(
    (state) => state.BloggerBlog
  );

  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchBloggerBlogs(user.email));

      // Fetch Creator Analytics
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/blogger/analytics/${encodeURIComponent(
            user.email
          )}`
        )
        .then((res) => {
          setAnalytics(res.data);
        })
        .catch((err) => {
          console.error("Failed to load analytics:", err);
        })
        .finally(() => {
          setIsLoadingAnalytics(false);
        });
    }
  }, [dispatch, user?.email]);

  const approvedBlogs = BloggerBlog.filter((b) => b.status === "approved");
  const pendingBlogs = BloggerBlog.filter((b) => b.status === "pending");
  const rejectBlogs = BloggerBlog.filter((b) => b.status === "reject");

  const totalViews =
    analytics?.stats?.totalViews ??
    BloggerBlog.reduce((acc, b) => acc + (b.views || 0), 0);

  const totalReactions =
    (analytics?.stats?.totalLikes || 0) + (analytics?.stats?.totalReactions || 0);

  const engagementRate = analytics?.stats?.engagementRate ?? 0;

  const viewsData = analytics?.viewsOverTime || [];
  const topStories = analytics?.topStories || [];
  const recentBlogs = [...BloggerBlog].reverse().slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
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
                {(user?.displayName || user?.email || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/20 text-brand text-[10px] font-bold uppercase tracking-wider mb-1">
                <LuSparkles className="text-xs" /> Creator Studio
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Welcome back,{" "}
                {user?.displayName || user?.email?.split("@")[0] || "Writer"}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage your articles, analyze reader engagement, and draft new
                stories.
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

      {/* 4 Interactive Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Views */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Article Views
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
              <LuEye />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalViews.toLocaleString()}
            </h3>
            <p className="text-xs text-brand font-semibold mt-1 flex items-center gap-1">
              <LuTrendingUp className="text-xs" />
              <span>Unique reader sessions</span>
            </p>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Published Stories
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
              <LuBookOpen />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {BloggerBlog.length}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {approvedBlogs.length} Live • {pendingBlogs.length} in review
            </p>
          </div>
        </div>

        {/* Reader Reactions & Claps */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reactions & Claps
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
              <LuHeart />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalReactions.toLocaleString()}
            </h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              Applause, Love & Feedback
            </p>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Engagement Rate
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
              <LuActivity />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {engagementRate}%
            </h3>
            <p className="text-xs text-indigo-600 font-semibold mt-1">
              Active reader responses
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8-col: 7-Day Views Traffic Trend (AreaChart) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <LuBarChart3 className="text-brand text-lg" />
                <span>Weekly Reader Traffic (Views Over Time)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Daily unique view sessions across all your published articles
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 max-w-fit">
              Past 7 Days
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={viewsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff385c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ff385c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#ff385c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#viewsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4-col: Top Performing Stories */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <LuTrendingUp className="text-brand text-lg" />
              <span>Top Stories</span>
            </h3>
            <p className="text-xs text-slate-500">Articles with the highest readership</p>
          </div>

          {topStories.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No published stories yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {topStories.map((story, idx) => (
                <div
                  key={story._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700 shadow-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {story.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="capitalize">{story.category}</span>
                        <span>•</span>
                        <span>{story.claps} claps</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-light text-brand shadow-xs">
                      <LuEye className="text-xs" />
                      <span>{story.views || 0}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions & Studio Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Submissions Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Recent Submissions
              </h2>
              <p className="text-xs text-slate-500">
                Your latest created articles and live status
              </p>
            </div>
            <Link
              to="show-blog"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
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
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <LuEye className="text-xs text-slate-400" />
                            <span>{blog.views || 0} views</span>
                          </span>
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

        {/* Right: Quick Draft & Publishing Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <LuSparkles className="text-brand" />
              <span>Publishing Tips for Fast Approval</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">1. High-Resolution Cover Image</p>
                <p className="text-slate-500 mt-0.5">
                  Choose crisp landscape photos that represent your article theme clearly.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">2. Clear Structure & Headings</p>
                <p className="text-slate-500 mt-0.5">
                  Use H2 and H3 tags, bullet points, and code snippets in the rich text
                  editor.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">3. Select Correct Category</p>
                <p className="text-slate-500 mt-0.5">
                  Categorizing properly ensures interested readers find your story
                  immediately.
                </p>
              </div>
            </div>

            <Link
              to="add-blog"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs text-brand bg-brand-light hover:bg-brand/10 transition-colors"
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
