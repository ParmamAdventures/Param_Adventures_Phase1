"use client";

import { useEffect, useState } from "react";
import { BlogEditor } from "@/components/editor/BlogEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Spinner from "@/components/ui/Spinner";
import { ImageUploader } from "@/components/media/ImageUploader";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<Record<string, unknown> | null>(null);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
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
          setCoverImage(data.coverImage);
          setContent(data.content);
        } else {
          console.error("Failed to fetch blog");
        }
      } catch {
        console.error("Failed to load blog");
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
          coverImageId: coverImage?.id,
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
        alert(err.error?.message || err.message || "Failed to save blog");
      }
    } catch {
      console.error("Error saving blog");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={40} />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Blog</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wider uppercase opacity-70">
            Cover Image
          </label>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            {coverImage ? (
              <div className="group relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={(coverImage as { mediumUrl: string }).mediumUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <ImageUploader onUpload={setCoverImage} label="Upload Cover Image" />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wider uppercase opacity-70">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title..."
            className="h-auto p-6 text-xl font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wider uppercase opacity-70">
            Excerpt (Optional)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary for the preview card..."
            className="bg-surface focus:ring-accent/20 min-h-[100px] w-full rounded-md border p-4 text-sm transition-all focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wider uppercase opacity-70">
            Content
          </label>
          <BlogEditor
            value={content}
            onChange={(v) => setContent(v as Record<string, unknown> | null)}
          />
        </div>
      </div>

      <div className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 flex justify-center gap-4 border-t p-4 backdrop-blur-md">
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
