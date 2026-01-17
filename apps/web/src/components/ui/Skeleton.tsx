import React from "react";

type SkeletonProps = {
  className?: string;
};

/**
 * Skeleton - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--surface-muted)] ${className}`}
      aria-hidden
    />
  );
}

export default Skeleton;
