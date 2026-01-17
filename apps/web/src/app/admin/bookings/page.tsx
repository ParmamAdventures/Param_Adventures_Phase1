"use client";

import React, { useState, useEffect, useCallback } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";
import GlobalBookingList from "../../../components/admin/GlobalBookingList";
import ErrorBlock from "../../../components/ui/ErrorBlock";
import { useToast } from "../../../components/ui/ToastProvider";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch("/admin/bookings");
      if (!res.ok) throw new Error("Failed to load global bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <PermissionRoute permission="booking:read:admin">
      <div className="space-y-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
              Operations
            </span>
            <h1 className="from-foreground to-foreground/60 bg-gradient-to-r bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-5xl">
              Global Bookings
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Monitor and manage all trip registrations across the platform.
            </p>
          </div>
        </div>

        {error ? (
          <div className="max-w-4xl py-12">
            <ErrorBlock>{error}</ErrorBlock>
            <button
              onClick={fetchBookings}
              className="mt-4 text-[10px] font-bold tracking-widest text-[var(--accent)] uppercase hover:underline"
            >
              Retry Protocol ➔
            </button>
          </div>
        ) : (
          <GlobalBookingList bookings={bookings} loading={isLoading} onRefresh={fetchBookings} />
        )}
      </div>
    </PermissionRoute>
  );
}


