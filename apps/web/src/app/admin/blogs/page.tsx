"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import BlogListTable from "../../../components/admin/BlogListTable";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(
    id: string,
    type: "submit" | "approve" | "reject" | "publish" | "archive",
  ) {
    if (!confirm(`Are you sure you want to ${type} this blog?`)) return;

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
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-foreground bg-clip-text text-4xl font-extrabold tracking-tight">
            Editorial Queue
          </h1>
          <p className="text-muted-foreground text-lg">
            Review and approve user stories awaiting publication.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="subtle" onClick={load} loading={loading} className="rounded-full px-6">
            Refresh Queue
          </Button>
        </div>
      </div>

      <BlogListTable blogs={blogs} loading={loading} onAction={handleAction} onRefresh={load} />
    </div>
  );
}
