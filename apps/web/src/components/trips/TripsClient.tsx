
"use client";

import React, { useEffect, useState, useCallback } from "react";
import TripsGrid from "./TripsGrid";
import { TripsGridSkeleton } from "./TripsGridSkeleton";
import { apiFetch } from "../../lib/api";
import { Filter, X } from "lucide-react";
import TripFilters from "./TripFilters";
import { useTripFilters } from "@/hooks/useTripFilters";

export default function TripsClient() {
  const [trips, setTrips] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Metadata for boundaries
  const [meta, setMeta] = useState({
    minPrice: 0,
    maxPrice: 100000,
    minDuration: 1,
    maxDuration: 30
  });

  // Load Metadata
  useEffect(() => {
    apiFetch("/trips/public/meta")
      .then(res => res.json())
      .then(data => {
        setMeta(data);
      })
      .catch(console.error);
  }, []);

  // Use Custom Hook for Filter State
  const { filters, setFilter, clearFilters, activeFilterCount } = useTripFilters(meta.maxPrice);

  const loadTrips = useCallback(async () => {
    setTrips(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.capacity) params.append("capacity", filters.capacity);
      
      // Sorting
      params.append("sortBy", filters.sortBy);
      params.append("sortOrder", filters.sortOrder);
      
      // Price
      if (filters.priceRange < meta.maxPrice) params.append("maxPrice", filters.priceRange.toString());

      // Duration
      if (filters.minDays) params.append("minDays", filters.minDays);
      if (filters.maxDays) params.append("maxDays", filters.maxDays);

      // Dates
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await apiFetch(`/trips/public?${params.toString()}`);
      
      if (!res.ok) {
        setError("Failed to load trips");
        setTrips([]);
        return;
      }
      const data = await res.json();
      setTrips(data);
    } catch (e) {
      console.error(e);
      setError("Network error");
      setTrips([]);
    }
  }, [filters, meta.maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTrips();
    }, 300); 
    return () => clearTimeout(timer);
  }, [loadTrips]);

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Bar */}
      <TripFilters 
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        meta={meta}
        totalTrips={trips?.length}
      />

      {/* Main Grid */}
      <div className="min-h-[400px]">
        {trips === null ? (
          <TripsGridSkeleton />
        ) : error ? (
          <div className="text-center py-20 bg-[var(--card)] rounded-3xl border border-[var(--border)]">
             <div className="bg-red-500/10 text-red-500 p-4 rounded-full w-fit mx-auto mb-4">
                <X size={32} />
             </div>
             <h3 className="text-xl font-bold mb-2">{error}</h3>
             <p className="text-muted-foreground mb-6">Something went wrong while fetching adventures.</p>
             <button onClick={loadTrips} className="bg-[var(--accent)] text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-[var(--accent)]/20">
                Try Again
             </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24 bg-[var(--card)] rounded-3xl border border-[var(--border)]">
             <div className="bg-[var(--accent)]/10 text-[var(--accent)] p-4 rounded-full w-fit mx-auto mb-4">
                <Filter size={32} />
             </div>
             <h3 className="text-2xl font-bold mb-2">No Adventures Found</h3>
             <p className="text-muted-foreground mb-8">Try adjusting your filters to find your next great escape.</p>
             <button onClick={clearFilters} className="text-[var(--accent)] font-bold hover:underline">
                Clear all filters
             </button>
          </div>
        ) : (
          <TripsGrid trips={trips} />
        )}
      </div>
    </div>
  );
}
