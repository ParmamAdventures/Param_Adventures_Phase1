"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Calendar, Users, Phone, Mail, MapPin, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

export default function GuideViewPage() {
  const [assignments, setAssignments] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/users/guide/trips");
      if (!res.ok) throw new Error("Failed to load guide assignments");
      const data = await res.json();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Spinner size={40} /></div>;

  if (error) return (
    <div className="p-8 text-center bg-red-500/5 rounded-3xl border border-red-500/10">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-xl font-bold">Access Denied</h3>
      <p className="text-muted-foreground mt-2">{error}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
      <div className="space-y-2">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Guide Operations</h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Your active & upcoming assignments</p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="p-12 text-center bg-[var(--card)] rounded-3xl border border-[var(--border)]">
           <MapPin className="mx-auto text-muted-foreground/30 mb-4" size={48} />
           <p className="font-bold text-lg">No active assignments</p>
           <p className="text-muted-foreground text-sm">When you are assigned as a guide to a trip, it will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((trip: any) => (
            <div key={trip.id} className="bg-[var(--card)] rounded-[32px] border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Header */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-muted">
                    {trip.coverImage ? (
                        <img src={trip.coverImage.mediumUrl} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 italic font-black uppercase tracking-tighter text-[10px]">No Photo</div>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{trip.title}</h2>
                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(trip.startDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin size={14}/> {trip.location}</span>
                        </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                     <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                        <Users size={16} className="text-[var(--accent)]" />
                        <span className="text-xs font-bold uppercase tracking-widest">{trip.bookings?.length || 0} Confirmed Guests</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Guest List Dropdown/Section (Expanded by default for guides) */}
              <div className="border-t border-[var(--border)] bg-[var(--background)]/50">
                 <div className="p-6 md:px-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Manifest / Guest List</h3>
                    <div className="grid gap-3">
                        {trip.bookings?.map((booking: any) => (
                            <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-black italic">
                                        {booking.user?.name?.substring(0,1) || "G"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{booking.user?.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{booking.guests} Guests • PAID</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/50 px-2 sm:px-0">
                                    {booking.user?.phoneNumber && (
                                        <a href={`tel:${booking.user.phoneNumber}`} className="p-2.5 bg-[var(--background)] text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm">
                                            <Phone size={18} />
                                        </a>
                                    )}
                                    {booking.user?.email && (
                                        <a href={`mailto:${booking.user.email}`} className="p-2.5 bg-[var(--background)] text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                            <Mail size={18} />
                                        </a>
                                    )}
                                    <div className="flex items-center gap-1.5 ml-2 text-green-500">
                                        <CheckCircle2 size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!trip.bookings || trip.bookings.length === 0) && (
                            <p className="text-center py-4 text-xs font-medium text-muted-foreground italic">No confirmed bookings for this trip yet.</p>
                        )}
                    </div>
                 </div>
              </div>
              
              {/* Footer Actions */}
              <div className="px-6 py-4 bg-[var(--card)] border-t border-[var(--border)] flex justify-end">
                  <Link href={`/trips/${trip.slug}`} target="_blank" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline">
                    View Trip Details <ChevronRight size={14} />
                  </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
