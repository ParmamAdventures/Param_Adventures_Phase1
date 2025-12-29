"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Upload, Trash2, Copy, Film, Image as ImageIcon, Filter, Search } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/media?type=${filter}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media);
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load media", "error");
    } finally {
      setLoading(false);
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
        const errorMessage = typeof err.error === 'string' 
            ? err.error 
            : err.error?.message || "Upload failed";
        showToast(errorMessage, "error");
      }
    } catch (e) {
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
            setMedia(media.filter(m => m.id !== id));
        } else {
            showToast("Failed to delete", "error");
        }
    } catch (e) {
        showToast("Error deleting", "error");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("URL copied!", "success");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Media <span className="text-[var(--accent)]">Library</span></h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest opacity-60">Manage images and videos</p>
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
                    <div className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-[var(--accent)]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-white">
                        {uploading ? <Spinner size={16} className="mr-2" /> : <Upload size={16} className="mr-2" />}
                        Upload Asset
                    </div>
                </label>
            </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 p-1 bg-[var(--card)]/50 border border-[var(--border)] rounded-xl w-fit backdrop-blur-sm">
        {(["ALL", "IMAGE", "VIDEO"] as const).map((f) => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f 
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                    : "hover:bg-[var(--border)]/20 text-muted-foreground"
                }`}
            >
                {f}
            </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Spinner size={40} /></div>
      ) : media.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-[var(--border)] rounded-[40px] opacity-50">
            <p className="uppercase font-bold tracking-widest text-muted-foreground">Library is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative aspect-square bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] transition-all hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/10">
                {item.type === "VIDEO" ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                         <video src={item.originalUrl} className="w-full h-full object-cover opacity-60 pointer-events-none" muted />
                         <Film className="absolute text-white/50 w-12 h-12" />
                         <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                            VIDEO
                         </div>
                    </div>
                ) : (
                    <img src={item.mediumUrl || item.originalUrl} alt="Asset" className="w-full h-full object-cover" />
                )}

                {/* Usage Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {item.usage && item.usage.trips > 0 && (
                         <div className="bg-blue-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {item.usage.trips} Trips
                         </div>
                    )}
                    {item.usage && item.usage.blogs > 0 && (
                         <div className="bg-orange-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {item.usage.blogs} Blogs
                         </div>
                    )}
                    {item.usage && item.usage.users > 0 && (
                         <div className="bg-indigo-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {item.usage.users} Users
                         </div>
                    )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 backdrop-blur-[2px]">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => copyToClipboard(item.originalUrl)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Copy URL"
                        >
                            <Copy size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="text-[9px] font-mono text-white/60 truncate w-full text-center mt-2">
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
