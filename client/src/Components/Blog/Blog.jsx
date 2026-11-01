import React, { useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../Pages/Redux/Blogs/blogSlice";
import BlogCard from "../Design/BlogCard";
import { BlogGridSkeleton } from "../Loader/BlogCardSkeleton";
import { LuFileQuestion, LuSparkles, LuHash } from "react-icons/lu";

const Blog = () => {
  const { name } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isBlogLoading, Blogs = [] } = useSelector((state) => state.Blogs);

  const isTag = location.pathname.includes("/blogs/tag/");

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch, name, location.pathname]);

  const approvedBlogs = Blogs.filter((blog) => blog?.status === "approved");

  const filteredBlogs = name
    ? isTag
      ? approvedBlogs.filter(
          (b) =>
            Array.isArray(b?.tags) &&
            b.tags.some((t) => t.toLowerCase() === name.toLowerCase())
        )
      : approvedBlogs.filter(
          (b) => b?.category?.toLowerCase() === name?.toLowerCase()
        )
    : approvedBlogs;

  return (
    <section className="space-y-6">
      {/* Category or Tag Banner if filtered */}
      {name && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-subtle via-white to-white border border-brand/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-brand uppercase tracking-wider mb-1">
              {isTag ? <LuHash /> : <LuSparkles />}
              <span>{isTag ? "Selected Tag" : "Selected Category"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 capitalize">
              {isTag ? `#${name}` : name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing {filteredBlogs.length} published {filteredBlogs.length === 1 ? "story" : "stories"}
            </p>
          </div>
          <Link
            to="/blogs"
            className="text-xs font-semibold text-slate-600 hover:text-brand bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm transition-colors"
          >
            Clear Filter
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      {isBlogLoading ? (
        <BlogGridSkeleton count={6} />
      ) : filteredBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand flex items-center justify-center text-2xl mb-4">
            <LuFileQuestion />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No articles found for "{isTag ? `#${name}` : name}"
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try choosing another topic from the sidebar or clear the filter to see all stories.
          </p>
          <Link
            to="/blogs"
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-brand transition-colors"
          >
            Browse All Stories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog._id} data={blog} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Blog;
