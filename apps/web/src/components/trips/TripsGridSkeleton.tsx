import React from "react";
import TripCardSkeleton from "./TripCardSkeleton";

/**
 * TripsGridSkeleton - Data table component.
 * @param {Object} props - Component props
 * @param {Array} [props.columns] - Table columns
 * @param {Array} [props.data] - Table data rows
 * @param {Object} [props.pagination] - Pagination config
 * @returns {React.ReactElement} Table component
 */
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
