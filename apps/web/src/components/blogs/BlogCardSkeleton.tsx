import React from "react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

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
