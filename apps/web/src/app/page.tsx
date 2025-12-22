import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import TripCard from "@/components/trips/TripCard";
import BlogCard from "@/components/blogs/BlogCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { constructMetadata } from "@/lib/metadata";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Testimonials } from "@/components/home/Testimonials";
import { StatsCounter } from "@/components/home/StatsCounter";
import { Newsletter } from "@/components/home/Newsletter";
import { AdventureCategories } from "@/components/home/AdventureCategories";
import { CustomTripForm } from "@/components/home/CustomTripForm";

export const metadata = constructMetadata({
  title: "Param Adventures | Expedition into the Unknown",
  description: "Join premium adventure travel experiences across the globe. From Spiti Valley to the Himalayas, discover the unseen with Param Adventures.",
});

// Mock Data extended with categories for fallback/dev
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
    category: "TREK"
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
    category: "SPIRITUAL"
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
    category: "TREK"
  },
  {
    id: "4",
    title: "Corporate Leadership Retreat",
    location: "Himachal Pradesh",
    status: "OPEN",
    slug: "corporate-leadership-retreat",
    price: 500,
    duration: "3 Days",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
    category: "CORPORATE"
  },
  {
    id: "5",
    title: "Himalayan Geology Tour",
    location: "Ladakh",
    status: "OPEN",
    slug: "himalayan-geology-tour",
    price: 1200,
    duration: "10 Days",
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop",
    category: "EDUCATIONAL"
  }
];

async function getTrips() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/trips/public`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
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

async function getHeroSlides() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/content/hero-slides`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [trips, blogs, heroSlides] = await Promise.all([getTrips(), getBlogs(), getHeroSlides()]);
  
  // Use mock trips if API returns empty, just for the visual showcase phase
  const allTrips = trips.length > 0 ? trips : MOCK_TRIPS;

  // Filter Categories
  const categorySections = [
    { title: "Trek and Camping", category: "TREK", description: "Conquer the mountains." },
    { title: "Corporate Trips", category: "CORPORATE", description: "Team building in nature." },
    { title: "Educational Trips", category: "EDUCATIONAL", description: "Learn from the world." },
    { title: "Spiritual Trips", category: "SPIRITUAL", description: "Find inner peace." },
  ];

  return (
    <main className="min-h-screen bg-background pb-0">
      <Hero slides={heroSlides} />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Adventure Categories */}
      <ScrollReveal width="100%">
        <AdventureCategories />
      </ScrollReveal>

      {/* Category Feeds */}
      {categorySections.map((section) => {
        const categoryTrips = allTrips.filter((t: any) => t.category === section.category || (section.category === 'TREK' && !t.category)); // Fallback for old data
        if (categoryTrips.length === 0) return null;

        return (
          <section id={`category-${section.category.toLowerCase()}`} key={section.category} className="scroll-mt-20">
            <ScrollReveal width="100%">
              <FeaturedSection
                title={section.title}
                subtitle={section.description}
                action={
                  <Link href={`/trips?category=${section.category.toLowerCase()}`}>
                    <Button variant="ghost" className="text-accent hover:text-accent/80 hover:bg-accent/10">View More &rarr;</Button>
                  </Link>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryTrips.map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </FeaturedSection>
            </ScrollReveal>
          </section>
        );
      })}
 
      {/* Featured Adventures (Restored) */}
      <ScrollReveal width="100%">
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
            {allTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </FeaturedSection>
      </ScrollReveal>

      {/* Testimonials */}
      <Testimonials />

      {/* Latest Stories */}
      {blogs.length > 0 && (
        <ScrollReveal width="100%">
          <FeaturedSection
            title="From the Journal"
            subtitle="Stories, tips, and travel guides."
            className="bg-accent/5 -mx-6 md:-mx-8 px-6 md:px-8 py-24" // Full width background trick
            action={
            <Link href="/blogs">
              <Button variant="ghost" className="text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 font-bold">Read All Stories &rarr;</Button>
            </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </FeaturedSection>
        </ScrollReveal>
      )}

      {/* Custom Trip Form */}
      <CustomTripForm />

      {/* Newsletter / Final CTA */}
      <Newsletter />
    </main>
  );
}
