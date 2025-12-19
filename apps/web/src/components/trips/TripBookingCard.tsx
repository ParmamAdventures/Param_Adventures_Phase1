import Card from "../ui/Card";
import Button from "../ui/Button";

export default function TripBookingCard({ trip }: { trip: any }) {
  const disabled = trip?.status !== "PUBLISHED";

  return (
    <Card className="sticky top-24 space-y-4">
      <h3 className="text-lg font-semibold">Join this trip</h3>

      <p className="opacity-70 text-sm">Limited slots available. Secure your spot.</p>

      <Button disabled={disabled} className="w-full">
        {disabled ? "Not available" : "Join Trip"}
      </Button>
    </Card>
  );
}
