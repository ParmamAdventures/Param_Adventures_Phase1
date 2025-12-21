import Button from "../ui/Button";

export default function HeroSection() {
  return (
    <section className="py-16 space-y-6">
      <h1 className="text-4xl font-bold max-w-3xl">
        Discover unforgettable adventures with Param Adventures
      </h1>

      <p className="max-w-2xl opacity-80">
        Curated treks, journeys, and stories designed for explorers who seek
        more than just travel.
      </p>

      <div className="flex gap-4">
        <Button variant="primary">Explore Trips</Button>
        <Button variant="ghost">Read Stories</Button>
      </div>
    </section>
  );
}
