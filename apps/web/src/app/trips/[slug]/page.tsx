import { constructMetadata } from "../../../lib/metadata";
import { notFound } from "next/navigation";
import TripHero from "../../../components/trips/TripHero";
import TripHighlights from "../../../components/trips/TripHighlights";
import TripBookingCard from "../../../components/trips/TripBookingCard";
import TripItinerary from "../../../components/trips/TripItinerary";
import TripQuickStats from "../../../components/trips/TripQuickStats";
import TripInclusions from "../../../components/trips/TripInclusions";
import ReviewList from "../../../components/reviews/ReviewList";
import ReviewForm from "../../../components/reviews/ReviewForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type TripFull = {
  id?: string;
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
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/trips/public/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return constructMetadata({ title: "Adventure not found" });
    const trip = (await res.json()) as TripFull;
    
    return constructMetadata({
      title: trip.title,
      description: trip.description || undefined,
      image: (trip as any).coverImage?.mediumUrl || "/og-image.jpg",
    });
  } catch {
    return constructMetadata({ title: "Adventure" });
  }
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const res = await fetch(`${API_BASE}/trips/public/${slug}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || res.status === 404) {
    const listRes = await fetch(`${API_BASE}/trips/public`, {
      cache: "no-store",
    }).catch(() => null);
    if (!listRes || !listRes.ok) notFound();
    const trips = await listRes.json();
    type TripItem = { slug: string } & Record<string, unknown>;
    const trip = (trips || []).find((t: TripItem) => t.slug === slug) as
      | TripFull
      | undefined;
    if (!trip) notFound();
    return renderTrip(trip as TripFull);
  }

  if (!res.ok) notFound();
  const trip = (await res.json()) as TripFull;
  return renderTrip(trip);
}

function renderTrip(trip: TripFull) {
  return (
    <div className="pb-32 bg-background min-h-screen text-foreground">
      <TripHero trip={trip} />
      <TripQuickStats trip={trip} />

      <main className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="grid gap-8 lg:gap-16 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-12">
            
            {/* Quick Stats (Mobile only, or simplified) */}
            <div className="lg:hidden">
                 <TripHighlights trip={trip} />
            </div>

            {/* About / Description */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {trip.description || "Detailed itinerary coming soon."}
                </div>
                
                {/* Highlights List */}
                {trip.highlights && trip.highlights.length > 0 && (
                    <div className="bg-accent/5 rounded-xl p-6 border border-accent/10 mt-8">
                        <h3 className="font-bold text-lg mb-4 text-accent">Trip Highlights</h3>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {trip.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-accent flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
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
                            className="flex items-center justify-center gap-2 w-full py-4 border-2 border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)] rounded-xl font-bold active:scale-95 transition-all hover:bg-[var(--accent)]/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
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
                    <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trip.gallery.map((item: any, i: number) => (
                            <div key={i} className="aspect-square relative rounded-xl overflow-hidden group cursor-zoom-in">
                                <img src={item.image.mediumUrl} alt={`Gallery ${i}`} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* Reviews Section */}
            <section id="reviews" className="scroll-mt-24 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Traveler Reviews</h2>
                    {/* Add average rating here if available in trip calculation later */}
                </div>
                
                <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                        <ReviewList tripId={trip.id!} />
                    </div>
                    <div>
                         {/* Ideally check if user has booking here, but backend validates it. 
                             We'll show the form, and it will error if unauthorized. */}
                        <ReviewForm tripId={trip.id!} />
                    </div>
                </div>
            </section>

            {/* Mobile Booking CTA (Fixed Bottom) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
               <a href="#book" className="w-full block">
                 <button className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg shadow-lg">
                   Book Now - ₹{trip.price}
                 </button>
               </a>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div id="book" className="hidden lg:block space-y-6">
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
