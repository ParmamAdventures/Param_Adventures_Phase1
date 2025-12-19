import TripCard from "./TripCard";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Link from "next/link";

export default function TripsGrid({ trips }: { trips: any[] }) {
  if (!trips || trips.length === 0) {
    return (
      <Card className="text-center py-16">
        <h3 className="text-lg font-semibold">No trips available yet</h3>
        <p className="text-[var(--muted)] mt-2">
          New adventures coming soon 🚀
        </p>
        <div className="mt-4">
          <Link href="/trips/new">
            <Button variant="primary">Create Trip</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
