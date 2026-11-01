import React from "react";

export const TableSkeleton = ({ rows = 6, cols = 5 }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      {/* Table Header Placeholder */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-6 py-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer h-4 rounded"
            style={{ width: `${Math.floor(60 / cols) + 10}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-between px-6 py-4"
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="flex items-center gap-3"
                style={{ width: `${Math.floor(75 / cols)}%` }}
              >
                {colIndex === 0 && (
                  <div className="skeleton-shimmer h-9 w-9 rounded-full shrink-0"></div>
                )}
                <div
                  className="skeleton-shimmer h-3.5 w-full rounded"
                  style={{
                    maxWidth: colIndex === 0 ? "70%" : "85%",
                  }}
                ></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;

