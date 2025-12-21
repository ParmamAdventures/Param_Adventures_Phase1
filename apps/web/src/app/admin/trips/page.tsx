"use client";

import { useEffect, useState, useCallback } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import TripListTable from "../../../components/admin/TripListTable";

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/trips/internal");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unable to load trips");
        setTrips([]);
      } else {
        setTrips(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Network error: Could not reach the server.");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return (
    <PermissionRoute permission="trip:view:internal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Trip Management
            </h1>
            <p className="text-muted-foreground pt-1">
              Create and manage adventure trips for your customers.
            </p>
          </div>
          <Link href="/admin/trips/new">
            <Button variant="primary" className="shadow-lg">
              + Create New Trip
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <TripListTable 
            trips={trips} 
            loading={loading} 
            onRefresh={fetchTrips} 
          />
        )}
      </div>
    </PermissionRoute>
  );
}
