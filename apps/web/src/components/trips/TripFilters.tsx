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

export default function TripFilters({ 
    filters, 
    setFilter, 
    clearFilters, 
    activeFilterCount,
    meta,
    totalTrips
}: TripFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="sticky top-24 z-40 w-full transition-all duration-300">
        <div className={`bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/5 p-2 transition-all duration-300 ${isExpanded ? "rounded-3xl" : "rounded-2xl md:rounded-full"}`}>
            <div className="flex flex-col md:flex-row items-center gap-2">
                
                {/* 1. Search Section */}
                <div className="relative w-full md:w-auto md:flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--accent)] transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Where to next?"
                        value={filters.search}
                        onChange={(e) => setFilter("search", e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-transparent rounded-xl md:rounded-full border border-transparent hover:bg-black/5 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-black focus:shadow-sm focus:border-[var(--accent)]/50 outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50"
                    />
                </div>

                <div className="hidden md:block w-px h-8 bg-black/5 dark:bg-white/10" />

                {/* 2. Quick Filters (Desktop) */}
                <div className="hidden md:flex items-center gap-2">
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
                     <div className="relative group">
                        <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all cursor-pointer">
                            <Users size={14} className="text-muted-foreground" />
                            <input 
                                type="number" 
                                placeholder="Guests"
                                value={filters.capacity}
                                onChange={(e) => setFilter("capacity", e.target.value)}
                                className="w-16 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. More Filters Toggle */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`h-12 md:h-10 px-6 rounded-xl md:rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                        activeFilterCount > 0 || isExpanded
                        ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                        : "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground"
                    } w-full md:w-auto`}
                >
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-white text-[var(--accent)] text-[10px] rounded-full">
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
                        className="overflow-hidden border-t border-black/5 dark:border-white/5 mx-2"
                    >
                        <div className="pt-4 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            
                            {/* Price Range */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Max Price (₹)</label>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">0</span>
                                        <span className="font-bold">{filters.priceRange >= meta.maxPrice ? `${meta.maxPrice.toLocaleString()}+` : filters.priceRange.toLocaleString()}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min={0} 
                                        max={meta.maxPrice} 
                                        step="1000"
                                        value={filters.priceRange}
                                        onChange={(e) => setFilter("priceRange", Number(e.target.value))}
                                        className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration (Days)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        placeholder="Min"
                                        value={filters.minDays}
                                        onChange={(e) => setFilter("minDays", e.target.value)}
                                        className="w-full h-10 px-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max"
                                        value={filters.maxDays}
                                        onChange={(e) => setFilter("maxDays", e.target.value)}
                                        className="w-full h-10 px-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dates</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input 
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => setFilter("startDate", e.target.value)}
                                            className="w-full h-10 pl-9 pr-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] text-muted-foreground placeholder:text-muted-foreground/50"
                                            placeholder="dd/mm/yyyy" 
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input 
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => setFilter("endDate", e.target.value)}
                                            className="w-full h-10 pl-9 pr-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent)] text-muted-foreground placeholder:text-muted-foreground/50" 
                                            placeholder="dd/mm/yyyy"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        
                        {/* Clear Filters Footer */}
                         <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5 mt-2">
                             <div className="text-xs text-muted-foreground">
                                {totalTrips !== undefined ? `Showing ${totalTrips} experiences` : "Loading..."}
                             </div>
                             {activeFilterCount > 0 && (
                                <button 
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
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

function SelectPill({ label, value, options, onChange, icon }: { label: string, value: string, options: string[], onChange: (val: string) => void, icon?: React.ReactNode }) {
    return (
        <div className="relative group">
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
                <option value="">All</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className={`flex items-center gap-2 h-10 px-4 rounded-full border transition-all ${value ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 group-hover:border-black/5 dark:group-hover:border-white/10 text-muted-foreground'}`}>
                {icon}
                <span className="text-sm font-medium whitespace-nowrap">
                    {value || label}
                </span>
                <ChevronDown size={12} className="opacity-50" />
            </div>
        </div>
    )
}
