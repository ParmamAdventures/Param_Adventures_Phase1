export default function TripHighlights({ trip }: { trip: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm opacity-60">Capacity</p>
        <p className="font-medium">{trip.capacity ?? "—"}</p>
      </div>

      <div>
        <p className="text-sm opacity-60">Status</p>
        <p className="font-medium">{trip.status ?? "—"}</p>
      </div>

      <div>
        <p className="text-sm opacity-60">Duration</p>
        <p className="font-medium">
          {trip.durationDays ? `${trip.durationDays} days` : "—"}
        </p>
      </div>

      <div>
        <p className="text-sm opacity-60">Price</p>
        <p className="font-medium">{trip.price ? `₹${trip.price}` : "—"}</p>
      </div>
    </div>
  );
}
