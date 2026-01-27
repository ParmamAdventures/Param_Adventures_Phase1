"use client";

import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Blog } from "@/types/blog";

/**
 * LatestBlogsSection - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function LatestBlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await apiFetch("/blogs/public?limit=3");
        if (res.ok) {
          const data = await res.json();
          const parsedBlogs = (data.data || (Array.isArray(data) ? data : [])) as Blog[];
          setBlogs(parsedBlogs);
        }
      } catch (err) {
        console.error("Failed to fetch latest blogs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLatest();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6 py-12">
        <h2 className="text-2xl font-semibold">Latest Stories</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface/50 h-48 animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Latest Stories</h2>
        <Link
          href="/blogs"
          className="text-accent flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 3).map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.slug}`}>
            <Card className="hover:border-accent group h-full transition-all">
              <h3 className="group-hover:text-accent font-medium transition-colors">
                {blog.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm opacity-70">
                {blog.excerpt || "Reading this story from our recent mountain journey."}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
