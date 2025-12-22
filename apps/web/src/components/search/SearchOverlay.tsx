"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, Loader2, MapPin, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

interface SearchResult {
  trips: any[];
  blogs: any[];
}

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ trips: [], blogs: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults({ trips: [], blogs: [] });
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ trips: [], blogs: [] });
      setLoading(false);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const [tripsRes, blogsRes] = await Promise.all([
          apiFetch(`/trips/public?search=${encodeURIComponent(query)}`),
          apiFetch(`/blogs/public?search=${encodeURIComponent(query)}`),
        ]);

        const [trips, blogs] = await Promise.all([tripsRes.json(), blogsRes.json()]);
        setResults({ trips: trips.slice(0, 5), blogs: blogs.slice(0, 5) });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex h-24 items-center gap-4 px-6 md:px-12 border-b border-border">
            <Search className="text-muted-foreground shrink-0" size={28} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search adventures, journals, locations..."
              className="flex-1 bg-transparent text-2xl md:text-3xl font-medium outline-none placeholder:text-muted-foreground/50"
            />
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-muted transition-colors shrink-0"
            >
              <X size={28} />
            </button>
            {loading && (
              <Loader2 className="animate-spin text-accent shrink-0" size={20} />
            )}
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12">
            <div className="mx-auto max-w-7xl">
              {!query.trim() ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg italic">Start typing to explore the world of Param...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Trip Results */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                       <MapPin size={14} />
                       Adventures ({results.trips.length})
                    </h3>
                    <div className="space-y-2">
                      {results.trips.length > 0 ? (
                        results.trips.map((trip: any) => (
                          <Link
                            key={trip.id}
                            href={`/trips/${trip.slug}`}
                            onClick={onClose}
                            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-all border border-transparent hover:border-border"
                          >
                            <div className="flex items-center gap-4">
                               <div className="bg-accent/10 text-accent p-2 rounded-lg">
                                  <MapPin size={18} />
                               </div>
                               <div>
                                  <h4 className="font-bold group-hover:text-accent transition-colors">{trip.title}</h4>
                                  <p className="text-xs text-muted-foreground">{trip.location} • {trip.durationDays} Days</p>
                               </div>
                            </div>
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No adventures match your search.</p>
                      )}
                    </div>
                  </div>

                  {/* Blog Results */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                       <Calendar size={14} />
                       Journal Stories ({results.blogs.length})
                    </h3>
                    <div className="space-y-2">
                      {results.blogs.length > 0 ? (
                        results.blogs.map((blog: any) => (
                          <Link
                            key={blog.id}
                            href={`/blogs/${blog.slug}`}
                            onClick={onClose}
                            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-all border border-transparent hover:border-border"
                          >
                            <div className="flex items-center gap-4">
                               <div className="bg-accent/10 text-accent p-2 rounded-lg">
                                  <Calendar size={18} />
                               </div>
                               <div>
                                  <h4 className="font-bold group-hover:text-accent transition-colors">{blog.title}</h4>
                                  <p className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] md:max-w-[300px]">
                                    {blog.excerpt || "Read more about this adventure..."}
                                  </p>
                               </div>
                            </div>
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No stories match your search.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="p-6 text-center border-t border-border opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Param Adventures Search v1.0</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
