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
    const res = await apiFetch("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/trips/internal");
    }
    setSubmitting(false);
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
