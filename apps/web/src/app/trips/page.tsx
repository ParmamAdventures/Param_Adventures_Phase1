import TripsGrid from "../../components/trips/TripsGrid";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type Trip = {
  id: string;
  title: string;
  slug: string;
  location: string;
  durationDays?: number;
  difficulty?: string;
  price?: number;
  status?: string;
};

async function getTrips(): Promise<Trip[]> {
  try {
    const res = await fetch(`${API_BASE}/trips/public`, { cache: "no-store" }).catch(() => null);
    return res && res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function PublicTripsPage() {
  const trips = await getTrips();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Upcoming Trips</h1>
      <TripsGrid trips={trips} />
    </section>
  );
}
