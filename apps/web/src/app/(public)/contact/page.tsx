export default function ContactPage() {
  return (
    <div className="py-12 text-center text-[var(--text)]">
      <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
      <p className="mx-auto max-w-2xl text-lg opacity-80">
        Have questions about our upcoming expeditions? We&apos;d love to hear from you.
      </p>
      <div className="mx-auto mt-12 grid max-w-lg gap-6 text-left">
        <div className="rounded-lg bg-accent/10 p-6 border border-accent/20">
          <h2 className="text-xl font-bold mb-2">General Inquiry</h2>
          <p className="opacity-70">Email: adventure@paramadventures.com</p>
        </div>
        <div className="rounded-lg bg-accent/10 p-6 border border-accent/20">
          <h2 className="text-xl font-bold mb-2">Direct Support</h2>
          <p className="opacity-70">Phone: +91 98765 43210</p>
        </div>
      </div>
    </div>
  );
}
