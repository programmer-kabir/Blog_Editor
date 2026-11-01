import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../Pages/Redux/Blogs/blogSlice";
import {
  LuSparkles,
  LuClock,
  LuHeart,
  LuArrowRight,
  LuBookmark,
} from "react-icons/lu";
import { toggleBookmark } from "../../Pages/Redux/Bookmarks/bookmarkSlice";
import useAuth from "../Hooks/useAuth";
import toast from "react-hot-toast";

const RelatedStories = ({ currentBlog }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { Blogs = [] } = useSelector((state) => state.Blogs);
  const { bookmarkedIds = [] } = useSelector((state) => state.Bookmarks || {});

  useEffect(() => {
    if (Blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, Blogs.length]);

  const relatedStories = useMemo(() => {
    if (!currentBlog?._id || Blogs.length === 0) return [];

    const currentTags = Array.isArray(currentBlog.tags)
      ? currentBlog.tags.map((t) => t.toLowerCase())
      : [];

    const candidates = Blogs.filter(
      (b) => b?.status === "approved" && b?._id !== currentBlog._id
    );

    const scored = candidates.map((blog) => {
      let score = 0;

      // 1. Same category match (+3 pts)
      if (
        blog.category &&
        currentBlog.category &&
        blog.category.toLowerCase() === currentBlog.category.toLowerCase()
      ) {
        score += 3;
      }

      // 2. Overlapping tags match (+2 pts each)
      if (Array.isArray(blog.tags)) {
        const overlap = blog.tags.filter((t) =>
          currentTags.includes(t.toLowerCase())
        );
        score += overlap.length * 2;
      }

      // 3. Same author (+1 pt)
      if (
        blog.email &&
        currentBlog.email &&
        blog.email.toLowerCase() === currentBlog.email.toLowerCase()
      ) {
        score += 1;
      }

      // Reading time helper
      const text = (blog?.content || "").replace(/<[^>]+>/g, " ").trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      const readMin = Math.max(1, Math.ceil(words / 200));

      const likesCount =
        typeof blog?.like === "object"
          ? blog?.like?.count || 0
          : Number(blog?.like) || 0;

      return {
        ...blog,
        score,
        readMin,
        likesCount,
      };
    });

    // Sort by match score descending, then likes descending
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.likesCount - aLikesFallback(a);
    });

    function aLikesFallback(item) {
      return item.likesCount || 0;
    }

    // Top matches with score > 0
    const topMatches = scored.filter((s) => s.score > 0);

    // If fewer than 3 matches, backfill with top-liked articles
    if (topMatches.length < 3) {
      const remaining = scored.filter((s) => s.score === 0);
      return [...topMatches, ...remaining].slice(0, 3);
    }

    return topMatches.slice(0, 3);
  }, [Blogs, currentBlog]);

  if (!relatedStories || relatedStories.length === 0) return null;

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
    <section className="mt-12 pt-10 border-t border-slate-150">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <LuSparkles className="text-xs" />
            <span>Recommended Reading</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            You Might Also Like
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Handpicked stories sharing similar topics and tags with this article.
          </p>
        </div>

        <Link
          to="/blogs"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark transition-colors group"
        >
          <span>More stories</span>
          <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of 3 Related Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedStories.map((story) => {
          const isSaved = bookmarkedIds.includes(story._id);
          return (
            <div
              key={story._id}
              className="group flex flex-col justify-between bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-elevated hover:border-brand/30 transition-all duration-300 overflow-hidden"
            >
              {/* Cover Image & Category */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Link to={`/blogs/details/${story._id}`}>
                  <img
                    src={story.photo}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-sm backdrop-blur-md">
                    {story.category}
                  </span>
                </div>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => handleBookmarkClick(e, story)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                    isSaved
                      ? "bg-brand text-white shadow-md"
                      : "bg-white/85 text-slate-700 hover:bg-white hover:text-brand"
                  }`}
                  title="Bookmark"
                >
                  <LuBookmark className="text-xs" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <Link to={`/blogs/details/${story._id}`}>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                      {story.title}
                    </h4>
                  </Link>

                  {/* Top Tags */}
                  {Array.isArray(story.tags) && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {story.tags.slice(0, 3).map((tag) => (
                        <Link
                          key={tag}
                          to={`/blogs/tag/${tag}`}
                          className="text-[10px] font-semibold text-slate-500 hover:text-brand bg-slate-100 hover:bg-brand-light px-2 py-0.5 rounded-md transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Author & Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">
                    {story.email?.split("@")[0] || "Author"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-brand font-semibold">
                      <LuHeart className="text-[10px] fill-brand" />
                      {story.likesCount}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                      <LuClock className="text-[10px]" /> ~{story.readMin}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedStories;

