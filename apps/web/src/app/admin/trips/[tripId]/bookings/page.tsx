"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../../lib/api";
import { useAuth } from "../../../../../context/AuthContext";
import Button from "../../../../../components/ui/Button";
import { useToast } from "../../../../../components/ui/ToastProvider";
import { useParams } from "next/navigation";

type User = { id: string; name?: string | null; email: string };
type Booking = {
  id: string;
  status: string;
  createdAt: string;
  user: User | null;
};

type Trip = {
  id: string;
  title?: string | null;
  capacity?: number;
  confirmedCount?: number;
};

const ERROR_MESSAGES: Record<string, string> = {
  CAPACITY_FULL: "Trip capacity is full",
  INVALID_STATE: "This booking was already processed",
  FORBIDDEN: "You don't have permission to do this",
  NOT_FOUND: "Booking not found",
  NETWORK_ERROR: "Network error",
  UNKNOWN: "An error occurred",
};

export default function AdminTripBookingsPage() {
  const { tripId } = useParams() as { tripId: string };
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(
    null
  );
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const { loading: authLoading, user: currentUser } = useAuth();
  const { showToast } = useToast();

  const perms: string[] =
    (currentUser as { permissions?: string[] } | null)?.permissions || [];
  const canManage =
    perms.includes("booking:approve") && perms.includes("booking:reject");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiFetch(`/admin/trips/${tripId}/bookings`);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const code = data?.error?.code || "UNKNOWN";
        setError({
          code,
          message: ERROR_MESSAGES[code] || data?.error?.message || "Error",
        });
        return;
      }
      setTrip(data.trip);
      setBookings(data.bookings || []);
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setProcessing = (id: string, v: boolean) =>
    setProcessingIds((prev) =>
      v ? [...prev, id] : prev.filter((x) => x !== id)
    );

  const approveBooking = async (id: string) => {
    setError(null);
    setProcessing(id, true);
    try {
      showToast("Approving booking…", "info");
    } catch {}
    try {
      const res = await apiFetch(`/bookings/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code = body?.error?.code || "UNKNOWN";
        setError({
          code,
          message: ERROR_MESSAGES[code] || body?.error?.message,
        });
        try {
          showToast(
            ERROR_MESSAGES[code] ||
              body?.error?.message ||
              "Failed to approve booking",
            "error"
          );
        } catch {}
        return;
      }
      await fetchData();
      try {
        showToast("Booking approved", "success");
      } catch {}
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
      try {
        showToast("Network error while approving booking", "error");
      } catch {}
    } finally {
      setProcessing(id, false);
    }
  };

  const rejectBooking = async (id: string) => {
    setError(null);
    setProcessing(id, true);
    try {
      showToast("Rejecting booking…", "info");
    } catch {}
    try {
      const res = await apiFetch(`/bookings/${id}/reject`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code = body?.error?.code || "UNKNOWN";
        setError({
          code,
          message: ERROR_MESSAGES[code] || body?.error?.message,
        });
        try {
          showToast(
            ERROR_MESSAGES[code] ||
              body?.error?.message ||
              "Failed to reject booking",
            "error"
          );
        } catch {}
        return;
      }
      await fetchData();
      try {
        showToast("Booking rejected", "success");
      } catch {}
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
      try {
        showToast("Network error while rejecting booking", "error");
      } catch {}
    } finally {
      setProcessing(id, false);
    }
  };

  if (loading || authLoading) return <p>Loading bookings...</p>;

  return (
    <div>
      <h2>Bookings for {trip?.title ?? tripId}</h2>

      <p>
        Capacity: {trip?.capacity ?? "-"} — Confirmed:{" "}
        {trip?.confirmedCount ?? 0}
      </p>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <strong>{error.code}</strong>: {error.message}
        </div>
      )}

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Created</th>
            <th>Status</th>
            <th>User</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const processing = processingIds.includes(b.id);
            const needsAction = b.status === "REQUESTED";
            const showActions = needsAction && canManage;
            return (
              <tr key={b.id}>
                <td>{new Date(b.createdAt).toLocaleString()}</td>
                <td>{b.status}</td>
                <td>
                  {b.user ? `${b.user.name ?? "-"} (${b.user.email})` : "-"}
                </td>
                <td>
                  {needsAction ? (
                    showActions ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          onClick={() => approveBooking(b.id)}
                          loading={processing}
                          disabled={processing}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => rejectBooking(b.id)}
                          loading={processing}
                          disabled={processing}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button disabled variant="subtle">
                          Approve
                        </Button>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            marginTop: 6,
                          }}
                        >
                          You don’t have permission to approve this
                        </div>
                      </div>
                    )
                  ) : (
                    <span />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
