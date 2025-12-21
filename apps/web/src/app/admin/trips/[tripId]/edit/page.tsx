"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PermissionRoute from "../../../../../components/PermissionRoute";
import TripForm, { TripFormData } from "../../../../../components/trips/TripForm";
import { apiFetch } from "../../../../../lib/api";

export default function AdminEditTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter();
  const { tripId } = use(params);
  
  const [initialData, setInitialData] = useState<Partial<TripFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try {
        const res = await apiFetch(`/trips/${tripId}`);
        const data = await res.json();
        if (res.ok) {
          setInitialData(data);
        } else {
          setError(data?.error || "Failed to load trip data");
        }
      } catch (err) {
        console.error("Fetch trip error", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  async function handleUpdate(data: TripFormData) {
    setSubmitting(true);
    try {
      // 1. Update the trip
      const res = await apiFetch(`/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // 2. Attach new cover if coverImageId changed
        if (data.coverImageId && data.coverImageId !== initialData?.coverImageId) {
          const mediaRes = await apiFetch(`/media/trips/${tripId}/cover/attach`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageId: data.coverImageId,
            }),
          });

          if (!mediaRes.ok) {
            console.error("Cover attachment failed", await mediaRes.json().catch(() => ({})));
            alert("Trip updated, but cover image attachment failed.");
          }
        }
        router.push("/admin/trips");
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error?.message || body?.message || "Failed to update trip";
        alert(msg);
      }
    } catch (err) {
      console.error("Update trip error", err);
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading trip details…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <PermissionRoute permission="trip:edit">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1>Edit Trip</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Update the details for this adventure.</p>
        <TripForm 
          initialData={initialData || undefined} 
          onSubmit={handleUpdate} 
          submitting={submitting} 
        />
      </div>
    </PermissionRoute>
  );
}
