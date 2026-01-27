"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthStatus from "../../components/AuthStatus";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Page() {
  const [blogs, setBlogs] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/blogs/my-blogs");
      if (res.ok) {
        setBlogs(await res.json());
      }
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await apiFetch(`/blogs/${id}/${action}`, { method: "POST" });
      if (res.ok) {
        loadBlogs();
      } else {
        const body = await res.json();
        alert(body.message || `Failed to ${action} blog`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Your Stories</h2>
        <Link href="/dashboard/bookings">
          <Button variant="primary">Write about an Adventure</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-10 text-center">
          Loading specific adventures...
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState
          title="No stories yet"
          description="You haven't chronicled any adventures. Start writing your first blog post today."
          actionLabel="Write about an Adventure"
          actionLink="/dashboard/bookings"
          icon={
            <svg
              className="text-muted-foreground h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
        />
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-card flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <h3 className="text-lg font-bold">{blog.title || "Untitled Draft"}</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={blog.status} />

                {blog.status === "DRAFT" && (
                  <Button variant="primary" onClick={() => handleAction(blog.id, "submit")}>
                    Submit
                  </Button>
                )}

                {blog.status === "APPROVED" && (
                  <Button
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAction(blog.id, "publish")}
                  >
                    Publish
                  </Button>
                )}

                {blog.status === "PUBLISHED" && (
                  <Link href={`/blogs/${blog.slug}`} target="_blank">
                    <Button variant="subtle">View Public</Button>
                  </Link>
                )}

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
