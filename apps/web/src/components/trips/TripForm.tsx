"use client";

import { useState } from "react";
import Button from "../ui/Button";

export type TripFormData = {
  title: string;
  slug: string;
  location: string;
  durationDays: number;
  difficulty: string;
  price: number;
  description: string;
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

      <Button loading={submitting} disabled={submitting}>
        {submitting ? "Saving…" : "Save Draft"}
      </Button>
    </form>
  );
}
