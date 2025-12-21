"use client";

import { useEffect, useState } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";
import TripStatusBadge from "../../../components/trips/TripStatusBadge";

type Trip = {
  id: string;
  title: string;
  location: string;
  status: string;
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch("/trips/internal");
        const data = await res.json();
        if (!mounted) return;
        if (!res.ok) {
          setError(data?.error || "Unable to load trips");
          setTrips([]);
        } else {
          setTrips(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!mounted) return;
        setError("Network error");
        setTrips([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Loading trips…</p>;
  if (error) return <p>{error}</p>;

  return (
    <PermissionRoute permission="trip:view:internal">
      <div>
        <h1>Trip Management</h1>

        <div style={{ marginBottom: 12 }}>
          <Link href="/admin/trips/new" style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', borderRadius: 4, textDecoration: 'none' }}>
            + Create New Trip
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Title</th>
              <th style={{ padding: 8 }}>Location</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{t.title}</td>
                <td style={{ padding: 8 }}>{t.location}</td>
                <td style={{ padding: 8 }}>
                  <TripStatusBadge status={t.status} />
                </td>
                <td style={{ padding: 8 }}>
                  <Link href={`/admin/trips/${t.id}/edit`} style={{ marginRight: 8 }}>Edit</Link>
                  <Link href={`/trips/${t.id}`}>Preview</Link>
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  No trips found. Create your first adventure!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PermissionRoute>
  );
}
