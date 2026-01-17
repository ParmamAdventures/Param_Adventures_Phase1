"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";
import { Loader2, ShieldAlert, Briefcase } from "lucide-react";
import ManagerTripCard from "../../../components/manager/ManagerTripCard";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const { user, isLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Simple permission check (can accept ADMIN too)
      const isManager = user.roles?.includes("TRIP_MANAGER");
      if (!isManager) {
        // router.push("/dashboard");
        // Just show Unauthorized for now to avoid loops
      } else {
        fetchTrips();
      }
    }
  }, [user, isLoading]);

  const fetchTrips = async () => {
    try {
      const res = await apiFetch("/trips/manager");
      if (res.ok) {
        const data = await res.json();
        setTrips(data.data || data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  if (isLoading || fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="text-accent animate-spin" size={32} />
      </div>
    );
  }

  // Guard access
  if (!user?.roles?.includes("TRIP_MANAGER")) {
    // TRIP_MANAGER only
    return (
      <div className="text-muted-foreground flex h-64 flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h1 className="text-xl font-bold">Access Restricted</h1>
        <p>You do not have permission to view the Manager Portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Briefcase className="text-accent" />
            Manager Portal
          </h1>
          <p className="text-muted-foreground">Manage your assigned trips and crew.</p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed py-12 text-center">
          <Briefcase className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="text-lg font-medium">No Trips Assigned</h3>
          <p className="text-muted-foreground">
            You haven't been assigned to manage any trips yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <ManagerTripCard key={trip.id} trip={trip} onUpdate={fetchTrips} />
          ))}
        </div>
      )}
    </div>
  );
}

import AssignCrewModal from "../../../components/manager/AssignCrewModal";
