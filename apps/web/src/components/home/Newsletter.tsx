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
    <section className="py-24 px-6 relative overflow-hidden">
        {/* Background Elements */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
       
      <div className="max-w-4xl mx-auto text-center space-y-8 bg-surface border border-border/50 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
        
        <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready for your next journey?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 10,000+ travelers exploring the world with Param Adventures. Get exclusive offers and travel tips.
            </p>
        </div>

        {status === "success" ? (
             <div className="p-4 bg-green-500/10 text-green-600 rounded-lg inline-block">
                Thank you! You've been subscribed to our newsletter.
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                suppressHydrationWarning
            />
            <Button 
                variant="primary" 
                className="h-auto py-3 px-8 text-base"
                loading={status === "loading"}
                disabled={status === "loading"}
            >
                Subscribe
            </Button>
            </form>
        )}
        
        <p className="text-xs text-muted-foreground">
            We care about your data in our privacy policy.
        </p>
      </div>
    </section>
  );
}
