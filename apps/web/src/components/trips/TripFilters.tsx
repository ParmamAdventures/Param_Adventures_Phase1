"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Calendar, Users, X, ChevronDown } from "lucide-react";
import { TripFiltersState } from "@/hooks/useTripFilters";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["TREK", "CORPORATE", "EDUCATIONAL", "SPIRITUAL"];
const DIFFICULTIES = ["Easy", "Moderate", "Hard"];

interface TripFiltersProps {
  filters: TripFiltersState;
  setFilter: (key: keyof TripFiltersState, value: any) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  meta: { minPrice: number; maxPrice: number };
  totalTrips?: number;
}

/**
 * TripFilters - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function TripFilters({
  filters,
  setFilter,
  clearFilters,
  activeFilterCount,
  meta,
  totalTrips,
}: TripFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="sticky top-24 z-40 w-full transition-all duration-300">
      <div
        className={`border border-white/20 bg-white/80 p-2 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-black/60 ${isExpanded ? "rounded-3xl" : "rounded-2xl md:rounded-full"}`}
      >
        <div className="flex flex-col items-center gap-2 md:flex-row">
          {/* 1. Search Section */}
          <div className="group relative w-full md:w-auto md:flex-1">
            <div className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 transition-colors group-focus-within:text-[var(--accent)]">
              <Search size={18} />
            </div>
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Where to next?"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="placeholder:text-muted-foreground/50 h-12 w-full rounded-xl border border-transparent bg-transparent pr-4 pl-11 text-sm font-medium transition-all outline-none hover:bg-black/5 focus:border-[var(--accent)]/50 focus:bg-white focus:shadow-sm md:rounded-full dark:hover:bg-white/5 dark:focus:bg-black"
            />
          </div>

          <div className="hidden h-8 w-px bg-black/5 md:block dark:bg-white/10" />

          {/* 2. Quick Filters (Desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Category */}
            <SelectPill
              label="Type"
              value={filters.category}
              options={CATEGORIES}
              onChange={(val) => setFilter("category", val)}
              icon={<MapPin size={14} />}
            />

            {/* Difficulty */}
            <SelectPill
              label="Level"
              value={filters.difficulty}
              options={DIFFICULTIES}
              onChange={(val) => setFilter("difficulty", val)}
              icon={<SlidersHorizontal size={14} />}
            />

            {/* Guests */}
            <div className="group relative">
              <div className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-transparent bg-transparent px-4 transition-all hover:border-black/5 hover:bg-black/5 dark:hover:border-white/10 dark:hover:bg-white/5">
                <Users size={14} className="text-muted-foreground" />
                <input
                  suppressHydrationWarning
                  type="number"
                  placeholder="Guests"
                  value={filters.capacity}
                  onChange={(e) => setFilter("capacity", e.target.value)}
                  className="placeholder:text-muted-foreground/50 w-16 bg-transparent text-sm font-medium outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. More Filters Toggle */}
          <button
            suppressHydrationWarning
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all md:h-10 md:rounded-full ${
              activeFilterCount > 0 || isExpanded
                ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-lg"
                : "text-foreground bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
            } w-full md:w-auto`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-[var(--accent)]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Advanced Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="mx-2 overflow-hidden border-t border-black/5 dark:border-white/5"
            >
              <div className="grid grid-cols-1 gap-6 pt-4 pb-2 md:grid-cols-2 lg:grid-cols-4">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Max Price (₹)
                  </label>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">0</span>
                      <span className="font-bold">
                        {filters.priceRange >= meta.maxPrice
                          ? `${meta.maxPrice.toLocaleString()}+`
                          : filters.priceRange.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={meta.maxPrice}
                      step="1000"
                      value={filters.priceRange}
                      onChange={(e) => setFilter("priceRange", Number(e.target.value))}
                      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-[var(--accent)] dark:bg-white/10"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <label className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Duration (Days)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minDays}
                      onChange={(e) => setFilter("minDays", e.target.value)}
                      className="h-10 w-full rounded-lg bg-black/5 px-3 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] dark:bg-white/5"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxDays}
                      onChange={(e) => setFilter("maxDays", e.target.value)}
                      className="h-10 w-full rounded-lg bg-black/5 px-3 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] dark:bg-white/5"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Dates
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar
                        size={14}
                        className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                      />
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilter("startDate", e.target.value)}
                        className="text-muted-foreground placeholder:text-muted-foreground/50 h-10 w-full rounded-lg bg-black/5 pr-3 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] dark:bg-white/5"
                        placeholder="dd/mm/yyyy"
                      />
                    </div>
                    <div className="relative">
                      <Calendar
                        size={14}
                        className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                      />
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilter("endDate", e.target.value)}
                        className="text-muted-foreground placeholder:text-muted-foreground/50 h-10 w-full rounded-lg bg-black/5 pr-3 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] dark:bg-white/5"
                        placeholder="dd/mm/yyyy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters Footer */}
              <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                <div className="text-muted-foreground text-xs">
                  {totalTrips !== undefined ? `Showing ${totalTrips} experiences` : "Loading..."}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    suppressHydrationWarning
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400"
                  >
                    <X size={12} /> Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SelectPill({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div
        className={`flex h-10 items-center gap-2 rounded-full border px-4 transition-all ${value ? "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]" : "text-muted-foreground border-transparent bg-transparent group-hover:border-black/5 hover:bg-black/5 dark:group-hover:border-white/10 dark:hover:bg-white/5"}`}
      >
        {icon}
        <span className="text-sm font-medium whitespace-nowrap">{value || label}</span>
        <ChevronDown size={12} className="opacity-50" />
      </div>
    </div>
  );
}
