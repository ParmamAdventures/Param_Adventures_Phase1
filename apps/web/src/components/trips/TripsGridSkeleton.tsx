import React from "react";
import TripCardSkeleton from "./TripCardSkeleton";

export function TripsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default TripsGridSkeleton;
