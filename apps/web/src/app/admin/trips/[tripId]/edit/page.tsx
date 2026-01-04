"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PermissionRoute from "../../../../../components/PermissionRoute";
import TripForm, { TripFormData } from "../../../../../components/trips/TripForm";
import { apiFetch } from "../../../../../lib/api";
import TripAssignmentManager from "../../../../../components/admin/TripAssignmentManager";

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
        // Success! Atomic update on backend handles metadata and media relations.
        router.refresh(); // Invalidate Next.js Client Cache to show new data
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

  const refreshData = async () => {
    try {
      const res = await apiFetch(`/trips/${tripId}`);
      const data = await res.json();
      if (res.ok) {
        setInitialData(data);
      }
    } catch (err) {
      console.error("Refresh error", err);
    }
  };

  if (loading) return <p>Loading trip details…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <PermissionRoute permission="trip:edit">
      <div className="mx-auto max-w-4xl space-y-8 py-8">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Edit Trip</h1>
          <p className="text-muted-foreground pt-1">Update the details for this adventure.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TripForm
              initialData={initialData || undefined}
              onSubmit={handleUpdate}
              submitting={submitting}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-foreground text-xl font-semibold">Assignments</h2>
            <TripAssignmentManager
              tripId={tripId}
              currentManagerId={initialData?.managerId}
              currentGuides={initialData?.guides}
              onUpdate={refreshData}
            />
          </div>
        </div>
      </div>
    </PermissionRoute>
  );
}
