import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  const res = await fetch(`${API_BASE}/trips/public`, { cache: "no-store" }).catch(() => null);
  const trips: Trip[] = res && res.ok ? await res.json() : [];

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
