import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Pages/Redux/Users/userSlice";
import { fetchBookmarkIds, toggleBookmark } from "../../Pages/Redux/Bookmarks/bookmarkSlice";
import useAuth from "../Hooks/useAuth";
import { calculateMonthDifference } from "../DateFomate/DateFormate";
import { RiWhatsappFill } from "react-icons/ri";
import { FaFacebook, FaLinkedin, FaCheck } from "react-icons/fa";
import { LuCopy, LuHeart, LuClock, LuBookmark } from "react-icons/lu";
import toast from "react-hot-toast";

const BlogCard = ({ data, link }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { Users = [] } = useSelector((state) => state.Users);
  const { bookmarkedIds = [] } = useSelector((state) => state.Bookmarks);

  useEffect(() => {
    if (Users.length === 0) {
      dispatch(fetchUsers());
    }
    if (user?.email && bookmarkedIds.length === 0) {
      dispatch(fetchBookmarkIds(user.email));
    }
  }, [dispatch, Users.length, user?.email, bookmarkedIds.length]);

  const isBookmarked = bookmarkedIds.includes(data?._id);

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to save this story to your reading list");
      return;
    }
    dispatch(toggleBookmark({ email: user.email, blogId: data?._id }))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
      })
      .catch(() => toast.error("Failed to update bookmark"));
  };

  const blogWriter = Users.find((user) => user?.email === data?.email);
  const monthDifference = calculateMonthDifference(data?.date);
  const targetLink = link || `/blogs/details/${data?._id}`;
  const likeCount =
    typeof data?.like === "object"
      ? data?.like?.count || 0
      : typeof data?.like === "number"
      ? data?.like
      : 0;

  const handleCopyClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const copyUrl = `${window.location.origin}/blogs/details/${id}`;
    navigator.clipboard
      .writeText(copyUrl)
      .then(() => {
        setCopied(true);
        toast.success("Blog link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const handleShare = (e, platform, title, url) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = encodeURIComponent(`${window.location.origin}/blogs/details/${data?._id}`);
    const encodedTitle = encodeURIComponent(title || "Check out this blog");

    let shareUrl = "";
    if (platform === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${fullUrl}`;
    } else if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`;
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${fullUrl}`;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-brand/30 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
      <div>
        {/* Thumbnail Container */}
        <Link to={targetLink} className="relative block h-52 overflow-hidden bg-slate-100">
          <img
            alt={data?.title || "Blog cover"}
            src={data?.photo || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Floating Category Pill */}
          {data?.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-950/75 text-white backdrop-blur-md shadow-sm border border-white/10">
                {data.category}
              </span>
            </div>
          )}

          {/* Reading Time or Estimated Tag & Bookmark */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isBookmarked
                  ? "bg-brand text-white shadow-brand"
                  : "bg-white/90 text-slate-700 hover:text-brand hover:bg-white"
              }`}
              title={isBookmarked ? "Remove from bookmarks" : "Save story"}
            >
              <LuBookmark className={`text-xs ${isBookmarked ? "fill-white" : ""}`} />
            </button>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-slate-700 backdrop-blur-md shadow-sm">
              <LuClock className="text-brand" />
              <span>4 min read</span>
            </span>
          </div>
        </Link>

        {/* Card Header & Content */}
        <div className="p-5 pb-3">
          {/* Author Row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              {blogWriter?.photo ? (
                <img
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
                  src={blogWriter.photo}
                  alt={blogWriter?.name || "Author"}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-light text-brand font-bold text-xs flex items-center justify-center ring-2 ring-slate-100">
                  {(blogWriter?.name || data?.email || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {blogWriter?.name || "Editorial Creator"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {monthDifference === 0
                    ? "Published this month"
                    : `${monthDifference} month${monthDifference > 1 ? "s" : ""} ago`}
                </span>
              </div>
            </div>
          </div>

          {/* Blog Title */}
          <Link to={targetLink} className="block mt-3 focus:outline-none">
            <h2 className="text-base font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
              {data?.title}
            </h2>
          </Link>

          {/* Tags Pills */}
          {Array.isArray(data?.tags) && data.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {data.tags.slice(0, 3).map((tag, i) => (
                <Link
                  key={i}
                  to={`/blogs/tag/${tag}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-brand-light hover:text-brand text-slate-500 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Metrics & Actions */}
      <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
        {/* Social Share Icons & 1-Click Copy */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleShare(e, "whatsapp", data?.title)}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <RiWhatsappFill size={18} />
          </button>
          <button
            onClick={(e) => handleShare(e, "facebook", data?.title)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            title="Share on Facebook"
            aria-label="Share on Facebook"
          >
            <FaFacebook size={16} />
          </button>
          <button
            onClick={(e) => handleShare(e, "linkedin", data?.title)}
            className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-50 transition-colors"
            title="Share on LinkedIn"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin size={16} />
          </button>
          <button
            onClick={(e) => handleCopyClick(e, data?._id)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-brand hover:bg-slate-100 transition-colors"
            title="Copy link"
            aria-label="Copy blog link"
          >
            {copied ? (
              <FaCheck size={14} className="text-emerald-500" />
            ) : (
              <LuCopy size={16} />
            )}
          </button>
        </div>

        {/* Like Metric Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-700">
          <LuHeart className="text-brand fill-brand text-xs" />
          <span>{likeCount}</span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
