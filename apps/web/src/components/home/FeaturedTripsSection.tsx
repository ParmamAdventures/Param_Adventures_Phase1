import Card from "../ui/Card";
import Button from "../ui/Button";

export default function FeaturedTripsSection() {
  return (
    <section className="py-12 space-y-6">
      <h2 className="text-2xl font-semibold">Featured Trips</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <h3 className="font-medium">Himalayan Escape</h3>
            <p className="text-sm opacity-70 mt-1">Uttarakhand • 6 days</p>
            <Button className="mt-4">View Trip</Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
