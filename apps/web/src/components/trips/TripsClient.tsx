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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    total: number;
  } | null>(null);

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

  const loadTrips = useCallback(
    async (pageNum = 1) => {
      // Don't clear trips if loading more, only if resetting (page 1)
      if (pageNum === 1) setTrips(null);
      setError(null);

      try {
        const params = new URLSearchParams();
        // Pagination
        params.append("page", pageNum.toString());
        params.append("limit", "10");

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
          if (pageNum === 1) setTrips([]);
          return;
        }
        const json = await res.json();

        // Handle standardized ApiResponse with pagination
        let newTrips = [];
        if (json.data && json.data.trips && Array.isArray(json.data.trips)) {
          newTrips = json.data.trips;
          if (json.data.pagination) {
            setPagination(json.data.pagination);
          }
        } else {
          // Fallback
          newTrips = json.data?.data || json.data || json;
        }

        if (pageNum === 1) {
          setTrips(newTrips);
        } else {
          setTrips((prev) => [...(prev || []), ...newTrips]);
        }
        setPage(pageNum);
      } catch (e) {
        console.error(e);
        setError("Network error");
        if (pageNum === 1) setTrips([]);
      }
    },
    [filters, meta.maxPrice],
  );

  // Debounced Filter Effect - always resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTrips(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [loadTrips]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    loadTrips(nextPage);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Bar */}
      <TripFilters
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        meta={meta}
        totalTrips={pagination?.total || trips?.length}
      />

      {/* Main Grid */}
      <div className="min-h-[400px]">
        {trips === null && page === 1 ? (
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
              onClick={() => loadTrips(1)}
              className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-bold text-white shadow-[var(--accent)]/20 shadow-xl transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        ) : trips && trips.length === 0 ? (
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
          <>
            <TripsGrid trips={trips || []} savedTripIds={savedTripIds} />

            {/* Load More Button */}
            {pagination && pagination.page < pagination.totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="rounded-full border border-black/10 bg-white px-8 py-3 font-bold text-black shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                >
                  Load More Adventures
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
