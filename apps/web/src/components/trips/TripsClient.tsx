"use client";

import React, { useEffect, useState } from "react";
import TripsGrid from "./TripsGrid";
import { TripsGridSkeleton } from "./TripsGridSkeleton";
import { apiFetch } from "../../lib/api";

export default function TripsClient() {
  const [trips, setTrips] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiFetch("/trips/public");
        
        if (!res.ok) {
          setError("Failed to load trips");
          setTrips([]);
          return;
        }
        const data = await res.json();
        if (mounted) setTrips(data);
      } catch (e) {
        if (mounted) {
          setError("Network error");
          setTrips([]);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!trips) return <TripsGridSkeleton />;
  return <TripsGrid trips={trips} />;
}
