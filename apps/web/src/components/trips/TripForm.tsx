"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { ImageUploader } from "../media/ImageUploader";
import { GalleryUploader } from "../media/GalleryUploader";

export type TripFormData = {
  title: string;
  slug: string;
  location: string;
  durationDays: number;
  difficulty: string;
  price: number;
  description: string;
  startDate: string;
  endDate: string;
  coverImageId?: string | null;
  gallery?: { id: string, thumbUrl: string }[];
  itinerary: Record<string, unknown> | unknown[];
};

type TripFormProps = {
  initialData?: Partial<TripFormData>;
  onSubmit: (data: TripFormData) => Promise<void>;
  submitting: boolean;
};

export default function TripForm({
  initialData,
  onSubmit,
  submitting,
}: TripFormProps) {
  const [form, setForm] = useState<TripFormData>({
    title: (initialData?.title as string) || "",
    slug: (initialData?.slug as string) || "",
    location: (initialData?.location as string) || "",
    durationDays: (initialData?.durationDays as number) || 1,
    difficulty: (initialData?.difficulty as string) || "Easy",
    price: (initialData?.price as number) || 0,
    description: (initialData?.description as string) || "",
    startDate: (initialData?.startDate as string) || "",
    endDate: (initialData?.endDate as string) || "",
    coverImageId: (initialData?.coverImageId as string) || null,
    gallery: (initialData?.gallery as { id: string, thumbUrl: string }[]) || [],
    itinerary: (initialData?.itinerary as Record<string, unknown>) || {},
  });

  function update<K extends keyof TripFormData>(
    key: K,
    value: TripFormData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  const labelStyle = { 
    display: 'block', 
    marginBottom: 16, 
    fontWeight: '600', 
    color: '#334155', // Slate 700
    fontSize: '14px',
    letterSpacing: '0.025em'
  };
  const inputStyle = { 
    display: 'block', 
    width: '100%', 
    padding: '12px 14px', 
    marginTop: 8, 
    borderRadius: 8, 
    border: '1px solid #e2e8f0', // Slate 200
    fontSize: '16px',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      background: '#ffffff', 
      padding: '32px', 
      borderRadius: '16px', 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 8 }}>
        <label style={labelStyle}>
          Trip Title
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            disabled={submitting}
            required
            placeholder="e.g. Magical Spiti Valley"
          />
        </label>

        <label style={labelStyle}>
          URL Slug
          <input
            style={inputStyle}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            disabled={submitting}
            required
            placeholder="magical-spiti-valley"
          />
        </label>
      </div>

      <label style={labelStyle}>
        Destinations / Location
        <input
          style={inputStyle}
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          disabled={submitting}
          required
          placeholder="e.g. Kaza, Himachal Pradesh"
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 8 }}>
        <label style={labelStyle}>
          Duration (days)
          <input
            style={inputStyle}
            type="number"
            min={1}
            value={form.durationDays}
            onChange={(e) => update("durationDays", Number(e.target.value))}
            disabled={submitting}
          />
        </label>

        <label style={labelStyle}>
          Difficulty Level
          <select
            style={inputStyle}
            value={form.difficulty}
            onChange={(e) => update("difficulty", e.target.value)}
            disabled={submitting}
          >
            <option>Easy</option>
            <option>Moderate</option>
            <option>Hard</option>
          </select>
        </label>

        <label style={labelStyle}>
          Price (₹)
          <input
            style={inputStyle}
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            disabled={submitting}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 8 }}>
        <label style={labelStyle}>
          Departure Date
          <input
            style={inputStyle}
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            disabled={submitting}
          />
        </label>

        <label style={labelStyle}>
          Return Date
          <input
            style={inputStyle}
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            disabled={submitting}
          />
        </label>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Featured Cover Image</label>
        <ImageUploader 
            onUpload={(image) => update("coverImageId", image.id)} 
            label={form.coverImageId ? "Change Cover Image" : "Upload Cover Image"}
        />
        {form.coverImageId && (
            <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Image ready to be attached
            </p>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Adventure Gallery</label>
        <p className="text-xs text-slate-500 mb-3">Add multiple photos to showcase the journey. You can reorder them to control the display sequence.</p>
        <GalleryUploader
          images={form.gallery || []}
          onChange={(imgs) => update("gallery", imgs)}
        />
      </div>

      <label style={labelStyle}>
        Adventure Highlights / Description
        <textarea
          style={{ ...inputStyle, minHeight: 160, lineHeight: '1.6' }}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          disabled={submitting}
          placeholder="Tell the story of this journey..."
        />
      </label>

      <div style={{ marginTop: 32 }}>
        <Button loading={submitting} disabled={submitting} style={{ 
          width: '100%', 
          padding: '16px', 
          fontSize: '18px', 
          borderRadius: '12px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}>
          {submitting ? "Publishing Adventure…" : (initialData?.title ? "Update Adventure" : "Launch New Trip")}
        </Button>
      </div>
    </form>
  );
}
