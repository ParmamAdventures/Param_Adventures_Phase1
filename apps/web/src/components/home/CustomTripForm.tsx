"use client";

import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { motion } from "framer-motion";
import { apiFetch } from "../../lib/api";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import { useFormState } from "../../hooks/useFormState";

/**
 * CustomTripForm - Form component for custom trip inquiries.
 * Uses useAsyncOperation for submission state and useFormState for form management.
 *
 * @returns {React.ReactElement} Custom trip form component
 *
 * @example
 * <CustomTripForm />
 */
export function CustomTripForm() {
  const { state, execute, reset: resetAsync } = useAsyncOperation();
  const {
    values: formData,
    handleChange,
    reset: resetForm,
  } = useFormState({
    name: "",
    email: "",
    phoneNumber: "",
    destination: "",
    dates: "",
    budget: "",
    details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination) {
      alert("Please select a destination");
      return;
    }

    await execute(async () => {
      const res = await apiFetch("/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit inquiry");
      }

      resetForm();
      return res.json();
    });
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
              Tell us what you want, and we&apos;ll craft the perfect itinerary for you.
            </p>
          </div>

          {state.status === "success" ? (
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
              <Button variant="ghost" className="mt-6" onClick={() => resetAsync()}>
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
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="border-border bg-background focus:ring-accent/50 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                    placeholder="+91 98765 43210"
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Destination</label>
                  <Select
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={(val) => setField("destination", val)}
                    placeholder="Select a region..."
                    options={[
                      { value: "himalayas", label: "Himalayas" },
                      { value: "nepal", label: "Nepal" },
                      { value: "bhutan", label: "Bhutan" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                loading={state.status === "loading"}
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
