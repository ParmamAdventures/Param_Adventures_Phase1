import Link from "next/link";
import { apiFetch } from "@/lib/api";

export const metadata = {
  title: "Upcoming Adventures — Param Adventures",
  description:
    "Browse published adventure trips — durations, difficulty, price, and locations.",
};

type Trip = {
  id: string;
  title: string;
  slug: string;
  location: string;
  durationDays: number;
  difficulty: string;
  price: number;
};

export default async function PublicTripsPage() {
  const res = await apiFetch("/trips/public", {
    cache: "no-store",
  } as any);

  const trips: Trip[] = res.ok ? await res.json() : [];

  return (
    <main>
      <h1>Upcoming Adventures</h1>

      {trips.length === 0 && <p>No trips available right now.</p>}

      <ul>
        {trips.map((trip) => (
          <li key={trip.id}>
            <h2>
              <Link href={`/trips/${trip.slug}`}>{trip.title}</Link>
            </h2>
            <p>
              {trip.location} · {trip.durationDays} days · {trip.difficulty}
            </p>
            <p>₹{trip.price}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
