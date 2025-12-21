"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await apiFetch("/bookings/me");
        if (res.ok) {
          setBookings(await res.json());
        }
      } catch (e) {
        console.error("Failed to load bookings", e);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">My Adventures</h2>
        <Link href="/trips">
          <Button variant="ghost" className="gap-2">
            Explore More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-[var(--border)]/10 animate-pulse rounded-[32px] border border-[var(--border)]" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No adventures yet"
          description="You haven't booked any expeditions with us. The wild is calling."
          actionLabel="View Trips"
          actionLink="/trips"
          icon={
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="group flex flex-col md:flex-row items-center gap-6 p-6 rounded-[40px] bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all hover:shadow-2xl hover:shadow-[var(--accent)]/5"
            >
              <div className="w-full md:w-32 h-24 rounded-[24px] bg-[var(--border)]/20 overflow-hidden shrink-0">
                {booking.trip.coverImage ? (
                  <img src={booking.trip.coverImage.thumbUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/20 font-black italic">PARAM</div>
                )}
              </div>
              
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                  {booking.trip.location}
                </p>
                <h3 className="text-xl font-black italic tracking-tight uppercase leading-none">
                  {booking.trip.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <StatusBadge status={booking.status} />
                <Link href={`/trips/${booking.trip.slug}`}>
                  <Button variant="ghost" className="font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 h-auto">
                    Trip Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
