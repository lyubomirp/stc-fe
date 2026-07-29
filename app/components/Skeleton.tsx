import React from "react";

// A placeholder block. Deliberately square-cornered and low-contrast: the app
// has no rounded surfaces, and a skeleton brighter than the content it stands
// in for draws the eye to the wait instead of away from it.
export const Skeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => <div className={`animate-pulse bg-white/[0.06] ${className}`} />;

// Unit names vary in length, so equal-length bars read as a table rather than
// as text. Cycled instead of randomised: a random width would change on every
// render and shimmer sideways.
const NAME_WIDTHS = ["w-2/3", "w-1/2", "w-4/5", "w-3/5", "w-3/4"];

// The arsenal and the roster are both name-over-detail rows of the same fixed
// height, so one shape covers both. `rows` should be roughly what the real list
// shows, so the panel does not visibly resize when the data lands.
export const SkeletonRows: React.FC<{ rows?: number; className?: string }> = ({
  rows = 8,
  className = "",
}) => (
  <div className={`flex flex-col ${className}`} aria-hidden="true">
    {Array.from({ length: rows }, (_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 border-b border-white/[0.05] px-1 py-2.5"
      >
        <div className="min-w-0 flex-1">
          <Skeleton
            className={`h-3.5 ${NAME_WIDTHS[i % NAME_WIDTHS.length]}`}
          />
          <Skeleton className="mt-1.5 h-2 w-16" />
        </div>
        <Skeleton className="h-7 w-7 shrink-0" />
      </div>
    ))}
  </div>
);

export default Skeleton;
