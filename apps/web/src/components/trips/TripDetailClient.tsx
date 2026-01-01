"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import TripHero from "./TripHero";
import TripQuickStats from "./TripQuickStats";
import TripHighlights from "./TripHighlights";
import TripItinerary from "./TripItinerary";
import TripInclusions from "./TripInclusions";
import { Testimonials } from "../home/Testimonials";
import TripBookingCard from "./TripBookingCard";
import TripPolicies from "./TripPolicies";

// Define strict types matching the API response
type TripFull = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  location?: string;
  startPoint?: string;
  endPoint?: string;
  altitude?: string;
  distance?: string;
  durationDays?: number;
  difficulty?: string;
  price?: number;
  capacity?: number;
  status?: string;
  itinerary?: any;
  inclusions?: string[];
  exclusions?: string[];
  thingsToPack?: string[];
  highlights?: string[];
  itineraryPdf?: string;
  gallery?: { image: { mediumUrl: string; originalUrl: string } }[];
  category?: string;
  cancellationPolicy?: any;
  faqs?: { question: string; answer: string }[];
  seasons?: string[];
};

// Re-using the same render layout as the server component to ensure consistency
function RenderTripLayout({ trip }: { trip: TripFull }) {
  return (
    <div className="bg-background text-foreground min-h-screen pb-32">
      <TripHero trip={trip} />
      <TripQuickStats trip={trip} />

      <main className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* Main Content */}
          <div className="space-y-12">
            {/* Quick Stats (Mobile only) */}
            <div className="lg:hidden">
              <TripHighlights trip={trip} />
            </div>

            {/* Overview */}
            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
              <div className="prose dark:prose-invert text-muted-foreground max-w-none text-lg leading-relaxed whitespace-pre-line">
                {trip.description || "Detailed itinerary coming soon."}
              </div>

              {/* Highlights */}
              {trip.highlights && trip.highlights.length > 0 && (
                <div className="bg-accent/5 border-accent/10 mt-8 rounded-xl border p-6">
                  <h3 className="text-accent mb-4 text-lg font-bold">Trip Highlights</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {trip.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-accent mt-1 flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Itinerary */}
            <section id="itinerary" className="scroll-mt-24">
              <TripItinerary itinerary={trip.itinerary} />
              {trip.itineraryPdf && (
                <div className="mt-8">
                  <a
                    href={trip.itineraryPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--accent)]/20 bg-[var(--accent)]/5 py-4 font-bold text-[var(--accent)] transition-all hover:bg-[var(--accent)]/10 active:scale-95"
                  >
                    Download Detailed Itinerary
                  </a>
                </div>
              )}
            </section>


            {/* Inclusions */}
            <section id="inclusions" className="scroll-mt-24">
              <TripInclusions
                inclusions={trip.inclusions}
                exclusions={trip.exclusions}
                thingsToPack={trip.thingsToPack}
              />
            </section>

            {/* Best Seasons */}
            {trip.seasons && trip.seasons.length > 0 && (
              <section className="rounded-xl border border-sky-100 bg-sky-50/50 p-6 dark:border-sky-900/30 dark:bg-sky-900/10">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-sky-700 dark:text-sky-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                    <path d="M10 16a2 2 0 1 0 4 0" />
                  </svg>
                  Best Seasons
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.seasons.map((season, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-sky-700 shadow-sm dark:bg-sky-950 dark:text-sky-300"
                    >
                      {season}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Policies & FAQs */}
            <section>
              <TripPolicies cancellationPolicy={trip.cancellationPolicy} faqs={trip.faqs} />
            </section>

            {/* Gallery */}
            {trip.gallery && trip.gallery.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold">Gallery</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {trip.gallery.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl"
                    >
                      <img
                        src={item.image.mediumUrl}
                        alt={`Gallery ${i}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <Testimonials tripId={trip.id} />

            {/* Mobile Booking CTA */}
            <div className="bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t p-4 backdrop-blur-md lg:hidden">
              <a href="#book" className="block w-full">
                <button className="bg-primary text-primary-foreground w-full rounded-lg py-3.5 font-bold shadow-lg">
                  Book Now - ₹{trip.price}
                </button>
              </a>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div id="book" className="hidden space-y-6 lg:block">
            <div className="sticky top-24 space-y-6">
              <TripBookingCard trip={trip} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TripDetailClient({
  initialTrip,
  slug,
}: {
  initialTrip: any; // Using any to avoid strict type mismatch with server-side prop, validated inside
  slug: string;
}) {
  const [trip, setTrip] = useState<TripFull | null>(initialTrip as TripFull);
  const [loading, setLoading] = useState(!initialTrip);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have data from server, do nothing
    if (initialTrip) return;

    // Otherwise, fetch from client (waking up backend if needed)
    console.log(`[Client] Waking up backend for slug: ${slug}`);
    
    // We can use the proxy route /api/trips/public/...
    apiFetch(`/trips/public/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        // Unpack robustly
        const data = json.data?.data || json.data || json;
        setTrip(data);
      })
      .catch((err) => {
        console.error("Client fetch failed:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [initialTrip, slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="text-accent h-12 w-12 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-lg font-medium">
          Waking up the Adventure Engine...
        </p>
        <p className="text-muted-foreground text-sm">(This might take a moment on the free tier)</p>
      </div>
    );
  }

  if (error || !trip) {
    // This will trigger the Next.js not-found page on the client side
    // Or we can just render a custom Error state here
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Adventure Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn't find the trip you're looking for. It might have been moved or removed.
        </p>
        <a href="/trips" className="text-accent hover:underline">
          Browse all trips
        </a>
      </div>
    );
  }

  return <RenderTripLayout trip={trip} />;
}
