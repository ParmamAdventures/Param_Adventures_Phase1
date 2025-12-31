"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BlogEditor } from "@/components/editor/BlogEditor";

export default function BlogPreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      if (!id) return;
      try {
        const response = await apiFetch(`/blogs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setBlog(data);
        } else {
          console.error("Failed to fetch blog");
        }
      } catch (error) {
        console.error("Error fetching blog", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBlog();
    }
  }, [id]);

  async function action(type: "approve" | "reject") {
    try {
      const response = await apiFetch(`/blogs/${blog.id}/${type}`, { method: "POST" });
      if (response.ok) {
        router.push("/admin/blogs");
      } else {
        const err = await response.json();
        alert(err.message || `Failed to ${type} blog`);
      }
    } catch (error) {
      console.error(`Failed to ${type} blog`, error);
    }
  }

  if (loading) return <div className="p-10 text-center">Loading preview...</div>;
  if (!blog) return <div className="p-10 text-center text-red-500">Blog not found.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="text-accent text-sm hover:underline">
          &larr; Back to list
        </Link>
      </div>

      <div className="space-y-4 border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">{blog.title}</h1>
        <div className="text-muted-foreground flex items-center gap-3">
          <span className="text-foreground font-medium">
            {blog.author?.name || blog.author?.email}
          </span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span className="bg-accent/10 text-accent rounded px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
            {blog.status}
          </span>
        </div>
      </div>

      {blog.coverImage && (
        <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
          <img
            src={blog.coverImage.mediumUrl}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {blog.excerpt && (
        <p className="text-muted-foreground border-l-4 py-2 pl-4 text-xl italic">{blog.excerpt}</p>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <BlogEditor value={blog.content} readOnly />
      </div>

      <div className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 flex justify-center gap-4 border-t p-4 backdrop-blur-md">
        <Button
          variant="primary"
          onClick={() => action("approve")}
          className="bg-green-600 px-8 text-white hover:bg-green-700"
        >
          Approve Blog
        </Button>

        <Button variant="danger" onClick={() => action("reject")} className="px-8">
          Reject Blog
        </Button>
      </div>
    </div>
  );
}
