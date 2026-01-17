import React from "react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

/**
 * BlogCardSkeleton - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export function BlogCardSkeleton() {
  return (
    <Card className="space-y-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </Card>
  );
}

export default BlogCardSkeleton;
