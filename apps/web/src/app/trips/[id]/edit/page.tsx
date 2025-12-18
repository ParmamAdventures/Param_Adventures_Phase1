"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TripStatusBadge from "../../../../components/trips/TripStatusBadge";
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

  async function handleApprove() {
    if (!confirm("Approve this trip?")) return;

    try {
      const res = await apiFetch(`/trips/${id}/approve`, { method: "POST" });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 403) setErrorStatus(403);
    } catch (err) {
      setErrorStatus(0);
    }
  }

  async function handlePublish() {
    if (!confirm("Publish this trip publicly?")) return;

    try {
      const res = await apiFetch(`/trips/${id}/publish`, { method: "POST" });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 403) setErrorStatus(403);
    } catch (err) {
      setErrorStatus(0);
    }
  }

  async function handleArchive() {
    if (!confirm("Archive this trip?")) return;

    try {
      const res = await apiFetch(`/trips/${id}/archive`, { method: "POST" });
      if (res.ok) {
        router.push("/trips/internal");
        return;
      }
      if (res.status === 403) setErrorStatus(403);
    } catch (err) {
      setErrorStatus(0);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (errorStatus === 403)
    return <p>You don't have permission to edit this trip.</p>;
  if (errorStatus === 404) return <p>Trip not found.</p>;
  if (errorStatus) return <p>Trip not found or access denied.</p>;
  if (!trip) return <p>Trip not found or access denied.</p>;

  const perms: string[] = (user as any)?.permissions || [];
  const canEdit = perms.includes("trip:edit");
  const canApprove = perms.includes("trip:approve");
  const canPublish = perms.includes("trip:publish");
  const canArchive = perms.includes("trip:archive");

  const canAccess =
    canEdit ||
    canApprove ||
    canPublish ||
    canArchive ||
    perms.includes("trip:view:internal");

  if (!canAccess) {
    // Not authorized to view this page
    router.replace("/dashboard");
    return null;
  }

  return (
    <div>
      <h1>Edit Trip</h1>

      <div style={{ marginBottom: 12 }}>
        <TripStatusBadge status={trip.status} />
      </div>

      {canEdit && trip.status === "DRAFT" ? (
        <>
          <TripForm
            initialData={trip}
            onSubmit={handleUpdate}
            submitting={submitting}
          />
          {trip.status === "DRAFT" && hasPermission("trip:submit") && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={handleSubmitForReview}
                disabled={submittingSubmit}
              >
                {submittingSubmit ? "Submitting…" : "Submit for Review"}
              </button>
            </div>
          )}
        </>
      ) : (
        // Not editable UI
        <div>{canEdit ? <p>This trip can no longer be edited.</p> : null}</div>
      )}

      {/* Admin action buttons */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        {trip.status === "PENDING_REVIEW" && canApprove && (
          <button onClick={handleApprove}>Approve</button>
        )}

        {trip.status === "APPROVED" && canPublish && (
          <button onClick={handlePublish}>Publish</button>
        )}

        {trip.status === "PUBLISHED" && canArchive && (
          <button onClick={handleArchive}>Archive</button>
        )}
      </div>
    </div>
  );
}
