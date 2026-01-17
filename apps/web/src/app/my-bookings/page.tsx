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
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function load() {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    }

    load();
  }, [authLoading, user]);

  if (authLoading || (isLoading && !bookings)) {
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
          <div className="inline-block rounded-3xl bg-[var(--accent)]/10 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Personalized Dashboard</h1>
            <p className="text-muted-foreground text-lg text-balance">
              Sign in to track your bookings, explore itineraries, and manage payments.
            </p>
          </div>
          <Link href="/login" className="block">
            <Button className="w-full rounded-2xl py-4 shadow-[var(--accent)]/20 shadow-xl">
              Sign in to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorBlock>{error}</ErrorBlock>
        <div className="mt-6 text-center">
          <Button onClick={() => window.location.reload()} variant="subtle">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
            Adventure Dashboard
          </span>
          <h1 className="from-foreground to-foreground/60 bg-gradient-to-r bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-5xl">
            My Bookings
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Keep track of your upcoming expeditions and stories.
          </p>
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
          <Card className="flex flex-col items-center justify-center space-y-8 border-2 border-dashed bg-transparent p-20 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-[var(--accent)]/10 blur-3xl" />
              <div className="relative rounded-full border bg-[var(--card)] p-8 shadow-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m16 12-4-4-4 4" />
                  <path d="M12 8v8" />
                </svg>
              </div>
            </div>
            <div className="max-w-sm space-y-3">
              <h3 className="text-2xl font-bold tracking-tight">No adventures found yet</h3>
              <p className="text-muted-foreground font-medium">
                The world is vast and full of stories waiting for you. Start your first journey
                today.
              </p>
            </div>
            <Link href="/trips">
              <Button className="rounded-full px-12 py-4 shadow-[var(--accent)]/20 shadow-xl">
                Explore Trips
              </Button>
            </Link>
          </Card>
        ) : (
          <BookingList bookings={bookings || []} loading={isLoading} />
        )}
      </div>

      {/* Analytics/Incentive Section (Placeholder for high-end look) */}
      <div className="grid grid-cols-1 gap-6 border-t pt-12 md:grid-cols-3">
        <div className="rounded-3xl border bg-gradient-to-br from-[var(--card)] to-[var(--border)]/10 p-6">
          <p className="text-muted-foreground mb-1 text-xs font-bold tracking-widest uppercase">
            Global Reach
          </p>
          <p className="text-3xl font-black tracking-tighter">15+</p>
          <p className="text-muted-foreground text-sm">Countries explored by our community.</p>
        </div>
        <div className="rounded-3xl border bg-gradient-to-br from-[var(--card)] to-[var(--border)]/10 p-6">
          <p className="text-muted-foreground mb-1 text-xs font-bold tracking-widest uppercase">
            Expert Support
          </p>
          <p className="text-3xl font-black tracking-tighter">24/7</p>
          <p className="text-muted-foreground text-sm">Always there for your expedition needs.</p>
        </div>
        <div className="rounded-3xl border bg-gradient-to-br from-[var(--card)] to-[var(--border)]/10 p-6">
          <p className="text-muted-foreground mb-1 text-xs font-bold tracking-widest uppercase">
            Impact Made
          </p>
          <p className="text-3xl font-black tracking-tighter">1.2k</p>
          <p className="text-muted-foreground text-sm">Stories shared by travelers like you.</p>
        </div>
      </div>
    </div>
  );
}
