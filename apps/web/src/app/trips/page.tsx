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
  const mock: Trip[] = [
    {
      id: "t-1",
      title: "Himalayan Escape",
      slug: "himalayan-escape",
      location: "Uttarakhand, India",
      durationDays: 6,
      difficulty: "Moderate",
      price: 12000,
      status: "PUBLISHED",
    },
    {
      id: "t-2",
      title: "Nilgiri Trail",
      slug: "nilgiri-trail",
      location: "Kodaikanal, India",
      durationDays: 4,
      difficulty: "Easy",
      price: 8000,
      status: "PUBLISHED",
    },
    {
      id: "t-3",
      title: "Ranthambore Weekender",
      slug: "ranthambore-weekender",
      location: "Rajasthan, India",
      durationDays: 3,
      difficulty: "Easy",
      price: 6500,
      status: "FULL",
    },
  ];

  try {
    if (!API_BASE) return mock;
    const res = await fetch(`${API_BASE}/trips/public`, {
      cache: "no-store",
    }).catch(() => null);
    const remote = res && res.ok ? await res.json() : null;
    return remote && Array.isArray(remote) && remote.length > 0 ? remote : mock;
  } catch {
    return mock;
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
