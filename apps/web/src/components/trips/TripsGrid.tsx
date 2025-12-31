import TripCard from "./TripCard";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Link from "next/link";
import MotionCard from "../ui/MotionCard";

export default function TripsGrid({ trips }: { trips: any[] }) {
  if (!trips || trips.length === 0) {
    return (
      <Card className="py-16 text-center">
        <h3 className="text-lg font-semibold">No trips available yet</h3>
        <p className="mt-2 text-[var(--muted)]">New adventures coming soon 🚀</p>
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
        <MotionCard key={trip.id} className="p-2">
          <TripCard trip={trip} />
        </MotionCard>
      ))}
    </div>
  );
}
