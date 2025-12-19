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
  params: { slug: string };
}) {
  try {
    const res = await fetch(`${API_BASE}/trips/public/${params.slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return {};
    const trip = (await res.json()) as TripFull;
    return {
      title: `${trip.title} | Param Adventures`,
      description: trip.description
        ? trip.description.slice(0, 160)
        : undefined,
      openGraph: {
        title: trip.title,
        description: trip.description || "",
        url: `https://paramadventures.com/trips/${trip.slug}`,
        type: "article",
      },
    };
  } catch {
    return {};
  }
}

export default async function TripDetailPage({
  params,
}: {
  params: { slug: string };
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
    <section className="space-y-12">
      <TripHero trip={trip} />

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <TripHighlights trip={trip} />

          <div>
            <h2 className="text-xl font-semibold mb-2">About this trip</h2>
            <p className="opacity-80 leading-relaxed">
              {trip.description || "Trip details coming soon."}
            </p>
          </div>
        </div>

        <TripBookingCard trip={trip} />
      </div>
    </section>
  );
}
