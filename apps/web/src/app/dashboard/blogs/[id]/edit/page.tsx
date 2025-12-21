"use client";

import { useEffect, useState } from "react";
import { BlogEditor } from "@/components/editor/BlogEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch(`/blogs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title);
          setExcerpt(data.excerpt || "");
          setContent(data.content);
        } else {
             console.error("Failed to fetch blog");
        }
      } catch (error) {
        console.error("Failed to load blog", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  async function handleSave(status: "DRAFT" | "SUBMIT") {
    if (!title) return alert("Title is required");
    
    setSaving(true);
    try {
      const response = await apiFetch(`/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
        }),
      });

      if (response.ok) {
        if (status === "SUBMIT") {
          const submitRes = await apiFetch(`/blogs/${id}/submit`, { method: "POST" });
          if (submitRes.ok) {
            router.push("/dashboard");
          } else {
            alert("Blog updated but failed to submit");
          }
        } else {
          alert("Draft saved!");
        }
      } else {
        const err = await response.json();
        alert(err.message || "Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Blog</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider opacity-70">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title..."
            className="text-xl font-bold p-6 h-auto"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider opacity-70">Excerpt (Optional)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary for the preview card..."
            className="w-full min-h-[100px] p-4 rounded-md border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider opacity-70">Content</label>
          <BlogEditor value={content} onChange={setContent} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-center gap-4 z-50">
        <Button
          variant="subtle"
          onClick={() => handleSave("DRAFT")}
          loading={saving}
          className="px-8"
        >
          Update Draft
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSave("SUBMIT")}
          loading={saving}
          className="px-10"
        >
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
