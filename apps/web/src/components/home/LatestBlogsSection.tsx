import Card from "../ui/Card";

export default function LatestBlogsSection() {
  return (
    <section className="py-12 space-y-6">
      <h2 className="text-2xl font-semibold">Latest Stories</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <h3 className="font-medium">Walking through the clouds</h3>
            <p className="text-sm opacity-70 mt-2">
              A story from our recent high-altitude trek.
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
