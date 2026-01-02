"use client";

import { useState } from "react";
import { BlogEditor } from "@/components/editor/BlogEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUploader } from "@/components/media/ImageUploader";
import { useEffect } from "react";

export default function NewBlogPage() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("modern");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const tripIdParam = searchParams?.get("tripId");
  const [tripDetails, setTripDetails] = useState<any>(null);

  useEffect(() => {
    if (!tripIdParam) {
      // Enforce: Must have a trip to write a blog (User Request)
      alert("Please select a completed adventure to write about.");
      router.push("/dashboard/bookings");
      return;
    }

    if (tripIdParam) {
      setLoading(true);
      // Verify trip exists and (optimally) valid booking
      apiFetch(`/trips/${tripIdParam}`)
        .then((res) => {
          if (!res.ok) throw new Error("Invalid Trip");
          return res.json();
        })
        .then(setTripDetails)
        .catch(() => {
          alert("Invalid Trip");
          router.push("/dashboard/bookings");
        })
        .finally(() => setLoading(false));
    }
  }, [tripIdParam, router]); // Dependency array updated

  async function handleSave(status: "DRAFT" | "SUBMIT") {
    if (!title) return alert("Title is required");

    setLoading(true);
    try {
      const response = await apiFetch("/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          theme,
          excerpt,
          content,
          coverImageId: coverImage?.id,
          tripId: tripIdParam, // Pass tripId if present
        }),
      });

      if (response.ok) {
        const blog = await response.json();
        if (status === "SUBMIT") {
          // ... rest of the function remains same ...
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
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Blog</h1>
        <p className="text-muted-foreground">Share your adventure with the world.</p>

        {tripDetails && (
          <div className="bg-accent/10 text-accent border-accent/20 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Writing about: {tripDetails.title}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wider uppercase opacity-70">
            Cover Image
          </label>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            {coverImage ? (
              <div className="group relative aspect-video overflow-hidden rounded-xl">
                <img
                  src={coverImage.mediumUrl}
                  alt="Cover"
                  className="h-full w-full object-cover"
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
          <label className="text-sm font-semibold tracking-wider uppercase opacity-70">Theme</label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {["modern", "journal", "minimal", "vibrant"].map((t) => (
              <div
                key={t}
                onClick={() => setTheme(t)}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                  theme === t
                    ? "border-accent bg-accent/5 ring-accent ring-1"
                    : "border-border hover:border-accent/50 hover:bg-muted/50"
                }`}
              >
                <span className="text-sm font-medium capitalize">{t}</span>
              </div>
            ))}
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
          <BlogEditor value={content} onChange={setContent} />
        </div>
      </div>

      <div className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 flex justify-center gap-4 border-t p-4 backdrop-blur-md">
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
