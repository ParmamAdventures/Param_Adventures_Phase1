import React from "react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

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
