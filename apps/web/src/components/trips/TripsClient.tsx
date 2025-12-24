"use client";

import React, { useEffect, useState, useCallback } from "react";
import TripsGrid from "./TripsGrid";
import { TripsGridSkeleton } from "./TripsGridSkeleton";
import { apiFetch } from "../../lib/api";
import { useSearchParams } from "next/navigation";
import { Filter, X, SlidersHorizontal, Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { Select } from "../ui/Select";

const CATEGORIES = ["TREK", "CORPORATE", "EDUCATIONAL", "SPIRITUAL"];
const DIFFICULTIES = ["Easy", "Moderate", "Hard"];

export default function TripsClient() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Metadata for boundaries
  const [meta, setMeta] = useState({
    minPrice: 0,
    maxPrice: 100000,
    minDuration: 1,
    maxDuration: 30
  });

  // Filter States
  const [category, setCategory] = useState<string>(searchParams?.get("category")?.toUpperCase() || "");
  const [difficulty, setDifficulty] = useState<string>(searchParams?.get("difficulty") || "");
  
  // Price
  const [priceRange, setPriceRange] = useState<number>(Number(searchParams?.get("maxPrice")) || 100000);
  
  // Duration
  const [minDays, setMinDays] = useState<string>(searchParams?.get("minDays") || "");
  const [maxDays, setMaxDays] = useState<string>(searchParams?.get("maxDays") || "");

  // Dates
  const [startDate, setStartDate] = useState<string>(searchParams?.get("startDate") || "");
  const [endDate, setEndDate] = useState<string>(searchParams?.get("endDate") || "");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load Metadata
  useEffect(() => {
    apiFetch("/trips/public/meta")
      .then(res => res.json())
      .then(data => {
        setMeta(data);
        // Only override if not already set by URL
        if (!searchParams?.get("maxPrice")) setPriceRange(data.maxPrice);
      })
      .catch(console.error);
  }, [searchParams]);

  const loadTrips = useCallback(async () => {
    setTrips(null);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (difficulty) params.append("difficulty", difficulty);
      
      // Price
      if (priceRange < meta.maxPrice) params.append("maxPrice", priceRange.toString());

      // Duration
      if (minDays) params.append("minDays", minDays);
      if (maxDays) params.append("maxDays", maxDays);

      // Dates
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

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
  }, [category, difficulty, priceRange, minDays, maxDays, startDate, endDate, meta.maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTrips();
    }, 500); 
    return () => clearTimeout(timer);
  }, [loadTrips]);

  const clearFilters = () => {
    setCategory("");
    setDifficulty("");
    setPriceRange(meta.maxPrice);
    setMinDays("");
    setMaxDays("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = category || difficulty || priceRange < meta.maxPrice || minDays || maxDays || startDate || endDate;

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Bar */}
      {/* Filter Bar */}
      <div className="sticky top-20 z-40 flex flex-col gap-4 bg-[var(--card)]/90 backdrop-blur-xl p-4 rounded-2xl border border-[var(--border)] shadow-2xl shadow-black/10 transition-all duration-300">
        
        {/* Header & Toggle */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
               <div className="bg-gradient-to-br from-[var(--accent)] to-purple-600 text-white p-2 rounded-lg shadow-md shadow-[var(--accent)]/20">
                 <SlidersHorizontal size={16} />
               </div>
               <div>
                 <h2 className="text-xs font-black uppercase tracking-widest">Refine Adventures</h2>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium leading-none mt-0.5">
                   {trips ? `Found ${trips.length} Experiences` : "Loading..."}
                 </p>
               </div>
           </div>
           
           <div className="flex items-center gap-2">
             {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                    <X size={12} /> Clear
                </button>
             )}
             <button 
               onClick={() => setIsFilterOpen(!isFilterOpen)}
               className="md:hidden p-2 bg-[var(--input)] hover:bg-[var(--accent)] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
             >
               {isFilterOpen ? "Hide" : "Filter"}
             </button>
           </div>
        </div>

        <div className={`flex flex-col gap-4 ${isFilterOpen ? 'flex' : 'hidden md:flex'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                
                {/* 1. Category & Level */}
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors">Category & Level</label>
                    <div className="grid grid-cols-2 gap-2">
                         <Select 
                            value={category}
                            onChange={setCategory}
                            triggerClassName="w-full h-10 text-xs bg-[var(--background)] border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] transition-all shadow-sm"
                            options={[{ value: "", label: "All Types" }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
                        />
                         <Select 
                            value={difficulty}
                            onChange={setDifficulty}
                            triggerClassName="w-full h-10 text-xs bg-[var(--background)] border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] transition-all shadow-sm"
                            options={[{ value: "", label: "Any Level" }, ...DIFFICULTIES.map(d => ({ value: d, label: d }))]}
                        />
                    </div>
                </div>

                {/* 2. Price Range */}
                <div className="space-y-2 group">
                    <div className="flex justify-between items-end">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors">Max Price</label>
                         <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground">₹</span>
                            <span className="text-sm font-black text-[var(--foreground)]">{priceRange.toLocaleString()}</span>
                         </div>
                    </div>
                    <div className="relative h-10 bg-[var(--background)] rounded-lg border border-transparent px-3 flex items-center gap-3 shadow-sm group-hover:border-[var(--border)] transition-all">
                        <input 
                          type="range" 
                          min={meta.minPrice} 
                          max={meta.maxPrice} 
                          step="1000"
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                          className="flex-1 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)] hover:accent-[var(--accent)]/80 transition-all"
                        />
                        <div className="w-px h-4 bg-[var(--border)]" />
                        <input 
                            type="number" 
                            value={priceRange} 
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-14 bg-transparent text-right text-[10px] font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
                
                {/* 3. Duration */}
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors flex gap-2 items-center">
                        <Clock size={10}/> Duration
                    </label>
                    <div className="flex items-center gap-2 bg-[var(--background)] p-1 rounded-lg shadow-sm border border-transparent group-hover:border-[var(--border)] transition-all h-10">
                        <input 
                            type="number" 
                            placeholder="Min"
                            value={minDays}
                            onChange={(e) => setMinDays(e.target.value)}
                            className="w-full h-full bg-transparent text-center text-xs font-bold outline-none placeholder:text-muted-foreground/30"
                        />
                        <span className="text-muted-foreground/30 font-light text-[10px]">|</span>
                        <input 
                            type="number" 
                            placeholder="Max"
                            value={maxDays}
                            onChange={(e) => setMaxDays(e.target.value)}
                            className="w-full h-full bg-transparent text-center text-xs font-bold outline-none placeholder:text-muted-foreground/30"
                        />
                    </div>
                </div>

                {/* 4. Dates */}
                <div className="space-y-2 group">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors flex gap-2 items-center">
                        <CalendarIcon size={10}/> Dates
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="DD/MM/YYYY"
                                onFocus={(e) => e.target.type = "date"}
                                onBlur={(e) => { if(!e.target.value) e.target.type = "text"; }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-10 bg-[var(--background)] border border-transparent rounded-lg px-2 py-1 text-[10px] font-bold uppercase shadow-sm outline-none focus:border-[var(--accent)] transition-all min-w-0 placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <div className="relative flex-1">
                            <input 
                                type="text"
                                placeholder="DD/MM/YYYY" 
                                onFocus={(e) => e.target.type = "date"}
                                onBlur={(e) => { if(!e.target.value) e.target.type = "text"; }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-10 bg-[var(--background)] border border-transparent rounded-lg px-2 py-1 text-[10px] font-bold uppercase shadow-sm outline-none focus:border-[var(--accent)] transition-all min-w-0 placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Mobile-only Clear button */}
            {hasActiveFilters && (
                <div className="md:hidden pt-2 border-t border-[var(--border)]/50">
                    <button 
                        onClick={clearFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                    >
                        <X size={14} /> Clear Active Filters
                    </button>
                </div>
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
