import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookmarks,
  toggleBookmark,
} from "../../Redux/Bookmarks/bookmarkSlice";
import useAuth from "../../../Components/Hooks/useAuth";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  LuBookmark,
  LuSearch,
  LuTrash2,
  LuBookOpen,
  LuClock,
  LuArrowRight,
  LuLayers,
  LuSparkles,
} from "react-icons/lu";

const MyBookmarks = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { bookmarks = [], isLoading } = useSelector((state) => state.Bookmarks);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchBookmarks(user.email));
    }
  }, [dispatch, user?.email]);

  const handleRemoveBookmark = (blog) => {
    Swal.fire({
      title: `Remove from Reading List?`,
      text: `"${blog.title}" will be removed from your saved bookmarks.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Remove",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(toggleBookmark({ email: user.email, blogId: blog._id }))
          .unwrap()
          .then(() => {
            toast.success("Removed from bookmarks");
          })
          .catch(() => toast.error("Failed to remove bookmark"));
      }
    });
  };

  const filteredBookmarks = bookmarks.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-10 shadow-elevated border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/15 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 text-brand border border-brand/20 text-xs font-semibold">
              <LuBookmark className="text-xs" />
              <span>Personal Reading List</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Saved Bookmarks
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Articles and stories you've saved to read at your own pace. Return here anytime to continue where you left off.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-brand hover:bg-brand-dark transition-all duration-200 shadow-md hover:shadow-brand"
            >
              <LuBookOpen className="text-base" />
              <span>Explore More Stories</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved stories..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
          <LuBookmark className="text-brand" />
          <span>{bookmarks.length} saved {bookmarks.length === 1 ? "story" : "stories"}</span>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-3xl mx-auto">
            <LuBookmark />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            {searchTerm ? "No Matching Bookmarks Found" : "Your Reading List is Empty"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? `No saved articles match "${searchTerm}".`
              : "Whenever you discover an inspiring article, click the bookmark icon to save it here for later reading."}
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs text-white bg-slate-900 hover:bg-brand transition-colors shadow-sm"
          >
            <span>Browse Explore Articles</span>
            <LuArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((blog) => (
            <article
              key={blog._id}
              className="rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Cover Image */}
                <Link
                  to={`/blogs/details/${blog._id}`}
                  className="block relative h-48 overflow-hidden bg-slate-100"
                >
                  <img
                    src={blog.photo || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/75 text-white backdrop-blur-md">
                    {blog.category || "General"}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-5 pb-3 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <LuClock className="text-brand" /> 5 min read
                    </span>
                    <span>•</span>
                    <span className="truncate">{blog.email}</span>
                  </div>

                  <Link to={`/blogs/details/${blog._id}`}>
                    <h3 className="font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-2 text-base leading-snug">
                      {blog.title}
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <Link
                  to={`/blogs/details/${blog._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-dark transition-colors"
                >
                  <span>Read Story</span>
                  <LuArrowRight className="text-xs" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemoveBookmark(blog)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove from reading list"
                >
                  <LuTrash2 className="text-sm" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookmarks;

