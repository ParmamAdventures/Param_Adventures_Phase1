"use client";

import { useState } from "react";
import { BlogEditor } from "@/components/editor/BlogEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/media/ImageUploader";

export default function NewBlogPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave(status: "DRAFT" | "SUBMIT") {
    if (!title) return alert("Title is required");
    
    setLoading(true);
    try {
      const response = await apiFetch("/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          coverImageId: coverImage?.id,
        }),
      });

      if (response.ok) {
        const blog = await response.json();
        if (status === "SUBMIT") {
          const submitRes = await apiFetch(`/blogs/${blog.id}/submit`, { method: "POST" });
          if (submitRes.ok) {
            router.push("/dashboard");
          } else {
            alert("Blog saved as draft but failed to submit");
            router.push(`/blogs/${blog.id}/edit`);
          }
        } else {
          router.push("/dashboard");
        }
      } else {
        const err = await response.json();
        alert(err.message || "Failed to save blog");
      }
    } catch (error) {
      console.error("Error saving blog", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Blog</h1>
        <p className="text-muted-foreground">Share your adventure with the world.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
           <label className="text-sm font-semibold uppercase tracking-wider opacity-70">Cover Image</label>
           <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
             {coverImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden group">
                  <img src={coverImage.mediumUrl} alt="Cover" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
             ) : (
                <ImageUploader onUpload={setCoverImage} label="Upload Cover Image" />
             )}
           </div>
        </div>
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
          loading={loading}
          className="px-8"
        >
          Save Draft
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSave("SUBMIT")}
          loading={loading}
          className="px-10"
        >
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
