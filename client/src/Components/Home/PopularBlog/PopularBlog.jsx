import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import BlogCard from "../../Design/BlogCard";
import { BlogGridSkeleton } from "../../Loader/BlogCardSkeleton";
import { HiArrowRight } from "react-icons/hi2";
import { LuFlame } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../../Pages/Redux/Blogs/blogSlice";

const PopularBlog = () => {
  const dispatch = useDispatch();
  const { isBlogLoading, Blogs = [] } = useSelector((state) => state.Blogs);

  useEffect(() => {
    if (Blogs.length === 0) {
      dispatch(fetchBlogs());
    }
  }, [dispatch, Blogs.length]);

  const approvedBlogs = Blogs.filter((data) => data?.status === "approved");

  // Sort by like count descending
  const sortedBlogs = [...approvedBlogs].sort((a, b) => {
    const aLikes = typeof a?.like === "object" ? a?.like?.count || 0 : a?.like || 0;
    const bLikes = typeof b?.like === "object" ? b?.like?.count || 0 : b?.like || 0;
    return bLikes - aLikes;
  });

  // Display top 8 popular blogs
  const topBlogs = sortedBlogs.slice(0, 8);

  return (
    <section className="py-12 border-t border-slate-150">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold mb-2">
            <LuFlame className="text-xs" />
            <span>Curated & Trending</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Stories & Insights
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            Articles that sparked conversations, received the most claps, and earned reader appreciation.
          </p>
        </div>

        <Link
          to="/blogs"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors group"
        >
          <span>View all articles</span>
          <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid or Skeleton Loader */}
      {isBlogLoading ? (
        <BlogGridSkeleton count={6} />
      ) : topBlogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-card">
          <p className="text-slate-500">No approved blogs found yet. Be the first to publish a story!</p>
          <Link
            to="/dashboard/blogger/add-blog"
            className="inline-block mt-4 px-5 py-2 text-sm font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors shadow-sm"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7">
          {topBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              data={blog}
              link={`/blogs/details/${blog._id}`}
            />
          ))}
        </div>
      )}

      {/* Mobile CTA */}
      <div className="mt-8 flex justify-center sm:hidden">
        <Link
          to="/blogs"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-brand hover:bg-brand-dark shadow-sm transition-colors"
        >
          <span>View All Articles</span>
          <HiArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default PopularBlog;
