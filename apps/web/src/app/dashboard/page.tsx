"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthStatus from "../../components/AuthStatus";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Page() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await apiFetch("/blogs/my-blogs");
        if (res.ok) {
          setBlogs(await res.json());
        }
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Your Stories</h2>
            <Link href="/dashboard/blogs/new">
              <Button variant="primary">Write New Blog</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading specific adventures...</div>
          ) : blogs.length === 0 ? (
            <EmptyState
              title="No stories yet"
              description="You haven't chronicled any adventures. Start writing your first blog post today."
              actionLabel="Start Writing"
              actionLink="/dashboard/blogs/new"
              icon={
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
          ) : (
            <div className="grid gap-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                  <div>
                    <h3 className="font-bold text-lg">{blog.title || "Untitled Draft"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={blog.status} />
                    <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                      <Button variant="ghost">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
    </section>
  );
}
