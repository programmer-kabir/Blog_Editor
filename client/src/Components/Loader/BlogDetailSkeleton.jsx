import React from "react";

export const BlogDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-pulse">
      {/* Category & Date badge shimmer */}
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer h-6 w-24 rounded-full"></div>
        <div className="skeleton-shimmer h-4 w-32 rounded"></div>
      </div>

      {/* Main Big Title Lines */}
      <div className="space-y-3">
        <div className="skeleton-shimmer h-9 w-full rounded-lg"></div>
        <div className="skeleton-shimmer h-9 w-4/5 rounded-lg"></div>
      </div>

      {/* Author Bar */}
      <div className="flex items-center gap-4 py-4 border-y border-slate-100">
        <div className="skeleton-shimmer h-12 w-12 rounded-full"></div>
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-32 rounded"></div>
          <div className="skeleton-shimmer h-3 w-48 rounded"></div>
        </div>
      </div>

      {/* Large Featured Image */}
      <div className="skeleton-shimmer h-[380px] w-full rounded-2xl"></div>

      {/* Paragraph blocks */}
      <div className="space-y-4 pt-4">
        <div className="skeleton-shimmer h-4 w-full rounded"></div>
        <div className="skeleton-shimmer h-4 w-full rounded"></div>
        <div className="skeleton-shimmer h-4 w-5/6 rounded"></div>
        <div className="skeleton-shimmer h-4 w-4/5 rounded"></div>
        <div className="skeleton-shimmer h-4 w-full rounded"></div>
      </div>
    </div>
  );
};

export default BlogDetailSkeleton;

