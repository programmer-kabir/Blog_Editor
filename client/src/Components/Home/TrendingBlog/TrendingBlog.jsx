import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../../Pages/Redux/Blogs/blogSlice";
import { fetchComments } from "../../../Pages/Redux/Comments/commentSlice";
import {
  LuFlame,
  LuClock,
  LuHeart,
  LuMessageSquare,
  LuArrowRight,
  LuBookmark,
  LuSparkles,
} from "react-icons/lu";
import { toggleBookmark } from "../../../Pages/Redux/Bookmarks/bookmarkSlice";
import useAuth from "../../Hooks/useAuth";
import toast from "react-hot-toast";

const TrendingBlog = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { Blogs = [], isBlogLoading } = useSelector((state) => state.Blogs);
  const { Comments = [] } = useSelector((state) => state.Comments);
  const { bookmarkedIds = [] } = useSelector((state) => state.Bookmarks || {});

  useEffect(() => {
    if (Blogs.length === 0) {
      dispatch(fetchBlogs());
    }
    if (Comments.length === 0) {
      dispatch(fetchComments());
    }
  }, [dispatch, Blogs.length, Comments.length]);

  const approvedBlogs = useMemo(
    () => Blogs.filter((b) => b?.status === "approved"),
    [Blogs]
  );

  // Time-decay trending ranking algorithm
  const rankedTrending = useMemo(() => {
    if (approvedBlogs.length === 0) return [];

    const scored = approvedBlogs.map((blog) => {
      const likes =
        typeof blog?.like === "object"
          ? blog?.like?.count || 0
          : Number(blog?.like) || 0;

      const blogComments =
        Comments.find((c) => c?.blogId === blog?._id)?.comments?.length || 0;

      // Calculate days since published
      const publishedTime = blog?.date ? new Date(blog.date).getTime() : Date.now();
      const daysSince = Math.max(
        0,
        Math.floor((Date.now() - publishedTime) / (1000 * 60 * 60 * 24))
      );

      // HackerNews / Reddit style time-decay score
      // Score = ((Likes * 2) + (Comments * 3)) / ((Days + 1) ^ 1.2)
      const engagement = likes * 2 + blogComments * 3;
      const decay = Math.pow(daysSince + 1, 1.2);
      const score = (engagement + 1) / decay;

      // Reading time calculation
      const text = (blog?.content || "").replace(/<[^>]+>/g, " ").trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      const readMin = Math.max(1, Math.ceil(words / 200));

      return {
        ...blog,
        likesCount: likes,
        commentsCount: blogComments,
        readMin,
        score,
        plainExcerpt: text.slice(0, 150) + (text.length > 150 ? "..." : ""),
      };
    });

    // Sort descending by calculated score
    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [approvedBlogs, Comments]);

  if (isBlogLoading || rankedTrending.length === 0) {
    return null;
  }

  const spotlight = rankedTrending[0];
  const runnersUp = rankedTrending.slice(1, 5);

  const handleBookmarkClick = (e, blog) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to bookmark stories");
      return;
    }
    dispatch(toggleBookmark({ userEmail: user.email, blog }));
  };

  return (
    <section className="py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-bold uppercase tracking-wider mb-2">
            <LuFlame className="text-sm animate-pulse" />
            <span>Trending This Week</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Stories Buzzing in the Community</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
            Ranked dynamically by active reader appreciation, comments, and fresh weekly discussions.
          </p>
        </div>

        <Link
          to="/blogs"
          className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark transition-colors group"
        >
          <span>Explore all stories</span>
          <LuArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
        </Link>
      </div>

      {/* Main Grid: Left Spotlight #1, Right Stack #2-#5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* Left Column: Spotlight #1 Card */}
        {spotlight && (
          <div className="lg:col-span-7 flex">
            <Link
              to={`/blogs/details/${spotlight._id}`}
              className="group flex-1 relative flex flex-col justify-between bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src={spotlight.photo}
                  alt={spotlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Badge #1 */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-brand/40">
                  <LuFlame className="text-sm animate-bounce" />
                  <span>#1 Trending Story</span>
                </div>

                {/* Bookmark Shortcut */}
                <button
                  type="button"
                  onClick={(e) => handleBookmarkClick(e, spotlight)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${
                    bookmarkedIds.includes(spotlight._id)
                      ? "bg-brand text-white shadow-md"
                      : "bg-white/80 text-slate-700 hover:bg-white hover:text-brand"
                  }`}
                  title="Bookmark"
                >
                  <LuBookmark className="text-sm" />
                </button>

                {/* Overlaid Title & Meta on bottom of image for cinematic feel */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md mb-2">
                    {spotlight.category}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-red-200 transition-colors">
                    {spotlight.title}
                  </h3>
                </div>
              </div>

              {/* Bottom Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {spotlight.plainExcerpt}
                </p>

                {/* Tags */}
                {Array.isArray(spotlight.tags) && spotlight.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {spotlight.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 hover:text-brand hover:bg-brand-light transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author & Stats Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center">
                      {(spotlight.email || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {spotlight.email?.split("@")[0] || "Author"}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <LuClock className="text-[10px]" /> ~{spotlight.readMin} min read • {spotlight.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1 text-brand">
                      <LuHeart className="text-xs fill-brand" />
                      <span>{spotlight.likesCount}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <LuMessageSquare className="text-xs" />
                      <span>{spotlight.commentsCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Right Column: Stack of Runners-Up #2 - #5 */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
          {runnersUp.map((blog, index) => {
            const rankNumber = `#0${index + 2}`;
            return (
              <Link
                key={blog._id}
                to={`/blogs/details/${blog._id}`}
                className="group relative flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card hover:border-brand/30 transition-all duration-200"
              >
                {/* Stylistic Large Rank Number */}
                <div className="flex-shrink-0 w-11 text-center font-black text-2xl sm:text-3xl text-slate-300 group-hover:text-brand transition-colors">
                  {rankNumber}
                </div>

                {/* Thumbnail */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  <img
                    src={blog.photo}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/60 backdrop-blur-xs text-white">
                    <LuSparkles className="text-[9px] text-yellow-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      {blog.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h4>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[120px]">
                      {blog.email?.split("@")[0]}
                    </span>
                    <div className="flex items-center gap-2 font-medium text-slate-500">
                      <span className="flex items-center gap-0.5 text-brand">
                        <LuHeart className="text-[10px] fill-brand" />
                        <span>{blog.likesCount}</span>
                      </span>
                      <span>•</span>
                      <span>~{blog.readMin}m</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default TrendingBlog;

