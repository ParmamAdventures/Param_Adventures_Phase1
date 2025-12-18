"use client";

import { useState } from "react";

type TripFormProps = {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  submitting: boolean;
};

export default function TripForm({
  initialData,
  onSubmit,
  submitting,
}: TripFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    location: initialData?.location || "",
    durationDays: initialData?.durationDays || 1,
    difficulty: initialData?.difficulty || "Easy",
    price: initialData?.price || 0,
    description: initialData?.description || "",
    itinerary: initialData?.itinerary || {},
  });

  function update<K extends keyof typeof form>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </label>

      <label>
        Slug
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          required
        />
      </label>

      <label>
        Location
        <input
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          required
        />
      </label>

      <label>
        Duration (days)
        <input
          type="number"
          min={1}
          value={form.durationDays}
          onChange={(e) => update("durationDays", Number(e.target.value))}
        />
      </label>

      <label>
        Difficulty
        <select
          value={form.difficulty}
          onChange={(e) => update("difficulty", e.target.value)}
        >
          <option>Easy</option>
          <option>Moderate</option>
          <option>Hard</option>
        </select>
      </label>

      <label>
        Price
        <input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => update("price", Number(e.target.value))}
        />
      </label>

      <label>
        Description
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      <button disabled={submitting}>
        {submitting ? "Saving…" : "Save Draft"}
      </button>
    </form>
  );
}
