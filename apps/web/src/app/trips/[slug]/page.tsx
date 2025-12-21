import { constructMetadata } from "../../../lib/metadata";
import { notFound } from "next/navigation";
import TripHero from "../../../components/trips/TripHero";
import TripHighlights from "../../../components/trips/TripHighlights";
import TripBookingCard from "../../../components/trips/TripBookingCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type TripFull = {
  id?: string;
  title: string;
  slug: string;
  description?: string | null;
  location?: string;
  durationDays?: number;
  difficulty?: string;
  price?: number;
  capacity?: number;
  status?: string;
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

  // Try direct slug endpoint, fallback to listing if not available
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
    <div className="pb-32 bg-[var(--bg)] min-h-screen text-[var(--foreground)]">
      <TripHero trip={trip} />

      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-12">
            <TripHighlights trip={trip} />

            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">About this trip</h2>
              <p className="opacity-90 leading-relaxed text-lg">
                {trip.description || "Detailed itinerary coming soon."}
              </p>
            </div>
            
            {/* Mobile Booking CTA Placeholder (Sticky Bottom) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50">
               <a href="#book" className="w-full block">
                 <button className="w-full bg-accent text-white font-bold py-3 rounded-lg shadow-lg">
                   Book Now - ${trip.price}
                 </button>
               </a>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div id="book" className="hidden lg:block">
            <div className="sticky top-24">
              <TripBookingCard trip={trip} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
