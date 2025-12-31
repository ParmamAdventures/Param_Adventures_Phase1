"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface TripFiltersState {
  search: string;
  category: string;
  difficulty: string;
  capacity: string;
  sortBy: string;
  sortOrder: string;
  priceRange: number;
  minDays: string;
  maxDays: string;
  startDate: string;
  endDate: string;
}

const DEFAULT_FILTERS: TripFiltersState = {
  search: "",
  category: "",
  difficulty: "",
  capacity: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  priceRange: 100000,
  minDays: "",
  maxDays: "",
  startDate: "",
  endDate: "",
};

export function useTripFilters(maxPriceMeta: number) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL or defaults
  const [filters, setFilters] = useState<TripFiltersState>(() => ({
    search: searchParams?.get("search") || DEFAULT_FILTERS.search,
    category: searchParams?.get("category")?.toUpperCase() || DEFAULT_FILTERS.category,
    difficulty: searchParams?.get("difficulty") || DEFAULT_FILTERS.difficulty,
    capacity: searchParams?.get("capacity") || DEFAULT_FILTERS.capacity,
    sortBy: searchParams?.get("sortBy") || DEFAULT_FILTERS.sortBy,
    sortOrder: searchParams?.get("sortOrder") || DEFAULT_FILTERS.sortOrder,
    priceRange: Number(searchParams?.get("maxPrice")) || maxPriceMeta,
    minDays: searchParams?.get("minDays") || DEFAULT_FILTERS.minDays,
    maxDays: searchParams?.get("maxDays") || DEFAULT_FILTERS.maxDays,
    startDate: searchParams?.get("startDate") || DEFAULT_FILTERS.startDate,
    endDate: searchParams?.get("endDate") || DEFAULT_FILTERS.endDate,
  }));

  // Helper to update a single filter
  const setFilter = useCallback((key: keyof TripFiltersState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, priceRange: maxPriceMeta });
  }, [maxPriceMeta]);

  // Sync state to URL with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.difficulty) params.set("difficulty", filters.difficulty);
      if (filters.capacity) params.set("capacity", filters.capacity);

      if (filters.sortBy !== DEFAULT_FILTERS.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder !== DEFAULT_FILTERS.sortOrder)
        params.set("sortOrder", filters.sortOrder);

      if (filters.priceRange < maxPriceMeta) params.set("maxPrice", filters.priceRange.toString());

      if (filters.minDays) params.set("minDays", filters.minDays);
      if (filters.maxDays) params.set("maxDays", filters.maxDays);

      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500); // Debounce URL updates to avoid history spam

    return () => clearTimeout(timer);
  }, [filters, maxPriceMeta, pathname, router]);

  const activeFilterCount = Object.keys(filters).reduce((count, key) => {
    const k = key as keyof TripFiltersState;
    if (k === "priceRange") return filters.priceRange < maxPriceMeta ? count + 1 : count;
    if (k === "sortBy" || k === "sortOrder") return count; // Don't count sorting
    return filters[k] ? count + 1 : count;
  }, 0);

  return {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    setFilters, // Expose full setter if needed
  };
}
