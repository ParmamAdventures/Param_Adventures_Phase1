import TripsClient from "../../components/trips/TripsClient";

import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Upcoming Adventures",
  description:
    "Browse our curated list of upcoming trekking and adventure trips. Book your next experience today.",
});

// Force rebuild
export default function PublicTripsPage() {
  return (
    <section className="mx-auto min-h-screen max-w-7xl space-y-6 px-6 pt-24">
      <h1 className="text-3xl font-bold">Upcoming Expeditions</h1>
      <TripsClient />
    </section>
  );
}
