"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

type GuideBooking = {
  id: string;
  guestName?: string;
  guestEmail?: string;
  status?: string;
};

type GuideAssignment = {
  id: string;
  title: string;
  startDate: string;
  location: string;
  status?: string;
  coverImage?: { mediumUrl?: string };
  coverImageLegacy?: string;
  bookings?: GuideBooking[];
};

export default function GuideViewPage() {
  const [assignments, setAssignments] = useState<GuideAssignment[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/users/guide/trips");
      if (!res.ok) throw new Error("Failed to load guide assignments");
      const data = await res.json();
      const parsed = Array.isArray(data) ? data : data?.data;
      setAssignments((parsed || []) as GuideAssignment[]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size={40} />
      </div>
    );

  if (error)
    return (
      <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-xl font-bold">Access Denied</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );

  return (
    <div className="space-y-8 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Guide Operations</h1>
        <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
          Your active & upcoming assignments
        </p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <MapPin className="text-muted-foreground/30 mx-auto mb-4" size={48} />
          <p className="text-lg font-bold">No active assignments</p>
          <p className="text-muted-foreground text-sm">
            When you are assigned as a guide to a trip, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((trip) => (
            <div
              key={trip.id}
              className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              {/* Header */}
              <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
                {/* Image */}
                <div className="bg-muted relative h-32 w-full flex-shrink-0 overflow-hidden rounded-2xl md:w-32">
                  <img
                    src={
                      trip.coverImage?.mediumUrl ||
                      trip.coverImageLegacy ||
                      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80"
                    }
                    alt={trip.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                        {trip.title}
                      </h2>
                      <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {new Date(trip.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {trip.location}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2">
                      <Users size={16} className="text-[var(--accent)]" />
                      <span className="text-xs font-bold tracking-widest uppercase">
                        {trip.bookings?.length || 0} Confirmed Guests
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest List Dropdown/Section (Expanded by default for guides) */}
              <div className="border-t border-[var(--border)] bg-[var(--background)]/50">
                <div className="p-6 md:px-8">
                  <h3 className="text-muted-foreground mb-4 text-xs font-black tracking-widest uppercase">
                    Manifest / Guest List
                  </h3>
                  <div className="grid gap-3">
                    {trip.bookings?.map((booking: GuideBooking) => (
                      <div
                        key={booking.id}
                        className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--accent)]/30 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 font-black text-[var(--accent)] italic">
                            {booking.user?.name?.substring(0, 1) || "G"}
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">{booking.user?.name}</p>
                            <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                              {booking.guests} Guests • PAID
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4 border-t border-[var(--border)]/50 px-2 pt-3 sm:mt-0 sm:border-t-0 sm:px-0 sm:pt-0">
                          {booking.user?.phoneNumber && (
                            <a
                              href={`tel:${booking.user.phoneNumber}`}
                              className="rounded-xl bg-[var(--background)] p-2.5 text-green-500 shadow-sm transition-all hover:bg-green-500 hover:text-white"
                            >
                              <Phone size={18} />
                            </a>
                          )}
                          {booking.user?.email && (
                            <a
                              href={`mailto:${booking.user.email}`}
                              className="rounded-xl bg-[var(--background)] p-2.5 text-blue-500 shadow-sm transition-all hover:bg-blue-500 hover:text-white"
                            >
                              <Mail size={18} />
                            </a>
                          )}
                          <div className="ml-2 flex items-center gap-1.5 text-green-500">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black tracking-widest uppercase">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!trip.bookings || trip.bookings.length === 0) && (
                      <p className="text-muted-foreground py-4 text-center text-xs font-medium italic">
                        No confirmed bookings for this trip yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--card)] px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 text-xs"
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setIsUploadModalOpen(true);
                  }}
                >
                  <FileText size={14} /> Upload Proofs
                </Button>

                <Link
                  href={`/trips/${trip.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase hover:underline"
                >
                  View Trip Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTripId && (
        <UploadDocsModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          tripId={selectedTripId}
          onSuccess={() => {
            // Optional: Refresh list or show toast
            loadAssignments();
          }}
        />
      )}
    </div>
  );
}

import { Button } from "@/components/ui/Button";
import UploadDocsModal from "@/components/guide/UploadDocsModal";
import { FileText } from "lucide-react";
