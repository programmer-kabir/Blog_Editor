import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import useAuth from "../../Components/Hooks/useAuth";
import {
  fetchBookmarkIds,
  toggleBookmark,
} from "../../Pages/Redux/Bookmarks/bookmarkSlice";
import toast from "react-hot-toast";
import {
  LuBookOpen,
  LuHeart,
  LuUsers,
  LuUserCheck,
  LuUserPlus,
  LuCalendar,
  LuShare2,
  LuGlobe,
  LuPenSquare,
  LuLayers,
  LuSparkles,
  LuClock,
  LuBookmark,
  LuArrowRight,
  LuX,
  LuCheck,
  LuSearch,
} from "react-icons/lu";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import SEO from "../../Components/SEO/SEO";

const AuthorProfile = () => {
  const { email } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [authorData, setAuthorData] = useState(null);
  const [stats, setStats] = useState({
    blogsCount: 0,
    followersCount: 0,
    followingCount: 0,
    totalReactions: 0,
  });
  const [blogs, setBlogs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'popular'

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editCover, setEditCover] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const { bookmarkedIds = [] } = useSelector((state) => state.Bookmarks);

  const isOwnProfile = user?.email && authorData?.email === user?.email;

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/authors/profile/${encodeURIComponent(
          email
        )}?viewerEmail=${encodeURIComponent(user?.email || "")}`
      );
      setAuthorData(res.data.author);
      setStats(res.data.stats);
      setBlogs(res.data.blogs || []);
      setIsFollowing(!!res.data.isFollowing);

      // Prepopulate edit modal state
      setEditBio(res.data.author?.bio || "");
      setEditCover(res.data.author?.coverImage || "");
      setEditGithub(res.data.author?.socialLinks?.github || "");
      setEditLinkedin(res.data.author?.socialLinks?.linkedin || "");
      setEditTwitter(res.data.author?.socialLinks?.twitter || "");
      setEditWebsite(res.data.author?.socialLinks?.website || "");
    } catch (err) {
      console.error("Failed to load author:", err);
      toast.error("Author profile could not be loaded");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchProfile();
    }
  }, [email, user?.email]);

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchBookmarkIds(user.email));
    }
  }, [dispatch, user?.email]);

  // Handle Follow / Unfollow
  const handleFollowToggle = async () => {
    if (!user?.email) {
      toast.error("Please sign in to follow authors");
      return;
    }
    if (isOwnProfile) {
      toast.error("You cannot follow yourself");
      return;
    }

    try {
      setIsFollowLoading(true);
      // Optimistic update
      const nextFollowState = !isFollowing;
      setIsFollowing(nextFollowState);
      setStats((prev) => ({
        ...prev,
        followersCount: Math.max(
          0,
          prev.followersCount + (nextFollowState ? 1 : -1)
        ),
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/authors/follow`,
        {
          followerEmail: user.email,
          authorEmail: authorData.email,
          followerName: user.displayName || user.name || "A Reader",
          followerImage: user.photoURL || "",
        }
      );

      setIsFollowing(res.data.isFollowing);
      setStats((prev) => ({
        ...prev,
        followersCount: res.data.followersCount,
      }));

      toast.success(
        res.data.isFollowing
          ? `You are now following ${authorData.name}!`
          : `Unfollowed ${authorData.name}`
      );
    } catch (err) {
      // Revert optimistic update
      setIsFollowing(!isFollowing);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const payload = {
        email: authorData.email,
        bio: editBio,
        coverImage: editCover,
        socialLinks: {
          github: editGithub,
          linkedin: editLinkedin,
          twitter: editTwitter,
          website: editWebsite,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/authors/profile`,
        payload
      );

      setAuthorData((prev) => ({
        ...prev,
        bio: editBio,
        coverImage: editCover,
        socialLinks: payload.socialLinks,
      }));

      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Copy Profile Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Author profile link copied to clipboard!");
  };

  // Categories list from blogs
  const categoriesList = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogs]);

  // Filtered and Sorted Blogs
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((b) => {
        const matchesCategory =
          selectedCategory === "all" ||
          b.category?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.content?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          const aReactions =
            (a.like?.count || 0) +
            (a.reactions?.claps || 0) +
            (a.reactions?.love || 0);
          const bReactions =
            (b.like?.count || 0) +
            (b.reactions?.claps || 0) +
            (b.reactions?.love || 0);
          return bReactions - aReactions;
        }
        return new Date(b.date || 0) - new Date(a.date || 0);
      });
  }, [blogs, selectedCategory, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading author profile...</p>
      </div>
    );
  }

  if (!authorData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl mb-4">
          👤
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Author Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          The requested creator profile does not exist or may have been removed.
        </p>
        <Link
          to="/blogs"
          className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-md hover:bg-indigo-700 transition-colors"
        >
          Explore All Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#FAFAFB]">
      <SEO
        title={`${authorData.name || "Creator"} - Author Profile`}
        description={
          authorData.bio ||
          `Read tech articles, engineering guides, and tutorials written by ${
            authorData.name || "this author"
          } on Blog Editor.`
        }
        image={authorData.photo || authorData.coverImage}
        url={`/author/${encodeURIComponent(email)}`}
        type="profile"
        author={authorData.name}
      />
      {/* 1. HERO COVER BANNER */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
        <img
          src={authorData.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-60 filter blur-[0.5px] scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFB] via-[#FAFAFB]/20 to-transparent"></div>

        {/* Share Button top right */}
        <button
          onClick={handleShare}
          className="absolute top-6 right-6 md:right-12 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white shadow-sm border border-white/50 text-sm font-semibold transition-all hover:scale-105"
        >
          <LuShare2 className="w-4 h-4 text-indigo-600" />
          <span>Share Profile</span>
        </button>
      </div>

      {/* 2. PROFILE HERO CONTAINER */}
      <div className="w-[94%] md:w-[90%] max-w-[1300px] mx-auto -mt-24 md:-mt-28 relative z-20">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar with Status Ring */}
          <div className="relative group -mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl p-1.5 bg-white shadow-2xl ring-4 ring-indigo-50 overflow-hidden">
              <img
                src={
                  authorData.photoURL ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                }
                alt={authorData.name}
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
                }}
              />
            </div>
            {authorData.role === "admin" && (
              <span className="absolute bottom-2 right-2 bg-rose-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white" title="Verified Platform Admin">
                🛡️
              </span>
            )}
            {authorData.role === "blogger" && (
              <span className="absolute bottom-2 right-2 bg-indigo-600 text-white p-1.5 rounded-xl shadow-md border-2 border-white" title="Verified Creator">
                ✍️
              </span>
            )}
          </div>

          {/* Bio & Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {authorData.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                    <LuSparkles className="w-3.5 h-3.5" />
                    {authorData.role === "admin"
                      ? "Platform Admin"
                      : "Verified Creator"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 font-mono">
                  {authorData.email}
                </p>
              </div>

              {/* Action Buttons: Follow or Edit Profile */}
              <div className="flex items-center justify-center gap-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold transition-all shadow-md shadow-slate-900/10 hover:shadow-indigo-500/20"
                  >
                    <LuPenSquare className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-md ${
                      isFollowing
                        ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <LuUserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <LuUserPlus className="w-4 h-4" />
                        <span>Follow Author</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Author Bio */}
            <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl font-normal">
              {authorData.bio}
            </p>

            {/* Social Links & Meta */}
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 pt-6 border-t border-slate-100">
              {authorData.socialLinks?.github && (
                <a
                  href={
                    authorData.socialLinks.github.startsWith("http")
                      ? authorData.socialLinks.github
                      : `https://github.com/${authorData.socialLinks.github}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors border border-slate-200/60"
                >
                  <FaGithub className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {authorData.socialLinks?.linkedin && (
                <a
                  href={
                    authorData.socialLinks.linkedin.startsWith("http")
                      ? authorData.socialLinks.linkedin
                      : `https://linkedin.com/in/${authorData.socialLinks.linkedin}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors border border-sky-100"
                >
                  <FaLinkedin className="w-3.5 h-3.5 text-sky-600" />
                  <span>LinkedIn</span>
                </a>
              )}
              {authorData.socialLinks?.twitter && (
                <a
                  href={
                    authorData.socialLinks.twitter.startsWith("http")
                      ? authorData.socialLinks.twitter
                      : `https://x.com/${authorData.socialLinks.twitter}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors border border-slate-200/60"
                >
                  <FaXTwitter className="w-3.5 h-3.5" />
                  <span>Twitter / X</span>
                </a>
              )}
              {authorData.socialLinks?.website && (
                <a
                  href={
                    authorData.socialLinks.website.startsWith("http")
                      ? authorData.socialLinks.website
                      : `https://${authorData.socialLinks.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors border border-indigo-100"
                >
                  <LuGlobe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Portfolio</span>
                </a>
              )}

              {authorData.joinedAt && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
                  <LuCalendar className="w-3.5 h-3.5" />
                  <span>
                    Member since{" "}
                    {new Date(authorData.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. METRIC STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              <LuBookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats.blogsCount}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Published Stories
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl">
              <LuHeart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats.totalReactions}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reactions & Claps
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <LuUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats.followersCount}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Subscribers / Followers
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <LuUserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats.followingCount}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Following
              </p>
            </div>
          </div>
        </div>

        {/* 4. AUTHOR'S PUBLISHED ARTICLES SECTION */}
        <div className="mt-12">
          {/* Section Header with Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Stories by {authorData.name}</span>
                <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredBlogs.length}
                </span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Explore insightful tutorials, articles, and analyses written by this creator.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search in author stories */}
              <div className="relative">
                <LuSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 md:w-56"
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 text-xs md:text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="newest">Latest First</option>
                <option value="popular">Most Clapped / Popular</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          {categoriesList.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All Topics ({blogs.length})
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Stories Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm mt-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                📚
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No matching stories found
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                Try modifying your search or topic filter to discover other stories.
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchTerm("");
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredBlogs.map((blog) => {
                const isBookmarked = bookmarkedIds.includes(blog._id);
                return (
                  <article
                    key={blog._id}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                  >
                    {/* Cover Thumbnail */}
                    <Link
                      to={`/blogs/details/${blog._id}`}
                      className="relative h-48 w-full overflow-hidden bg-slate-100 block"
                    >
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-indigo-700 uppercase tracking-wider shadow-sm">
                        {blog.category || "General"}
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2">
                          <LuCalendar className="w-3.5 h-3.5" />
                          <span>{blog.date || "Recent"}</span>
                          <span>•</span>
                          <LuClock className="w-3.5 h-3.5" />
                          <span>
                            {Math.max(
                              1,
                              Math.ceil(
                                (blog.content?.replace(/<[^>]*>?/gm, "").length ||
                                  500) / 1000
                              )
                            )}{" "}
                            min read
                          </span>
                        </div>

                        <Link to={`/blogs/details/${blog._id}`}>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                            {blog.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {blog.content?.replace(/<[^>]*>?/gm, "") ||
                            "Click to read this complete article..."}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                            <LuHeart className="w-3.5 h-3.5 text-rose-500" />
                            {blog.like?.count ||
                              blog.reactions?.claps ||
                              0}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Bookmark Button */}
                          <button
                            onClick={() => {
                              if (!user?.email) {
                                toast.error("Please sign in to bookmark");
                                return;
                              }
                              dispatch(
                                toggleBookmark({
                                  email: user.email,
                                  blogId: blog._id,
                                })
                              )
                                .unwrap()
                                .then((res) => {
                                  toast.success(res.message);
                                });
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isBookmarked
                                ? "bg-amber-50 text-amber-600"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                            title={
                              isBookmarked
                                ? "Remove bookmark"
                                : "Save to Reading List"
                            }
                          >
                            <LuBookmark
                              className={`w-4 h-4 ${
                                isBookmarked ? "fill-amber-500" : ""
                              }`}
                            />
                          </button>

                          {/* Read Story Link */}
                          <Link
                            to={`/blogs/details/${blog._id}`}
                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <span>Read</span>
                            <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LuPenSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Creator Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About / Bio
                </label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a short summary about your background, expertise, or passions..."
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GitHub Username / URL
                  </label>
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="e.g. torvalds"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="e.g. in/username"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Twitter / X
                  </label>
                  <input
                    type="text"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    placeholder="@username"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Website / Portfolio
                  </label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://mysite.dev"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20"
                >
                  {isSavingProfile ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <LuCheck className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorProfile;
