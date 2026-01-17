import Card from "../ui/Card";
import Button from "../ui/Button";

/**
 * FeaturedTripsSection - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function FeaturedTripsSection() {
  return (
    <section className="space-y-6 py-12">
      <h2 className="text-2xl font-semibold">Featured Trips</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <h3 className="font-medium">Himalayan Escape</h3>
            <p className="mt-1 text-sm opacity-70">Uttarakhand • 6 days</p>
            <Button className="mt-4">View Trip</Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
