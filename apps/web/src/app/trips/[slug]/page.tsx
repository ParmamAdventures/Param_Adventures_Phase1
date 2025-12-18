import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Trip = {
  title: string;
  description: string;
  location: string;
  durationDays: number;
  difficulty: string;
  price: number;
  itinerary: any;
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const res = await apiFetch(`/trips/public/${params.slug}`, {
    cache: "no-store",
  } as any);

  if (!res.ok) {
    return {
      title: "Trip not found",
    };
  }

  const trip: Trip = await res.json();

  return {
    title: `${trip.title} | Param Adventures`,
    description: trip.description?.slice(0, 160),
  };
}

export default async function PublicTripDetailPage({ params }: Props) {
  const res = await apiFetch(`/trips/public/${params.slug}`, {
    cache: "no-store",
  } as any);

  if (!res.ok) {
    notFound();
  }

  const trip: Trip = await res.json();

  return (
    <main>
      <h1>{trip.title}</h1>

      <p>
        {trip.location} · {trip.durationDays} days · {trip.difficulty}
      </p>

      <p>
        <strong>Price:</strong> ₹{trip.price}
      </p>

      <section>
        <h2>About this trip</h2>
        <p>{trip.description}</p>
      </section>

      <section>
        <h2>Itinerary</h2>
        <pre>{JSON.stringify(trip.itinerary, null, 2)}</pre>
      </section>
    </main>
  );
}
