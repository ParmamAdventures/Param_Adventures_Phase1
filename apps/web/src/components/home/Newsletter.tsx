"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  return (
    <section className="relative overflow-hidden px-6 py-24">
      {/* Background Elements */}
      <div className="bg-accent/5 absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full blur-[100px]" />

      <div className="bg-surface border-border/50 relative mx-auto max-w-4xl space-y-8 overflow-hidden rounded-3xl border p-8 text-center shadow-2xl md:p-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready for your next journey?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Join 10,000+ travelers exploring the world with Param Adventures. Get exclusive offers
            and travel tips.
          </p>
        </div>

        {status === "success" ? (
          <div className="inline-block rounded-lg bg-green-500/10 p-4 text-green-600">
            Thank you! You've been subscribed to our newsletter.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-lg flex-col gap-4 md:flex-row"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border bg-background focus:ring-accent/50 flex-1 rounded-xl border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              suppressHydrationWarning
            />
            <Button
              variant="primary"
              className="h-auto px-8 py-3 text-base"
              loading={status === "loading"}
              disabled={status === "loading"}
            >
              Subscribe
            </Button>
          </form>
        )}

        <p className="text-muted-foreground text-xs">
          We care about your data in our privacy policy.
        </p>
      </div>
    </section>
  );
}
