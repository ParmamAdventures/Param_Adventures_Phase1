"use client";

import React, { useEffect, useState, useCallback } from "react";
import TripsGrid from "./TripsGrid";
import { TripsGridSkeleton } from "./TripsGridSkeleton";
import { apiFetch } from "../../lib/api";
import { Filter, X } from "lucide-react";
import TripFilters from "./TripFilters";
import { useTripFilters } from "@/hooks/useTripFilters";
import { useAuth } from "@/context/AuthContext";

/**
 * TripsClient - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function TripsClient() {
  const [trips, setTrips] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Metadata for boundaries
  const [meta, setMeta] = useState({
    minPrice: 0,
    maxPrice: 100000,
    minDuration: 1,
    maxDuration: 30,
  });

  // Load Metadata & Wishlist
  const [savedTripIds, setSavedTripIds] = useState<Set<string>>(new Set());
  const { user } = useAuth(); // Need auth context to check user

  useEffect(() => {
    // 1. Fetch Meta
    apiFetch("/trips/public/meta")
      .then((res) => res.json())
      .then((data) => {
        setMeta(data);
      })
      .catch(console.error);

    // 2. Fetch Wishlist (if logged in)
    if (user) {
        apiFetch("/wishlist")
            .then((res) => res.json())
            .then((data: any[]) => {
                const ids = new Set(data.map((t) => t.id));
                setSavedTripIds(ids);
            })
            .catch(console.error);
    }
  }, [user]);

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
      if (filters.priceRange < meta.maxPrice)
        params.append("maxPrice", filters.priceRange.toString());

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
      const json = await res.json();
      setTrips(json.data?.data || json.data || json);
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
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] py-20 text-center">
            <div className="mx-auto mb-4 w-fit rounded-full bg-red-500/10 p-4 text-red-500">
              <X size={32} />
            </div>
            <h3 className="mb-2 text-xl font-bold">{error}</h3>
            <p className="text-muted-foreground mb-6">
              Something went wrong while fetching adventures.
            </p>
            <button
              onClick={loadTrips}
              className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-bold text-white shadow-[var(--accent)]/20 shadow-xl transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] py-24 text-center">
            <div className="mx-auto mb-4 w-fit rounded-full bg-[var(--accent)]/10 p-4 text-[var(--accent)]">
              <Filter size={32} />
            </div>
            <h3 className="mb-2 text-2xl font-bold">No Adventures Found</h3>
            <p className="text-muted-foreground mb-8">
              Try adjusting your filters to find your next great escape.
            </p>
            <button
              onClick={clearFilters}
              className="font-bold text-[var(--accent)] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <TripsGrid trips={trips} savedTripIds={savedTripIds} />
        )}
      </div>
    </div>
  );
}
