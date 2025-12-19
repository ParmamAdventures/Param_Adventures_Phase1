import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

type Trip = {
  id: string;
  title: string;
  location: string;
  status: string;
  slug: string;
};

export default function TripCard({ trip }: { trip: Trip }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{trip.title}</h3>
        <StatusBadge status={trip.status} />
      </div>

      <p className="text-sm opacity-70">{trip.location}</p>

      <Button variant="primary" className="mt-2 w-full">
        View Trip
      </Button>
    </Card>
  );
}
