import Button from "../ui/Button";

export default function CTASection() {
  return (
    <section className="py-16 text-center space-y-4">
      <h2 className="text-2xl font-semibold">Ready for your next adventure?</h2>
      <p className="opacity-70">
        Join a trip or share your story with the community.
      </p>
      <Button variant="primary">Get Started</Button>
    </section>
  );
}
