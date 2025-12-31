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
      setBlogs(data.data);
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
      <div className="group relative mx-auto -mt-12 mb-16 max-w-2xl">
        <div className="absolute inset-0 rounded-full bg-[var(--accent)]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex items-center rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 p-2 shadow-2xl shadow-black/10 backdrop-blur-2xl transition-all focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/50">
          <div className="text-muted-foreground pl-4">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search stories, survival tips, or expeditions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="placeholder:text-muted-foreground/30 flex-1 border-none bg-transparent px-4 py-3 text-sm font-bold outline-none"
          />
          {loading ? (
            <div className="animate-spin pr-4 text-[var(--accent)]">
              <Loader2 size={20} />
            </div>
          ) : search ? (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground pr-4 transition-colors hover:text-red-500"
            >
              <X size={20} />
            </button>
          ) : (
            <div className="pointer-events-none pr-4">
              <span className="text-muted-foreground hidden rounded-lg bg-[var(--background)] px-2 py-1 text-[10px] font-black tracking-widest uppercase md:block">
                Enter to Search
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="min-h-[400px]">
        {blogs === null ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-[40px] border border-[var(--border)] bg-[var(--card)]"
              />
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-500/20 bg-red-500/5 py-20 text-center">
            <h3 className="text-xl font-bold text-red-500">Error Loading Stories</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <button
              onClick={loadBlogs}
              className="mt-6 rounded-2xl bg-[var(--accent)] px-8 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </Card>
        ) : blogs.length === 0 ? (
          <Card className="rounded-[40px] border-dashed bg-[var(--surface)]/50 py-32 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)]/5 text-[var(--accent)]">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-bold">No stories found</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-xs font-medium">
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
