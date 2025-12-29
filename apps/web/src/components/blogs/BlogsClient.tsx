"use client";

import React, { useEffect, useState, useCallback } from "react";
import BlogCard from "./BlogCard";
import { apiFetch } from "../../lib/api";
import { Search, X, Loader2 } from "lucide-react";
import Card from "../ui/Card";

export default function BlogsClient() {
  const [blogs, setBlogs] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      
      const res = await apiFetch(`/blogs/public?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load stories");
      
      const data = await res.json();
      setBlogs(data);
    } catch (err: any) {
      setError(err.message);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBlogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadBlogs]);

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto -mt-12 mb-16 relative group">
        <div className="absolute inset-0 bg-[var(--accent)]/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-[var(--card)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-3xl p-2 shadow-2xl shadow-black/10 transition-all focus-within:ring-2 focus-within:ring-[var(--accent)]/50 focus-within:border-[var(--accent)]">
          <div className="pl-4 text-muted-foreground">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search stories, survival tips, or expeditions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-bold placeholder:text-muted-foreground/30"
          />
          {loading ? (
             <div className="pr-4 text-[var(--accent)] animate-spin">
               <Loader2 size={20} />
             </div>
          ) : search ? (
            <button onClick={() => setSearch("")} className="pr-4 text-muted-foreground hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          ) : (
            <div className="pr-4 pointer-events-none">
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-[var(--background)] px-2 py-1 rounded-lg">Enter to Search</span>
            </div>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="min-h-[400px]">
        {blogs === null ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-[var(--card)] rounded-[40px] animate-pulse border border-[var(--border)]" />
             ))}
          </div>
        ) : error ? (
           <Card className="text-center py-20 border-red-500/20 bg-red-500/5">
              <h3 className="text-xl font-bold text-red-500">Error Loading Stories</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <button onClick={loadBlogs} className="mt-6 px-8 py-3 bg-[var(--accent)] text-white rounded-2xl font-bold">Try Again</button>
           </Card>
        ) : blogs.length === 0 ? (
          <Card className="text-center py-32 border-dashed bg-[var(--surface)]/50 rounded-[40px]">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-bold">No stories found</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">
              We couldn't find any matches for "{search}". Try another keyword?
            </p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog: any, index: number) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
