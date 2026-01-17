import Button from "../ui/Button";

/**
 * HeroSection - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function HeroSection() {
  return (
    <section className="space-y-6 py-16">
      <h1 className="max-w-3xl text-4xl font-bold">
        Discover unforgettable adventures with Param Adventures
      </h1>

      <p className="max-w-2xl opacity-80">
        Curated treks, journeys, and stories designed for explorers who seek more than just travel.
      </p>

      <div className="flex gap-4">
        <Button variant="primary">Explore Trips</Button>
        <Button variant="ghost">Read Stories</Button>
      </div>
    </section>
  );
}
