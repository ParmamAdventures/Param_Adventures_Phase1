"use client";

import { useEffect, useState } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";

type Trip = {
  id: string;
  title: string;
  location: string;
  status: string;
};

export default function InternalTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/trips/internal")
      .then((res) => res.json())
      .then(setTrips)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading trips…</p>;

  return (
    <PermissionRoute permission="trip:view:internal">
      <div>
        <h1>Trips (Internal)</h1>

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
                <td>{t.title}</td>
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
