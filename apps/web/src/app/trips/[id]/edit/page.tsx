"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PermissionRoute from "../../../../components/PermissionRoute";
import TripForm from "../../../../components/trips/TripForm";
import { apiFetch } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

export default function EditTripPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingSubmit, setSubmittingSubmit] = useState(false);
  const { user } = useAuth();
  const hasPermission = (p: string) => {
    const perms: string[] = (user as any)?.permissions || [];
    return perms.includes(p);
  };
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await apiFetch(`/trips/${id}`);
        if (!mounted) return;

        if (!res.ok) {
          setErrorStatus(res.status);
          setTrip(null);
        } else {
          const data = await res.json();
          setTrip(data);
        }
      } catch (err) {
        setErrorStatus(0);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleUpdate(data: any) {
    setSubmitting(true);
    const res = await apiFetch(`/trips/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.ok) router.push("/trips/internal");
    setSubmitting(false);
  }

  async function handleSubmitForReview() {
    if (
      !confirm("Submit this trip for review? You won’t be able to edit it.")
    ) {
      return;
    }

    setSubmittingSubmit(true);
    try {
      const res = await apiFetch(`/trips/${id}/submit`, { method: "POST" });
      if (res.ok) {
        router.push("/trips/internal");
        return;
      }

      if (res.status === 403) setErrorStatus(403);
      else if (res.status === 404) setErrorStatus(404);
      else setErrorStatus(res.status || 0);
    } catch (err) {
      setErrorStatus(0);
    } finally {
      setSubmittingSubmit(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (errorStatus === 403)
    return <p>You don't have permission to edit this trip.</p>;
  if (errorStatus === 404) return <p>Trip not found.</p>;
  if (errorStatus) return <p>Trip not found or access denied.</p>;
  if (!trip) return <p>Trip not found or access denied.</p>;
  if (trip?.status !== "DRAFT")
    return <p>This trip can no longer be edited.</p>;

  return (
    <PermissionRoute permission="trip:edit">
      <div>
        <h1>Edit Trip</h1>
        <TripForm
          initialData={trip}
          onSubmit={handleUpdate}
          submitting={submitting}
        />
        {trip.status === "DRAFT" && hasPermission("trip:submit") && (
          <div style={{ marginTop: 12 }}>
            <button onClick={handleSubmitForReview} disabled={submittingSubmit}>
              {submittingSubmit ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        )}
      </div>
    </PermissionRoute>
  );
}
