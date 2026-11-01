import React from "react";

export const BlogCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      {/* Thumbnail Shimmer */}
      <div className="skeleton-shimmer h-48 w-full"></div>

      <div className="flex flex-1 flex-col p-5 space-y-4">
        {/* Category & Date Pill */}
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-5 w-20 rounded-full"></div>
          <div className="skeleton-shimmer h-4 w-16 rounded"></div>
        </div>

        {/* Title Lines */}
        <div className="space-y-2">
          <div className="skeleton-shimmer h-5 w-full rounded"></div>
          <div className="skeleton-shimmer h-5 w-3/4 rounded"></div>
        </div>

        {/* Excerpt line */}
        <div className="skeleton-shimmer h-3 w-5/6 rounded"></div>

        {/* Author footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="skeleton-shimmer h-8 w-8 rounded-full"></div>
            <div className="skeleton-shimmer h-3.5 w-24 rounded"></div>
          </div>
          <div className="skeleton-shimmer h-4 w-12 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const BlogGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default BlogCardSkeleton;

