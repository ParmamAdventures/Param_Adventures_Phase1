"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { motion } from "framer-motion";

export function CustomTripForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    destination: "",
    dates: "",
    budget: "",
    details: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination) {
      alert("Please select a destination");
      return;
    }
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", destination: "", dates: "", budget: "", details: "" });
    }, 2000);
  };

  return (
    <section id="custom-trip-form" className="bg-background relative overflow-hidden py-24">
      {/* Decorative Background */}
      <div className="bg-accent/5 pointer-events-none absolute top-1/2 left-0 h-[500px] w-full -skew-y-3" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface border-border rounded-3xl border p-8 shadow-2xl md:p-12"
        >
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
              Plan Your Dream Trip
            </h2>
            <p className="text-muted-foreground text-lg">
              Tell us what you want, and we'll craft the perfect itinerary for you.
            </p>
          </div>

          {status === "success" ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-2xl font-bold">Request Received!</h3>
              <p className="text-muted-foreground">
                Our travel experts will contact you within 24 hours.
              </p>
              <Button variant="ghost" className="mt-6" onClick={() => setStatus("idle")}>
                Submit another request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="border-border bg-background focus:ring-accent/50 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                    placeholder="John Doe"
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="border-border bg-background focus:ring-accent/50 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                    placeholder="john@example.com"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Destination</label>
                  <Select
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={(val) =>
                      handleChange({ target: { name: "destination", value: val } } as any)
                    }
                    placeholder="Select a region..."
                    options={[
                      { value: "himalayas", label: "Himalayas" },
                      { value: "nepal", label: "Nepal" },
                      { value: "bhutan", label: "Bhutan" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Approximate Budget (per person)</label>
                  <input
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="border-border bg-background focus:ring-accent/50 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                    placeholder="₹10,000 - ₹50,000"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tell us more details</label>
                <textarea
                  name="details"
                  rows={4}
                  value={formData.details}
                  onChange={handleChange}
                  className="border-border bg-background focus:ring-accent/50 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                  placeholder="We are a group of 4 looking for a moderate trek..."
                  suppressHydrationWarning
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="shadow-accent/20 h-14 w-full text-lg font-bold shadow-xl"
                loading={status === "loading"}
              >
                Make It Happen
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
