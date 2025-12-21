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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="text-sm text-accent hover:underline">
          &larr; Back to list
        </Link>
      </div>

      <div className="border-b pb-6 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{blog.title}</h1>
        <div className="flex items-center gap-3 text-muted-foreground">
           <span className="font-medium text-foreground">{blog.author?.name || blog.author?.email}</span>
           <span>•</span>
           <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
           <span>•</span>
           <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
             {blog.status}
           </span>
        </div>
      </div>

      {blog.coverImage && (
        <div className="aspect-video relative rounded-xl overflow-hidden bg-muted">
          <img 
            src={blog.coverImage.mediumUrl} 
            alt={blog.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {blog.excerpt && (
        <p className="text-xl text-muted-foreground italic border-l-4 pl-4 py-2">
          {blog.excerpt}
        </p>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <BlogEditor value={blog.content} readOnly />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-center gap-4 z-50">
        <Button
          variant="primary"
          onClick={() => action("approve")}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Approve Blog
        </Button>

        <Button
          variant="danger"
          onClick={() => action("reject")}
          className="px-8"
        >
          Reject Blog
        </Button>
      </div>
    </div>
  );
}
