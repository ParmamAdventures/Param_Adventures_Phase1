import TripCard from "./TripCard";

export default function TripsGrid({ trips }: { trips: any[] }) {
  if (!trips || trips.length === 0) {
    return <p className="opacity-70">No trips available right now.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
