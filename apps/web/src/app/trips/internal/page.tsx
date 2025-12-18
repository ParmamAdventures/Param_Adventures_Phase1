"use client";

import { useEffect, useState } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";

type Trip = {
  id: string;
  title: string;
  location: string;
  status: string;
};

export default function InternalTripsPage() {
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
      } catch (e) {
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
        <h1>Trips (Internal)</h1>

        <div style={{ marginBottom: 12 }}>
          <Link href="/trips/new">Create Trip</Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.title}
                  {t.status === "DRAFT" && (
                    <span style={{ marginLeft: 8 }}>
                      <Link href={`/trips/${t.id}/edit`}>Edit</Link>
                    </span>
                  )}
                </td>
                <td>{t.location}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PermissionRoute>
  );
}
