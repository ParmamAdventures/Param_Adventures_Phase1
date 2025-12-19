import StatusBadge from "../ui/StatusBadge";

export default function TripHero({ trip }: { trip: any }) {
  return (
    <div className="space-y-2">
      <StatusBadge status={trip.status} />
      <h1 className="text-4xl font-bold">{trip.title}</h1>
      <p className="opacity-70">{trip.location}</p>
    </div>
  );
}
