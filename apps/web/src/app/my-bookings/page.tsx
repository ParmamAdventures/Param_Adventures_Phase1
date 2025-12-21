"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import Link from "next/link";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorBlock from "../../components/ui/ErrorBlock";
import Spinner from "../../components/ui/Spinner";
import BookingList from "../../components/bookings/BookingList";

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch("/bookings/me");
        if (!res.ok) {
          setError("Failed to load your adventures");
          return;
        }
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError("Network connectivity issue. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authLoading, user]);

  if (authLoading || (loading && !bookings)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Spinner size={32} />
        <p className="text-muted-foreground animate-pulse font-medium">Loading your journey...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="bg-[var(--accent)]/10 p-6 rounded-3xl inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Personalized Dashboard</h1>
            <p className="text-muted-foreground text-lg text-balance">Sign in to track your bookings, explore itineraries, and manage payments.</p>
          </div>
          <Link href="/login" className="block">
            <Button className="w-full rounded-2xl shadow-xl shadow-[var(--accent)]/20 py-4">Sign in to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <ErrorBlock>{error}</ErrorBlock>
        <div className="mt-6 text-center">
          <Button onClick={() => window.location.reload()} variant="subtle">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-xs">Adventure Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            My Bookings
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Keep track of your upcoming expeditions and stories.</p>
        </div>
        
        {bookings && bookings.length > 0 && (
          <Link href="/trips">
            <Button variant="subtle" className="rounded-full px-6 font-semibold">
              Find More adventures
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {bookings && bookings.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-20 text-center space-y-8 border-dashed border-2 bg-transparent">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-[var(--accent)]/10 rounded-full animate-pulse" />
              <div className="relative bg-[var(--card)] border p-8 rounded-full shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 8v8"/></svg>
              </div>
            </div>
            <div className="max-w-sm space-y-3">
              <h3 className="text-2xl font-bold tracking-tight">No adventures found yet</h3>
              <p className="text-muted-foreground font-medium">The world is vast and full of stories waiting for you. Start your first journey today.</p>
            </div>
            <Link href="/trips">
              <Button className="rounded-full px-12 py-4 shadow-xl shadow-[var(--accent)]/20">Explore Trips</Button>
            </Link>
          </Card>
        ) : (
          <BookingList bookings={bookings || []} loading={loading} />
        )}
      </div>

      {/* Analytics/Incentive Section (Placeholder for high-end look) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t">
        <div className="p-6 bg-gradient-to-br from-[var(--card)] to-[var(--border)]/10 rounded-3xl border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Global Reach</p>
          <p className="text-3xl font-black tracking-tighter">15+</p>
          <p className="text-sm text-muted-foreground">Countries explored by our community.</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-[var(--card)] to-[var(--border)]/10 rounded-3xl border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Expert Support</p>
          <p className="text-3xl font-black tracking-tighter">24/7</p>
          <p className="text-sm text-muted-foreground">Always there for your expedition needs.</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-[var(--card)] to-[var(--border)]/10 rounded-3xl border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Impact Made</p>
          <p className="text-3xl font-black tracking-tighter">1.2k</p>
          <p className="text-sm text-muted-foreground">Stories shared by travelers like you.</p>
        </div>
      </div>
    </div>
  );
}
