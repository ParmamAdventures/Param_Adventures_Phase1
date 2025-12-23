"use client";

import React, { useEffect, useState, useCallback } from "react";
import TripsGrid from "./TripsGrid";
import { TripsGridSkeleton } from "./TripsGridSkeleton";
import { apiFetch } from "../../lib/api";
import { useSearchParams } from "next/navigation";
import { Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Select } from "../ui/Select";

const CATEGORIES = ["TREK", "CORPORATE", "EDUCATIONAL", "SPIRITUAL"];
const DIFFICULTIES = ["Easy", "Moderate", "Hard"];

export default function TripsClient() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States - Initialize from URL
  const [category, setCategory] = useState<string>(searchParams?.get("category")?.toUpperCase() || "");
  const [difficulty, setDifficulty] = useState<string>(searchParams?.get("difficulty") || "");
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams?.get("maxPrice")) || 5000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadTrips = useCallback(async () => {
    setTrips(null);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (difficulty) params.append("difficulty", difficulty);
      if (maxPrice < 5000) params.append("maxPrice", maxPrice.toString());

      const res = await apiFetch(`/trips/public?${params.toString()}`);
      
      if (!res.ok) {
        setError("Failed to load trips");
        setTrips([]);
        return;
      }
      const data = await res.json();
      setTrips(data);
    } catch (e) {
      setError("Network error");
      setTrips([]);
    }
  }, [category, difficulty, maxPrice]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const clearFilters = () => {
    setCategory("");
    setDifficulty("");
    setMaxPrice(5000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card)]/50 backdrop-blur-md p-4 rounded-3xl border border-[var(--border)] sticky top-20 z-30 shadow-xl shadow-[var(--accent)]/5">
        <div className="flex items-center gap-4">
           <div className="bg-[var(--accent)]/10 text-[var(--accent)] p-2 rounded-xl">
             <SlidersHorizontal size={20} />
           </div>
           <div>
             <h2 className="text-sm font-bold uppercase tracking-wider">Refine Adventures</h2>
             <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Showing {trips?.length || 0} Results</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          {/* Category Filter */}
          <div className="w-40">
            <Select 
                value={category}
                onChange={(val) => setCategory(val)}
                triggerClassName="bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-medium h-10"
                options={[
                    { value: "", label: "All Categories" },
                    ...CATEGORIES.map(c => ({ value: c, label: c }))
                ]}
            />
          </div>

          {/* Difficulty Filter */}
          <div className="w-40">
             <Select 
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                triggerClassName="bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-medium h-10"
                options={[
                    { value: "", label: "Any Difficulty" },
                    ...DIFFICULTIES.map(d => ({ value: d, label: d }))
                ]}
             />
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-3 bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2">
            <span className="text-xs font-bold text-muted-foreground">Up to</span>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <span className="text-sm font-bold text-[var(--accent)]">₹{maxPrice}</span>
          </div>

          {(category || difficulty || maxPrice < 5000) && (
            <button 
              onClick={clearFilters}
              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              title="Clear Filters"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

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
