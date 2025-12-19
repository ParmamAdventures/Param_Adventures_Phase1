import React from "react";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--surface-muted)] ${className}`}
      aria-hidden
    />
  );
}

export default Skeleton;
