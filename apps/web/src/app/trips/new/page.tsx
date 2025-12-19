"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PermissionRoute from "../../../components/PermissionRoute";
import TripForm, { TripFormData } from "../../../components/trips/TripForm";
import { apiFetch } from "../../../lib/api";

export default function NewTripPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(data: TripFormData) {
    setSubmitting(true);
    try {
      const res = await apiFetch("/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/trips/internal");
      } else {
        const body = await res.json().catch(() => ({}));
        const msg =
          body?.error?.message || body?.message || "Failed to create trip";
        // show simple inline error via alert fallback (pages using TripForm can opt-in to show ErrorBlock)
        // for now use console and a transient alert to ensure visibility in dev
        console.error("Create trip failed", body);
        alert(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PermissionRoute permission="trip:create">
      <div>
        <h1>Create Trip</h1>
        <TripForm onSubmit={handleCreate} submitting={submitting} />
      </div>
    </PermissionRoute>
  );
}
