"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

export function CustomTripForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    destination: "",
    dates: "",
    budget: "",
    details: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", destination: "", dates: "", budget: "", details: "" });
    }, 2000);
  };

  return (
    <section id="custom-trip-form" className="py-24 bg-background relative overflow-hidden">
       {/* Decorative Background */}
       <div className="absolute top-1/2 left-0 w-full h-[500px] bg-accent/5 -skew-y-3 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Plan Your Dream Trip
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us what you want, and we'll craft the perfect itinerary for you.
            </p>
          </div>

          {status === "success" ? (
             <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                <p className="text-muted-foreground">Our travel experts will contact you within 24 hours.</p>
                <Button variant="ghost" className="mt-6" onClick={() => setStatus("idle")}>Submit another request</Button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none" placeholder="john@example.com" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preferred Destination</label>
                        <select name="destination" required value={formData.destination} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none">
                            <option value="">Select a region...</option>
                            <option value="himalayas">Himalayas</option>
                            <option value="nepal">Nepal</option>
                            <option value="bhutan">Bhutan</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Approximate Budget (per person)</label>
                        <input name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none" placeholder="$1000 - $2000" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tell us more details</label>
                    <textarea name="details" rows={4} value={formData.details} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none" placeholder="We are a group of 4 looking for a moderate trek..." />
                </div>

                <Button type="submit" variant="primary" className="w-full h-14 text-lg font-bold shadow-xl shadow-accent/20" loading={status === "loading"}>
                    Make It Happen
                </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
