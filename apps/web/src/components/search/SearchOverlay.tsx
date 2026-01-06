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

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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

        const [tripsData, blogsData] = await Promise.all([tripsRes.json(), blogsRes.json()]);
        
        // Handle ApiResponse wrapper: { success: true, data: [...] }
        const trips = Array.isArray(tripsData) ? tripsData : (tripsData.data || []);
        const blogs = Array.isArray(blogsData) ? blogsData : (blogsData.data || []);

        setResults({ trips: trips.slice(0, 5), blogs: blogs.slice(0, 5) });
      } catch (err) {
        console.error("Search failed:", err);
        setResults({ trips: [], blogs: [] });
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
          className="bg-background/95 fixed inset-0 z-[60] flex flex-col backdrop-blur-xl"
        >
          {/* Header */}
          <div className="border-border flex h-24 items-center gap-4 border-b px-6 md:px-12">
            <Search className="text-muted-foreground shrink-0" size={28} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search adventures, journals, locations..."
              className="placeholder:text-muted-foreground/50 flex-1 bg-transparent text-2xl font-medium outline-none md:text-3xl"
            />
            <button
              onClick={onClose}
              className="hover:bg-muted shrink-0 rounded-full p-3 transition-colors"
            >
              <X size={28} />
            </button>
            {loading && <Loader2 className="text-accent shrink-0 animate-spin" size={20} />}
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12">
            <div className="mx-auto max-w-7xl">
              {!query.trim() ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground text-lg italic">
                    Start typing to explore the world of Param...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  {/* Trip Results */}
                  <div className="space-y-6">
                    <h3 className="text-accent flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase">
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
                            className="group hover:bg-muted hover:border-border flex items-center justify-between rounded-2xl border border-transparent p-4 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-accent/10 text-accent rounded-lg p-2">
                                <MapPin size={18} />
                              </div>
                              <div>
                                <h4 className="group-hover:text-accent font-bold transition-colors">
                                  {trip.title}
                                </h4>
                                <p className="text-muted-foreground text-xs">
                                  {trip.location} • {trip.durationDays} Days
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={18}
                              className="-translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                            />
                          </Link>
                        ))
                      ) : (
                        <p className="text-muted-foreground py-4 text-sm">
                          No adventures match your search.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Blog Results */}
                  <div className="space-y-6">
                    <h3 className="text-accent flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase">
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
                            className="group hover:bg-muted hover:border-border flex items-center justify-between rounded-2xl border border-transparent p-4 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-accent/10 text-accent rounded-lg p-2">
                                <Calendar size={18} />
                              </div>
                              <div>
                                <h4 className="group-hover:text-accent font-bold transition-colors">
                                  {blog.title}
                                </h4>
                                <p className="text-muted-foreground max-w-[200px] overflow-hidden text-xs text-ellipsis whitespace-nowrap md:max-w-[300px]">
                                  {blog.excerpt || "Read more about this adventure..."}
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={18}
                              className="-translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                            />
                          </Link>
                        ))
                      ) : (
                        <p className="text-muted-foreground py-4 text-sm">
                          No stories match your search.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="border-border border-t p-6 text-center opacity-30">
            <p className="text-[10px] font-black tracking-[0.5em] uppercase">
              Param Adventures Search v1.0
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
