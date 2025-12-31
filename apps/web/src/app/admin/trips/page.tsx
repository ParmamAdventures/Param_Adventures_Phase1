"use client";

import { useEffect, useState, useCallback } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import TripListTable from "../../../components/admin/TripListTable";
import AssignGuideModal from "../../../components/admin/trips/AssignGuideModal";
import AssignManagerModal from "../../../components/admin/AssignManagerModal";

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignTripId, setAssignTripId] = useState<string | null>(null);

  // Pagination & Sort State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Manager Modal State
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedTripForManager, setSelectedTripForManager] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      });

      const res = await apiFetch(`/trips/internal?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Unable to load trips");
        setTrips([]);
      } else {
        setTrips(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.metadata?.totalPages || 1);
      }
    } catch {
      setError("Network error: Could not reach the server.");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc"); // Default to asc for new field
    }
    setPage(1); // Reset to first page on sort
  };

  const handleAction = async (
    id: string,
    action: "submit" | "approve" | "reject" | "publish" | "archive",
  ) => {
    if (!confirm(`Are you sure you want to ${action} this trip?`)) return;
    try {
      const res = await apiFetch(`/trips/${id}/${action}`, { method: "POST" });
      if (res.ok) {
        fetchTrips();
      } else {
        const data = await res.json();
        alert(data?.error || `Failed to ${action} trip`);
      }
    } catch (err) {
      alert(`Network error: Failed to ${action} trip`);
    }
  };

  // 3. Add handleAssignManager function
  const handleAssignManager = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (trip) {
      setSelectedTripForManager({ id: trip.id, title: trip.title });
      setShowManagerModal(true);
    }
  };

  return (
    <PermissionRoute permission="trip:view:internal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Trip Management</h1>
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
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <TripListTable
            trips={trips}
            loading={loading}
            onRefresh={fetchTrips}
            onAction={handleAction}
            onAssignGuide={setAssignTripId}
            // 4. Pass onAssignManager to TripListTable
            onAssignManager={handleAssignManager}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}

        <AssignGuideModal
          tripId={assignTripId}
          onClose={() => setAssignTripId(null)}
          onSuccess={() => {
            alert("Guide assigned successfully!");
            fetchTrips();
          }}
        />

        <AssignManagerModal
          isOpen={showManagerModal}
          onClose={() => setShowManagerModal(false)}
          tripId={selectedTripForManager?.id || null}
          tripTitle={selectedTripForManager?.title}
          onSuccess={() => {
            fetchTrips();
          }}
        />
      </div>
    </PermissionRoute>
  );
}
