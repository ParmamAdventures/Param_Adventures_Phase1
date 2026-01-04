"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PermissionRoute from "../../../../components/PermissionRoute";
import TripForm, { TripFormData } from "../../../../components/trips/TripForm";
import { apiFetch } from "../../../../lib/api";

export default function AdminNewTripPage() {
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

      const body = await res.json().catch(() => ({}));

      if (res.ok && (body.data?.id || body.id)) {
        // Success! Everything attached on backend in one transaction
        router.push("/admin/trips");
      } else {
        const msg = body?.error?.message || body?.message || "Failed to create trip";
        console.error("Create trip failed", body);
        alert(msg);
      }
    } catch (err) {
      console.error("Create trip error", err);
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PermissionRoute permission="trip:create">
      <div className="mx-auto max-w-[800px]">
        <h1>Create New Trip</h1>
        <p className="mb-6 text-[#666]">
          Fill in the details below to create a new adventure.
        </p>
        <TripForm onSubmit={handleCreate} submitting={submitting} />
      </div>
    </PermissionRoute>
  );
}
