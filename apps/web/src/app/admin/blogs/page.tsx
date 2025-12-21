"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await apiFetch("/blogs?status=PENDING_REVIEW");
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(id: string, type: "approve" | "reject") {
    try {
      const response = await apiFetch(`/blogs/${id}/${type}`, { method: "POST" });
      if (response.ok) {
        load();
      } else {
        const err = await response.json();
        alert(err.message || `Failed to ${type} blog`);
      }
    } catch (error) {
      console.error(`Failed to ${type} blog`, error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Pending Blogs</h1>
        <Button variant="subtle" onClick={load} loading={loading}>
          Refresh
        </Button>
      </div>

      {loading && blogs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">Loading pending blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
          No blogs pending review.
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((b) => (
            <div key={b.id} className="border rounded-lg p-5 space-y-4 bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{b.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    By <span className="font-medium text-foreground">{b.author?.name || b.author?.email}</span> • {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              {b.excerpt && <p className="text-sm line-clamp-2 text-muted-foreground">{b.excerpt}</p>}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={() => action(b.id, "approve")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>

                <Button
                  variant="danger"
                  onClick={() => action(b.id, "reject")}
                >
                  Reject
                </Button>

                <Link
                  href={`/admin/blogs/${b.id}`}
                  className="ml-auto text-sm font-medium text-accent hover:underline"
                >
                  Preview Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
