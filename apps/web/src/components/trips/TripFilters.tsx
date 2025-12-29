
"use client";

import React, { useState } from "react";
import { Filter, X, SlidersHorizontal, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Select } from "../ui/Select";
import { TripFiltersState } from "@/hooks/useTripFilters";

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

export default function TripFilters({ 
    filters, 
    setFilter, 
    clearFilters, 
    activeFilterCount,
    meta,
    totalTrips
}: TripFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
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
                   {totalTrips !== undefined ? `Found ${totalTrips} Experiences` : "Loading..."}
                 </p>
               </div>
           </div>
           
           <div className="flex items-center gap-2">
             {activeFilterCount > 0 && (
                <button 
                    onClick={clearFilters}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                    <X size={12} /> Clear
                </button>
             )}
             <button 
               onClick={() => setIsOpen(!isOpen)}
               className="md:hidden p-2 bg-[var(--input)] hover:bg-[var(--accent)] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
             >
               {isOpen ? "Hide" : "Filter"}
             </button>
           </div>
        </div>

        <div className={`flex flex-col gap-4 ${isOpen ? 'flex' : 'hidden md:flex'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                
                {/* 1. Search Bar */}
                <div className="space-y-2 group xl:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors flex gap-2 items-center">
                        <Filter size={10}/> Search Term
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search peaks, trails, or locations..."
                            value={filters.search}
                            onChange={(e) => setFilter("search", e.target.value)}
                            className="w-full h-10 bg-[var(--background)] border border-transparent rounded-lg px-4 text-xs font-bold shadow-sm outline-none focus:border-[var(--accent)] transition-all placeholder:text-muted-foreground/30"
                        />
                        {filters.search && (
                            <button onClick={() => setFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Category & Level */}
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors">Category & Level</label>
                    <div className="grid grid-cols-2 gap-2">
                         <Select 
                            value={filters.category}
                            onChange={(val) => setFilter("category", val)}
                            triggerClassName="w-full h-10 text-xs bg-[var(--background)] border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] transition-all shadow-sm"
                            options={[{ value: "", label: "All Types" }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
                        />
                         <Select 
                            value={filters.difficulty}
                            onChange={(val) => setFilter("difficulty", val)}
                            triggerClassName="w-full h-10 text-xs bg-[var(--background)] border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] transition-all shadow-sm"
                            options={[{ value: "", label: "Any Level" }, ...DIFFICULTIES.map(d => ({ value: d, label: d }))]}
                        />
                    </div>
                </div>

                {/* 3. Price Range */}
                <div className="space-y-2 group">
                    <div className="flex justify-between items-end">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors">Max Price</label>
                         <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground">₹</span>
                            <span className="text-sm font-black text-[var(--foreground)]">{filters.priceRange.toLocaleString()}</span>
                         </div>
                    </div>
                    <div className="relative h-10 bg-[var(--background)] rounded-lg border border-transparent px-3 flex items-center gap-3 shadow-sm group-hover:border-[var(--border)] transition-all">
                        <input 
                          type="range" 
                          min={meta.minPrice} 
                          max={meta.maxPrice} 
                          step="1000"
                          value={filters.priceRange}
                          onChange={(e) => setFilter("priceRange", Number(e.target.value))}
                          className="flex-1 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)] hover:accent-[var(--accent)]/80 transition-all"
                        />
                        <div className="w-px h-4 bg-[var(--border)]" />
                        <input 
                            type="number" 
                            value={filters.priceRange} 
                            onChange={(e) => setFilter("priceRange", Number(e.target.value))}
                            className="w-14 bg-transparent text-right text-[10px] font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                {/* 4. Guests & Sort */}
                <div className="space-y-2 group col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors">Guests & View</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                placeholder="Guests"
                                value={filters.capacity}
                                onChange={(e) => setFilter("capacity", e.target.value)}
                                className="w-full h-10 bg-[var(--background)] border border-transparent rounded-lg px-3 text-xs font-bold shadow-sm outline-none focus:border-[var(--accent)] transition-all placeholder:text-muted-foreground/30"
                            />
                        </div>
                        <Select 
                            value={filters.sortBy}
                            onChange={(val) => {
                                if (val === filters.sortBy) {
                                    setFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
                                } else {
                                    setFilter("sortBy", val);
                                    setFilter("sortOrder", "desc");
                                }
                            }}
                            triggerClassName="flex-[1.5] h-10 text-xs bg-[var(--background)] border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] transition-all shadow-sm"
                            options={[
                                { value: "createdAt", label: "Newly Added" },
                                { value: "price", label: "Price" },
                                { value: "startDate", label: "Soonest" },
                                { value: "title", label: "A-Z" }
                            ]}
                        />
                    </div>
                </div>
                
                {/* 5. Duration */}
                <div className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors flex gap-2 items-center">
                        <Clock size={10}/> Duration (Days)
                    </label>
                    <div className="flex items-center gap-2 bg-[var(--background)] p-1 rounded-lg shadow-sm border border-transparent group-hover:border-[var(--border)] transition-all h-10">
                        <input 
                            type="number" 
                            placeholder="Min"
                            value={filters.minDays}
                            onChange={(e) => setFilter("minDays", e.target.value)}
                            className="w-full h-full bg-transparent text-center text-xs font-bold outline-none placeholder:text-muted-foreground/30"
                        />
                        <span className="text-muted-foreground/30 font-light text-[10px]">|</span>
                        <input 
                            type="number" 
                            placeholder="Max"
                            value={filters.maxDays}
                            onChange={(e) => setFilter("maxDays", e.target.value)}
                            className="w-full h-full bg-transparent text-center text-xs font-bold outline-none placeholder:text-muted-foreground/30"
                        />
                    </div>
                </div>

                {/* 6. Dates */}
                <div className="space-y-2 group xl:col-span-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[var(--accent)] transition-colors flex gap-2 items-center">
                        <CalendarIcon size={10}/> Travel Window
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Start"
                                onFocus={(e) => e.target.type = "date"}
                                onBlur={(e) => { if(!e.target.value) e.target.type = "text"; }}
                                value={filters.startDate}
                                onChange={(e) => setFilter("startDate", e.target.value)}
                                className="w-full h-10 bg-[var(--background)] border border-transparent rounded-lg px-2 py-1 text-[10px] font-bold uppercase shadow-sm outline-none focus:border-[var(--accent)] transition-all min-w-0 placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <div className="relative flex-1">
                            <input 
                                type="text"
                                placeholder="End" 
                                onFocus={(e) => e.target.type = "date"}
                                onBlur={(e) => { if(!e.target.value) e.target.type = "text"; }}
                                value={filters.endDate}
                                onChange={(e) => setFilter("endDate", e.target.value)}
                                className="w-full h-10 bg-[var(--background)] border border-transparent rounded-lg px-2 py-1 text-[10px] font-bold uppercase shadow-sm outline-none focus:border-[var(--accent)] transition-all min-w-0 placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Mobile-only Clear button */}
            {activeFilterCount > 0 && (
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
    );
}
