import TripsClient from "../../components/trips/TripsClient";

// Force rebuild
export default function PublicTripsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Upcoming Trips</h1>
      <TripsClient />
    </section>
  );
}
