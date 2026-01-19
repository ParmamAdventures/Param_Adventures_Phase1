import { constructMetadata } from "../../../lib/metadata";
import { notFound } from "next/navigation";
import TripHero from "../../../components/trips/TripHero";
import TripHighlights from "../../../components/trips/TripHighlights";
import TripBookingCard from "../../../components/trips/TripBookingCard";
import TripItinerary from "../../../components/trips/TripItinerary";
import TripQuickStats from "../../../components/trips/TripQuickStats";
import TripInclusions from "../../../components/trips/TripInclusions";
// import ReviewList from "../../../components/reviews/ReviewList";
// import ReviewForm from "../../../components/reviews/ReviewForm";
import ReviewsSection from "../../../components/reviews/ReviewsSection";
// import { Testimonials } from "../../../components/home/Testimonials";

// Enhanced API Base Logic for Server Components
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
console.log(`[TripDetail] Configured API_BASE: "${API_BASE}"`);

import { Trip } from "@/types/trip";

type TripFull = Trip;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/trips/public/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return constructMetadata({ title: "Adventure not found" });
    const json = await res.json();
    const trip = (json.data || json) as TripFull;

    return constructMetadata({
      title: trip.title,
      description: trip.description || undefined,
      image: (trip as any).coverImage?.mediumUrl || "/og-image.jpg",
    });
  } catch {
    return constructMetadata({ title: "Adventure" });
  }
}

import TripDetailClient from "../../../components/trips/TripDetailClient";

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  console.log(`[TripDetail] Server-side fetching: ${API_BASE}/trips/public/${slug}`);

  let initialTrip = null;

  try {
    const res = await fetch(`${API_BASE}/trips/public/${slug}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      // Robust unpacking on server side too
      initialTrip = json.data?.data || json.data || json;
    } else {
      console.warn(
        `[TripDetail] Server fetch failed (Status: ${res.status}). Falling back to client.`,
      );
    }
  } catch (err) {
    console.error("[TripDetail] Server network error. Falling back to client:", err);
    // initialTrip remains null, triggering client fetch check
  }

  return <TripDetailClient initialTrip={initialTrip} slug={slug} />;
}
// replaced render function... wait, I can just replace the top part and then use another replacement for the bottom part.

// Split into chunks for safety.

function renderTrip(trip: TripFull) {
  return (
    <div className="bg-background text-foreground min-h-screen pb-32">
      <TripHero trip={trip} />
      <TripQuickStats trip={trip} />

      <main className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* Main Content */}
          <div className="space-y-12">
            {/* Quick Stats (Mobile only, or simplified) */}
            <div className="lg:hidden">
              <TripHighlights trip={trip} />
            </div>

            {/* About / Description */}
            <section className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
              <div className="prose dark:prose-invert text-muted-foreground max-w-none text-lg leading-relaxed whitespace-pre-line">
                {trip.description || "Detailed itinerary coming soon."}
              </div>

              {/* Highlights List */}
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

              {/* Download Button (Visible on all devices now) */}
              {trip.itineraryPdf && (
                <div className="mt-8">
                  <a
                    href={trip.itineraryPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--accent)]/20 bg-[var(--accent)]/5 py-4 font-bold text-[var(--accent)] transition-all hover:bg-[var(--accent)]/10 active:scale-95"
                  >
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
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 18v-6" />
                      <path d="m9 15 3 3 3-3" />
                    </svg>
                    Download Detailed Itinerary
                  </a>
                </div>
              )}
            </section>

            {/* Inclusions & Policies */}
            <section id="inclusions" className="scroll-mt-24">
              <TripInclusions
                inclusions={trip.inclusions}
                exclusions={trip.exclusions}
                thingsToPack={trip.thingsToPack}
              />
            </section>

            {/* Gallery (if exists) */}
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

            {/* Reviews / Testimonials */}
            {/* <Testimonials tripId={trip.id} /> Replaced with Real Reviews */}
            <ReviewsSection tripId={trip.id!} />

            {/* Mobile Booking CTA (Fixed Bottom) */}
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
              {/* PDF Button moved to main content to avoid overlap */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
