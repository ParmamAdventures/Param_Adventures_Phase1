import React from "react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

/**
 * TripCardSkeleton - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export function TripCardSkeleton() {
  return (
    <Card className="space-y-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </Card>
  );
}

export default TripCardSkeleton;
