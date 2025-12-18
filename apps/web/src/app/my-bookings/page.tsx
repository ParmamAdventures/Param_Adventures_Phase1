"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import Link from "next/link";
import TripStatusBadge from "../../components/trips/TripStatusBadge";

type Booking = {
  id: string;
  status: string;
  createdAt: string;
  trip: {
    id: string;
    title: string;
    slug: string;
    location: string;
    startDate?: string | null;
    endDate?: string | null;
  };
};

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await apiFetch("/bookings/me");
        if (!res.ok) {
          setError("Failed to load bookings");
          setBookings([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) setBookings(data);
      } catch (e) {
        if (!cancelled) setError("Network error");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please sign in to view your bookings.</div>;
  }

  if (error) return <div>{error}</div>;

  if (bookings && bookings.length === 0) {
    return <div>No bookings yet — join a trip to get started.</div>;
  }

  return (
    <div>
      <h1>My Bookings</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Trip</th>
            <th>Dates</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings?.map((b) => (
            <tr key={b.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: "8px 4px" }}>
                <Link href={`/trips/${b.trip.slug}`}>{b.trip.title}</Link>
              </td>
              <td style={{ textAlign: "center" }}>
                {b.trip.startDate && b.trip.endDate
                  ? `${new Date(b.trip.startDate).toLocaleDateString()} - ${new Date(
                      b.trip.endDate
                    ).toLocaleDateString()}`
                  : "—"}
              </td>
              <td style={{ textAlign: "center" }}>{b.trip.location}</td>
              <td style={{ textAlign: "center" }}>
                <TripStatusBadge status={b.status} />
              </td>
              <td style={{ textAlign: "center" }}>—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
