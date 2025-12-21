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
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your adventures and stories.</p>
          </div>
          <AuthStatus />
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Blogs</h2>
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
      </div>
    </ProtectedRoute>
  );
}
