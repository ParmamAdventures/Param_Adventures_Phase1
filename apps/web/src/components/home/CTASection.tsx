import Button from "../ui/Button";

/**
 * CTASection - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function CTASection() {
  return (
    <section className="space-y-4 py-16 text-center">
      <h2 className="text-2xl font-semibold">Ready for your next adventure?</h2>
      <p className="opacity-70">Join a trip or share your story with the community.</p>
      <Button variant="primary">Get Started</Button>
    </section>
  );
}
