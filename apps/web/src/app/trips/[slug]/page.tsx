import { notFound } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
    const trip = await res.json();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
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
    } as any;
  } catch (e) {
    return {};
  }
}

export default async function TripDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  // Try direct slug endpoint, fallback to listing if not available
  let res = await fetch(`${API_BASE}/trips/public/${slug}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || res.status === 404) {
    // Fallback: fetch list and find by slug
    const listRes = await fetch(`${API_BASE}/trips/public`, {
      cache: "no-store",
    }).catch(() => null);
    if (!listRes || !listRes.ok) {
      notFound();
    }
    const trips = await listRes.json();
    const trip = (trips || []).find((t: any) => t.slug === slug);
    if (!trip) notFound();
    return renderTrip(trip);
  }

  if (!res.ok) notFound();
  const trip = await res.json();
  return renderTrip(trip);
}

function renderTrip(trip: any) {
  return (
    <main>
      <h1>{trip.title}</h1>
      <p>
        {trip.location} · {trip.durationDays} days · {trip.difficulty}
      </p>
      <p>₹{trip.price}</p>
      {trip.description && (
        <div dangerouslySetInnerHTML={{ __html: trip.description }} />
      )}
    </main>
  );
}
