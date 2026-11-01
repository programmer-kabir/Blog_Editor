import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../Pages/Redux/Blogs/blogSlice";
import { fetchUsers } from "../../Pages/Redux/Users/userSlice";
import { fetchComments } from "../../Pages/Redux/Comments/commentSlice";
import {
  fetchBookmarkIds,
  toggleBookmark,
} from "../../Pages/Redux/Bookmarks/bookmarkSlice";
import { calculateMonthDifference } from "../DateFomate/DateFormate";
import useAuth from "../Hooks/useAuth";
import { useReadingHistory } from "../Hooks/useReadingHistory";
import BlogDetailSkeleton from "../Loader/BlogDetailSkeleton";
import ShowComments from "../Dashboard/ShowComments/ShowComments";
import AudioArticlePlayer from "./AudioArticlePlayer";
import RelatedStories from "./RelatedStories";
import ReactionsSystem from "./ReactionsSystem";
import SeriesNavigator from "./SeriesNavigator";
import SEO from "../SEO/SEO";
import { getBlogSlugUrl } from "../../Utils/slugify";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LuHeart,
  LuMessageSquare,
  LuShare2,
  LuCopy,
  LuClock,
  LuCalendar,
  LuArrowLeft,
  LuCheck,
  LuX,
  LuSend,
  LuBookmark,
  LuPrinter,
  LuRotateCcw,
  LuSparkles,
  LuLayers,
  LuHash,
  LuEye,
} from "react-icons/lu";
import { RiWhatsappFill } from "react-icons/ri";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const DetailsBlog = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { history, addToHistory, clearHistory } = useReadingHistory();

  const { isBlogLoading, Blogs = [] } = useSelector((state) => state.Blogs);
  const { Comments = [] } = useSelector((state) => state.Comments);
  const { Users = [] } = useSelector((state) => state.Users);
  const { bookmarkedIds = [] } = useSelector((state) => state.Bookmarks);

  const [commentText, setCommentText] = useState("");
  const [isShareModal, setIsShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState("base"); // 'sm', 'base', 'lg', 'xl'

  useEffect(() => {
    if (Blogs.length === 0) dispatch(fetchBlogs());
    if (Users.length === 0) dispatch(fetchUsers());
    dispatch(fetchComments());
  }, [dispatch, Blogs.length, Users.length]);

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchBookmarkIds(user.email));
    }
  }, [dispatch, user?.email]);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = window.scrollY;
      const windowHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentBlog = Blogs.find((blog) => blog._id === id) || null;
  const currentComments = Comments.find((c) => c.blogId === currentBlog?._id);
  const blogWriter = Users.find((u) => u?.email === currentBlog?.email);
  const monthDifference = calculateMonthDifference(currentBlog?.date);

  // Automatically record to Reading History
  useEffect(() => {
    if (currentBlog) {
      addToHistory(currentBlog, blogWriter?.name);
    }
  }, [currentBlog?._id, blogWriter?.name]);

  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);

  // Increment view with session deduplication
  useEffect(() => {
    if (currentBlog?._id) {
      setViewsCount(currentBlog.views || 0);

      const sessionKey = `viewed_blog_${currentBlog._id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        axios
          .post(`${import.meta.env.VITE_API_URL}/blogs/${currentBlog._id}/view`)
          .then((res) => {
            if (res.data?.views) {
              setViewsCount(res.data.views);
            }
          })
          .catch((err) => console.error("Failed to record view:", err));
      }
    }
  }, [currentBlog?._id, currentBlog?.views]);

  // Synchronize address bar with clean SEO-friendly slug
  useEffect(() => {
    if (currentBlog?._id && currentBlog?.title) {
      const cleanPath = getBlogSlugUrl(currentBlog._id, currentBlog.title);
      if (window.location.pathname !== cleanPath) {
        window.history.replaceState(null, "", cleanPath);
      }
    }
  }, [currentBlog?._id, currentBlog?.title]);

  useEffect(() => {
    if (currentBlog?.like) {
      const count =
        typeof currentBlog.like === "object"
          ? currentBlog.like.count || 0
          : typeof currentBlog.like === "number"
          ? currentBlog.like
          : 0;
      setLikeCount(count);
      const likedEmails = Array.isArray(currentBlog.like?.email)
        ? currentBlog.like.email
        : [];
      setHasLiked(user?.email ? likedEmails.includes(user.email) : false);
    }
  }, [currentBlog, user]);

  const isBookmarked = currentBlog ? bookmarkedIds.includes(currentBlog._id) : false;

  const handleBookmarkToggle = () => {
    if (!user) {
      toast.error("Please sign in to save stories to your reading list");
      return;
    }
    dispatch(toggleBookmark({ email: user.email, blogId: currentBlog._id }))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
      })
      .catch(() => toast.error("Failed to update bookmark"));
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like this blog");
      return;
    }
    try {
      const updatedData = {
        id: currentBlog._id,
        email: user?.email,
      };

      // Optimistic update
      if (hasLiked) {
        setLikeCount((prev) => Math.max(0, prev - 1));
        setHasLiked(false);
      } else {
        setLikeCount((prev) => prev + 1);
        setHasLiked(true);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/blogs`,
        updatedData
      );

      if (response.status === 200) {
        toast.success(hasLiked ? "Post unliked" : "Thanks for liking!");
      }
    } catch (error) {
      toast.error("Failed to update like status");
      setLikeCount((prev) => (hasLiked ? prev + 1 : Math.max(0, prev - 1)));
      setHasLiked(!hasLiked);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to join the discussion");
      return;
    }
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const commentData = {
      blogId: currentBlog._id,
      comment: {
        name: user.displayName || user.email?.split("@")[0] || "Reader",
        image: user.photoURL || "",
        email: user.email,
        text: commentText.trim(),
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments`,
        commentData
      );
      if (response.status === 200) {
        toast.success("Comment posted!");
        setCommentText("");
        dispatch(fetchComments());
      }
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const handleCopyClick = () => {
    const copyUrl = `${window.location.origin}${getBlogSlugUrl(
      currentBlog?._id,
      currentBlog?.title
    )}`;
    navigator.clipboard
      .writeText(copyUrl)
      .then(() => {
        setCopied(true);
        toast.success("SEO article link copied!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to copy"));
  };

  const handleSocialShare = (platform) => {
    const canonicalUrl = `${window.location.origin}${getBlogSlugUrl(
      currentBlog?._id,
      currentBlog?.title
    )}`;
    const url = encodeURIComponent(canonicalUrl);
    const title = encodeURIComponent(
      currentBlog?.title || "Check out this article on BlogEditor"
    );
    let shareUrl = "";

    if (platform === "whatsapp")
      shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
    if (platform === "facebook")
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === "linkedin")
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    if (platform === "twitter")
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;

    if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handlePrint = () => {
    window.print();
  };

  const otherRecentReads = history.filter((h) => h._id !== currentBlog?._id);

  if (isBlogLoading || !currentBlog) return <BlogDetailSkeleton />;

  return (
    <>
      {/* Dynamic SEO, Open Graph & Twitter Meta Tags */}
      <SEO
        title={currentBlog.title}
        description={currentBlog.content}
        image={currentBlog.photo}
        url={getBlogSlugUrl(currentBlog._id, currentBlog.title)}
        type="article"
        author={blogWriter?.name || "Editorial Writer"}
        category={currentBlog.category}
        tags={currentBlog.tags}
        publishedTime={currentBlog.date}
      />

      {/* 1. Global Reading Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200/50">
        <div
          className="h-full bg-brand transition-all duration-75 shadow-[0_0_10px_#F50400]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Full-Width Container */}
      <div className="w-full pb-12">
        {/* Back Navigation Breadcrumb & Progress */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand transition-colors"
          >
            <LuArrowLeft className="text-sm" />
            <span>Back to all articles</span>
          </Link>

          {/* Reading Progress Percentage Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span>{Math.round(scrollProgress)}% completed</span>
          </div>
        </div>

        {/* Expansive Full-Width Layout: Sticky Actions Left + Full-Width Article Canvas */}
        <div className="flex items-start gap-4 sm:gap-6">
          
          {/* Left Sticky Action Bar (Desktop) - Aligns cleanly next to article */}
          <aside className="hidden md:flex flex-col items-center gap-2.5 p-2 bg-white border border-slate-200/90 rounded-2xl shadow-card sticky top-20 flex-shrink-0 z-10">
            <ReactionsSystem blogId={currentBlog._id} orientation="vertical" />

            <div className="w-6 h-[1px] bg-slate-200 my-0.5" />

            <button
              onClick={handleBookmarkToggle}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                isBookmarked
                  ? "bg-brand text-white shadow-brand"
                  : "text-slate-600 hover:text-brand hover:bg-slate-50"
              }`}
              title={isBookmarked ? "Remove from bookmarks" : "Save to reading list"}
            >
              <LuBookmark
                className={`text-base ${isBookmarked ? "fill-white" : ""}`}
              />
            </button>

            <div className="w-6 h-[1px] bg-slate-200 my-0.5" />

            <button
              onClick={() => handleSocialShare("twitter")}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              title="Share on X"
            >
              <FaXTwitter className="text-sm" />
            </button>

            <button
              onClick={() => handleSocialShare("linkedin")}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-sky-700 hover:bg-sky-50 transition-colors"
              title="Share on LinkedIn"
            >
              <FaLinkedin className="text-base" />
            </button>

            <button
              onClick={() => handleSocialShare("whatsapp")}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Share on WhatsApp"
            >
              <RiWhatsappFill className="text-lg" />
            </button>

            <button
              onClick={handleCopyClick}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-brand hover:bg-slate-50 transition-colors"
              title="Copy article link"
            >
              {copied ? (
                <LuCheck className="text-emerald-500 text-base" />
              ) : (
                <LuCopy className="text-base" />
              )}
            </button>

            <div className="w-6 h-[1px] bg-slate-200 my-0.5" />

            <button
              onClick={handlePrint}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Print or Save as PDF"
            >
              <LuPrinter className="text-sm" />
            </button>
          </aside>

          {/* Main Full-Width Article Card (No arbitrary max-w-4xl restriction) */}
          <article className="flex-1 min-w-0">
            {/* Article Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 lg:p-12 overflow-hidden">
          
          {/* Category Pill, Reading Time, and Font Size Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-light text-brand">
                {currentBlog.category || "General"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold" title="Total article readers">
                <LuEye className="text-brand text-sm" />
                <span>{viewsCount.toLocaleString()} {viewsCount === 1 ? "view" : "views"}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <LuClock className="text-slate-400" /> 5 min read
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <LuCalendar className="text-slate-400" />
                {monthDifference === 0
                  ? "This month"
                  : `${monthDifference} month${monthDifference > 1 ? "s" : ""} ago`}
              </span>
            </div>

            {/* Font Size Adjuster Toolbar */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
              <span className="text-[10px] uppercase text-slate-400 px-1 font-semibold">
                Text:
              </span>
              <button
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  fontSize === "sm" ? "bg-white text-brand shadow-sm font-extrabold" : "hover:text-slate-900"
                }`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("base")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  fontSize === "base" ? "bg-white text-brand shadow-sm font-extrabold" : "hover:text-slate-900"
                }`}
                title="Default text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  fontSize === "lg" ? "bg-white text-brand shadow-sm font-extrabold" : "hover:text-slate-900"
                }`}
                title="Large text"
              >
                A+
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {currentBlog.title}
          </h1>

          {/* Tags Pills */}
          {Array.isArray(currentBlog.tags) && currentBlog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
              {currentBlog.tags.map((tag, i) => (
                <Link
                  key={i}
                  to={`/blogs/tag/${tag}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-brand-light hover:text-brand text-slate-600 transition-colors"
                >
                  <LuHash className="text-slate-400 text-xs" />
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Author Info Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-150">
            <Link
              to={`/author/${encodeURIComponent(currentBlog?.email || blogWriter?.email || "")}`}
              className="flex items-center gap-3 group"
              title="View Creator's Profile"
            >
              {blogWriter?.photo ? (
                <img
                  src={blogWriter.photo}
                  alt={blogWriter?.name || "Author"}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-500 transition-all"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-brand-light text-brand font-bold text-sm flex items-center justify-center ring-2 ring-slate-100 group-hover:scale-105 transition-transform">
                  {(blogWriter?.name || currentBlog?.email || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {blogWriter?.name || "Editorial Writer"}
                  </p>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    View Profile ↗
                  </span>
                </div>
                <p className="text-xs text-slate-400">{currentBlog?.email}</p>
              </div>
            </Link>

            {/* Top Actions: Reactions, Bookmark & Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  document.getElementById("reactions-bar")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200/90 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all shadow-sm shadow-amber-200/40"
                title="View story reactions & applause"
              >
                <span>👏</span>
                <span>Reactions</span>
              </button>

              <button
                onClick={handleBookmarkToggle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isBookmarked
                    ? "bg-brand text-white border-brand shadow-sm shadow-brand/20"
                    : "bg-slate-50 text-slate-700 hover:text-brand border-slate-200"
                }`}
                title={isBookmarked ? "Remove from bookmarks" : "Save story"}
              >
                <LuBookmark
                  className={`text-sm ${isBookmarked ? "fill-white" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isBookmarked ? "Saved" : "Save"}
                </span>
              </button>

              <button
                onClick={() => setIsShareModal(true)}
                className="p-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-brand transition-colors"
                title="Share article"
              >
                <LuShare2 className="text-sm" />
              </button>
            </div>
          </div>

          {/* Web Speech Audio Player */}
          <AudioArticlePlayer
            title={currentBlog.title}
            htmlContent={currentBlog.content}
          />

          {/* Top Series Banner if article belongs to a series */}
          <SeriesNavigator currentBlog={currentBlog} position="top" />

          {/* Featured Cover Image */}
          {currentBlog.photo && (
            <div className="my-8 rounded-2xl overflow-hidden bg-slate-100 max-h-[460px]">
              <img
                src={currentBlog.photo}
                alt={currentBlog.title}
                className="w-full h-full object-cover max-h-[460px]"
              />
            </div>
          )}

          {/* Article Body Content with Dynamic Font Sizing */}
          <div
            className={`prose prose-slate max-w-none text-slate-700 leading-relaxed pt-2 [&>p]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h3]:text-lg [&>h3]:font-semibold [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 ${
              fontSize === "sm"
                ? "text-sm"
                : fontSize === "lg"
                ? "text-lg leading-loose"
                : fontSize === "xl"
                ? "text-xl leading-loose"
                : "text-base"
            }`}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(currentBlog?.content || ""),
            }}
          />

          {/* Bottom Series Navigation & Chapter Directory */}
          <SeriesNavigator currentBlog={currentBlog} position="bottom" />

          {/* Reactions & Engagement Toolbar */}
          <div id="reactions-bar" className="mt-10 pt-6 border-t border-slate-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <LuSparkles className="text-brand text-sm" />
                  <span>How did this story resonate with you?</span>
                </p>
                <ReactionsSystem blogId={currentBlog._id} orientation="horizontal" />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleBookmarkToggle}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isBookmarked
                      ? "bg-brand text-white border-brand shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:text-brand shadow-sm"
                  }`}
                >
                  <LuBookmark className={`text-sm ${isBookmarked ? "fill-white" : ""}`} />
                  <span>{isBookmarked ? "Bookmarked" : "Save Story"}</span>
                </button>

                <button
                  onClick={() => setIsShareModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-brand hover:border-brand/40 transition-colors shadow-sm"
                >
                  <LuShare2 className="text-sm" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recently Viewed Stories Section */}
          {otherRecentReads.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-150">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LuRotateCcw className="text-brand text-base" />
                  <h3 className="text-base font-bold text-slate-900">
                    Recently Read by You
                  </h3>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {otherRecentReads.slice(0, 4).map((item) => (
                  <Link
                    key={item._id}
                    to={`/blogs/details/${item._id}`}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand/40 hover:shadow-card transition-all flex items-center gap-3 group"
                  >
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <LuLayers />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand line-clamp-1">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.author}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* You Might Also Like / Related Stories */}
          <RelatedStories currentBlog={currentBlog} />

          {/* Add Comment Form */}
          <div id="comments" className="mt-10 pt-8 border-t border-slate-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <LuMessageSquare className="text-brand" />
              <span>Leave a Thought</span>
            </h3>

            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  user
                    ? "Write your comment or question here..."
                    : "Please sign in to post a comment"
                }
                disabled={!user}
                rows={3}
                className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between items-center">
                {!user && (
                  <span className="text-xs text-slate-500">
                    <Link
                      to="/signin"
                      className="text-brand font-semibold hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to publish a comment.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!user}
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand hover:bg-brand-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuSend className="text-xs" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>
          </div>

          {/* Comments Section */}
          <ShowComments
            id={currentBlog._id}
            articleAuthorEmail={currentBlog.email || blogWriter?.email}
          />

        </div>

        {/* Share Modal Dialog */}
        {isShareModal && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsShareModal(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl shadow-elevated p-6 border border-slate-150 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Share this Story</h3>
                <button
                  onClick={() => setIsShareModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-2 text-center">
                <button
                  onClick={() => handleSocialShare("twitter")}
                  className="flex flex-col items-center gap-1.5 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FaXTwitter />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600">X</span>
                </button>

                <button
                  onClick={() => handleSocialShare("linkedin")}
                  className="flex flex-col items-center gap-1.5 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FaLinkedin />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleSocialShare("whatsapp")}
                  className="flex flex-col items-center gap-1.5 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    <RiWhatsappFill />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleSocialShare("facebook")}
                  className="flex flex-col items-center gap-1.5 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FaFacebook />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600">Facebook</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2 font-medium">Or copy link</p>
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="bg-transparent text-xs text-slate-600 px-2 flex-1 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyClick}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <LuCheck size={14} className="text-emerald-400" />
                    ) : (
                      <LuCopy size={14} />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </article>
        </div>
      </div>
    </>
  );
};

export default DetailsBlog;
