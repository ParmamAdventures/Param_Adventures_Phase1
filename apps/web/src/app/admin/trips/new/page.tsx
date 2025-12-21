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
      // 1. Create the trip
      const res = await apiFetch("/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Sending data as is (includes coverImageId)
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok && body.id) {
        // 2. Attach cover image if imageId exists
        if (data.coverImageId) {
          const mediaRes = await apiFetch(`/media/trips/${body.id}/cover/attach`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageId: data.coverImageId,
            }),
          });

          if (!mediaRes.ok) {
            console.error("Cover attachment failed", await mediaRes.json().catch(() => ({})));
            alert("Trip created, but cover image attachment failed.");
          }
        }
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
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1>Create New Trip</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Fill in the details below to create a new adventure.</p>
        <TripForm onSubmit={handleCreate} submitting={submitting} />
      </div>
    </PermissionRoute>
  );
}
