"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Upload, Trash2, Copy, Film } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";

type Media = {
  id: string;
  originalUrl: string;
  mediumUrl?: string; // Should be optional based on schema/types
  thumbUrl: string;
  type: "IMAGE" | "VIDEO";
  mimeType: string;
  size: number;
  duration?: number;
  createdAt: string;
  usage?: {
    trips: number;
    blogs: number;
    users: number;
  };
};

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/media?type=${filter}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media);
      }
    } catch {
      showToast("Failed to load media", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    // Preliminary check
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      showToast("Only images and videos are allowed", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showToast("Upload successful", "success");
        loadMedia();
      } else {
        const err = await res.json();
        const errorMessage =
          typeof err.error === "string" ? err.error : err.error?.message || "Upload failed";
        showToast(errorMessage, "error");
      }
    } catch {
      showToast("Upload error", "error");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await apiFetch(`/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Deleted", "success");
        setMedia(media.filter((m) => m.id !== id));
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Error deleting", "error");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied!", "success");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Media <span className="text-[var(--accent)]">Library</span>
          </h1>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase opacity-60">
            Manage images and videos
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="file"
              id="media-upload"
              className="hidden"
              onChange={handleUpload}
              accept="image/*,video/mp4,video/webm"
            />
            <label htmlFor="media-upload">
              <div className="text-primary-foreground focus-visible:ring-ring inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-medium text-white shadow transition-colors hover:bg-[var(--accent)]/90 focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                {uploading ? (
                  <Spinner size={16} className="mr-2" />
                ) : (
                  <Upload size={16} className="mr-2" />
                )}
                Upload Asset
              </div>
            </label>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-1 backdrop-blur-sm">
        {(["ALL", "IMAGE", "VIDEO"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all ${
              filter === f
                ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-lg"
                : "text-muted-foreground hover:bg-[var(--border)]/20"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Spinner size={40} />
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-[40px] border-2 border-dashed border-[var(--border)] p-20 text-center opacity-50">
          <p className="text-muted-foreground font-bold tracking-widest uppercase">
            Library is empty
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--accent)] hover:shadow-[var(--accent)]/10 hover:shadow-xl"
            >
              {item.type === "VIDEO" ? (
                <div className="relative flex h-full w-full items-center justify-center bg-black">
                  <video
                    src={item.originalUrl}
                    className="pointer-events-none h-full w-full object-cover opacity-60"
                    muted
                  />
                  <Film className="absolute h-12 w-12 text-white/50" />
                  <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    VIDEO
                  </div>
                </div>
              ) : (
                <Image
                  src={item.mediumUrl || item.originalUrl}
                  alt="Asset"
                  fill
                  className="object-cover"
                />
              )}

              {/* Usage Badges */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {item.usage && item.usage.trips > 0 && (
                  <div className="rounded-full bg-blue-500/80 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md">
                    {item.usage.trips} Trips
                  </div>
                )}
                {item.usage && item.usage.blogs > 0 && (
                  <div className="rounded-full bg-orange-500/80 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md">
                    {item.usage.blogs} Blogs
                  </div>
                )}
                {item.usage && item.usage.users > 0 && (
                  <div className="rounded-full bg-indigo-500/80 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-md">
                    {item.usage.users} Users
                  </div>
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-4 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.originalUrl)}
                    className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full bg-red-500/20 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 w-full truncate text-center font-mono text-[9px] text-white/60">
                  {(item.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
