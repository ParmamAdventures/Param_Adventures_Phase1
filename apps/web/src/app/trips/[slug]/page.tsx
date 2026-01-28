import { constructMetadata } from "../../../lib/metadata";

// Enhanced API Base Logic for Server Components
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_V1 = `${API_BASE}/api/v1`;
console.log(`[TripDetail] Configured API_BASE: "${API_V1}"`);

import { Trip } from "@/types/trip";

type TripFull = Trip;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_V1}/trips/public/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return constructMetadata({ title: "Adventure not found" });
    const json = await res.json();
    const trip = (json.data || json) as TripFull;

    const coverImage = trip.coverImage;
    const coverImageUrl =
      coverImage && typeof coverImage === "object"
        ? coverImage.mediumUrl || ("originalUrl" in coverImage ? coverImage.originalUrl : undefined)
        : typeof coverImage === "string"
          ? coverImage
          : undefined;

    return constructMetadata({
      title: trip.title,
      description: trip.description || undefined,
      image: coverImageUrl || "/og-image.jpg",
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

  let initialTrip: Trip | null = null;

  try {
    const res = await fetch(`${API_V1}/trips/public/${slug}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      // Robust unpacking on server side too
      const parsedTrip = (json.data?.data || json.data || json) as Trip | null;
      initialTrip = parsedTrip;
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

// function removed as it was unused (line 87-229)
