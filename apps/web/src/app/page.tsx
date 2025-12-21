import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import TripCard from "@/components/trips/TripCard";
import BlogCard from "@/components/blogs/BlogCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Suspense } from "react";

// Fallback data for visual polish if API is empty
const MOCK_TRIPS = [
  {
    id: "1",
    title: "Everest Base Camp Trek",
    location: "Nepal",
    status: "OPEN",
    slug: "everest-base-camp",
    price: 1400,
    duration: "14 Days",
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Kyoto Cherry Blossom Tour",
    location: "Japan",
    status: "OPEN",
    slug: "kyoto-cherry-blossom",
    price: 2200,
    duration: "9 Days",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Iceland Northern Lights",
    location: "Iceland",
    status: "OPEN",
    slug: "iceland-northern-lights",
    price: 1800,
    duration: "7 Days",
    coverImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2670&auto=format&fit=crop",
  },
];

async function getTrips() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/trips`, { cache: "no-store" });
    if (!res.ok) return [];
    const trips = await res.json();
    return trips.length > 0 ? trips.slice(0, 3) : [];
  } catch {
    return [];
  }
}

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/blogs/public`, { cache: "no-store" });
    if (!res.ok) return [];
    const blogs = await res.json();
    return blogs.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [trips, blogs] = await Promise.all([getTrips(), getBlogs()]);
  
  // Use mock trips if API returns empty, just for the visual showcase phase
  const displayTrips = trips.length > 0 ? trips : MOCK_TRIPS;

  return (
    <main className="min-h-screen bg-background pb-32">
      <Hero />

      {/* Featured Trips */}
      <FeaturedSection
        title="Featured Adventures"
        subtitle="Handpicked experiences for the daring soul."
        action={
          <Link href="/trips">
            <Button variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10">View All Trips &rarr;</Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTrips.map((trip: any) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </FeaturedSection>

      {/* Latest Stories */}
      {blogs.length > 0 && (
        <FeaturedSection
          title="From the Journal"
          subtitle="Stories, tips, and travel guides."
          className="bg-accent/5 -mx-6 md:-mx-8 px-6 md:px-8 py-24" // Full width background trick
          action={
          <Link href="/blogs/public">
            <Button variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10">Read All Stories &rarr;</Button>
          </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog: any) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </FeaturedSection>
      )}

      {/* Newsletter / Final CTA with constrained width */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-surface border border-border/50 p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -z-10" />
          
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready for your next journey?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 10,000+ travelers exploring the world with Param Adventures.
          </p>
          <div className="flex justify-center gap-4">
             <Link href="/signup">
              <Button variant="primary" className="h-12 px-8">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
