"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  ctaLink?: string;
  order: number;
}

interface SiteConfig {
  [key: string]: string;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "config">("hero");

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage homepage content and site settings.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "hero" ? "primary" : "subtle"}
            onClick={() => setActiveTab("hero")}
          >
            Hero Slides
          </Button>
          <Button
            variant={activeTab === "config" ? "primary" : "subtle"}
            onClick={() => setActiveTab("config")}
          >
            Site Settings
          </Button>
        </div>
      </div>

      {activeTab === "hero" ? <HeroSlidesEditor /> : <SiteConfigEditor />}
    </div>
  );
}

function HeroSlidesEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/content/hero-slides`,
        );
        if (res.ok) {
          const data = await res.json();
          setSlides(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  async function handleSave(slide: HeroSlide) {
    setSaving(slide.id);
    try {
      await apiFetch(`/content/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: slide.title,
          subtitle: slide.subtitle,
          videoUrl: slide.videoUrl,
          ctaLink: slide.ctaLink,
        }),
      });
      alert("Saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    } finally {
      setSaving(null);
    }
  }

  function handleChange(id: string, field: keyof HeroSlide, value: string) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  if (loading) return <div>Loading slides...</div>;

  return (
    <div className="animate-in fade-in space-y-6">
      {slides.map((slide, index) => (
        <div key={slide.id} className="bg-card border-border space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Slide {index + 1}: {slide.title}
            </h3>
            <span className="text-muted-foreground text-xs">ID: {slide.id}</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                className="bg-background w-full rounded border p-2"
                value={slide.title}
                onChange={(e) => handleChange(slide.id, "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtitle</label>
              <input
                className="bg-background w-full rounded border p-2"
                value={slide.subtitle || ""}
                onChange={(e) => handleChange(slide.id, "subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Video URL (mp4/webm)</label>
              <div className="text-muted-foreground mb-1 text-[10px]">
                Copy the URL from the{" "}
                <a href="/admin/media" className="text-primary underline">
                  Media Library
                </a>{" "}
                and paste it here.
              </div>
              <input
                className="bg-background w-full rounded border p-2"
                value={slide.videoUrl}
                placeholder="https://..."
                onChange={(e) => handleChange(slide.id, "videoUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Link</label>
              <input
                className="bg-background w-full rounded border p-2"
                value={slide.ctaLink || ""}
                onChange={(e) => handleChange(slide.id, "ctaLink", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={() => handleSave(slide)}
              disabled={saving === slide.id}
            >
              {saving === slide.id ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SiteConfigEditor() {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await apiFetch("/content/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  async function handleUpdate(key: string) {
    setSaving(key);
    try {
      await apiFetch("/content/config", {
        method: "PUT",
        body: JSON.stringify({ key, value: config[key] }),
      });
      alert("Updated successfully");
    } catch (e) {
      alert("Failed to update");
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div>Loading settings...</div>;

  const definitions = [
    { key: "auth_login_image", label: "Login Page Image URL" },
    { key: "auth_signup_image", label: "Signup Page Image URL" },
  ];

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-card border-border space-y-6 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Authentication Branding</h3>
        <p className="text-muted-foreground text-sm">
          Update the background images for the login and signup pages.
        </p>

        {definitions.map((def) => (
          <div key={def.key} className="space-y-2">
            <label className="text-sm font-medium">{def.label}</label>
            <div className="flex gap-2">
              <input
                className="bg-background flex-1 rounded border p-2"
                value={config[def.key] || ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, [def.key]: e.target.value }))}
                placeholder="https://..."
              />
              <Button
                className="h-auto px-3 py-1 text-xs"
                onClick={() => handleUpdate(def.key)}
                disabled={saving === def.key}
              >
                {saving === def.key ? "Saving..." : "Update"}
              </Button>
            </div>
            {config[def.key] && (
              <div className="mt-2 h-32 w-48 overflow-hidden rounded border">
                <img src={config[def.key]} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
