import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import TripCarousel from "@/components/trips/TripCarousel";
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
  description:
    "Join premium adventure travel experiences across the globe. From Spiti Valley to the Himalayas, discover the unseen with Param Adventures.",
});

async function getTrips() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/trips/public`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.message || json.data?.data || json.data || json;
  } catch {
    return [];
  }
}

async function getBlogs() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/blogs/public`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const blogs = json.message || json.data?.data || json.data || json;
    return blogs.slice(0, 3);
  } catch {
    return [];
  }
}

async function getHeroSlides() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/content/hero-slides`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getFeaturedTrips() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/trips/public?isFeatured=true`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.message || json.data?.data || json.data || json;
  } catch {
    return [];
  }
}

export default async function Home() {
  const [trips, featuredTrips, blogs, heroSlides] = await Promise.all([
    getTrips(),
    getFeaturedTrips(),
    getBlogs(),
    getHeroSlides(),
  ]);

  // Directly use api data
  const allTrips = trips;

  // Filter Categories
  const categorySections = [
    { title: "Trek and Camping", category: "TREK", description: "Conquer the mountains." },
    { title: "Corporate Trips", category: "CORPORATE", description: "Team building in nature." },
    { title: "Educational Trips", category: "EDUCATIONAL", description: "Learn from the world." },
    { title: "Spiritual Trips", category: "SPIRITUAL", description: "Find inner peace." },
  ];

  return (
    <main className="bg-background min-h-screen pb-0">
      <Hero slides={heroSlides} />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Adventure Categories */}
      <ScrollReveal width="100%">
        <AdventureCategories />
      </ScrollReveal>

      {/* Category Feeds */}
      {categorySections.map((section) => {
        const categoryTrips = allTrips.filter(
          (t: any) =>
            t.category === section.category || (section.category === "TREK" && !t.category),
        ); // Fallback for old data
        if (categoryTrips.length === 0) return null;

        return (
          <section
            id={`category-${section.category.toLowerCase()}`}
            key={section.category}
            className="scroll-mt-20"
          >
            <ScrollReveal width="100%">
              <FeaturedSection
                title={section.title}
                subtitle={section.description}
                action={
                  <Link href={`/trips?category=${section.category.toLowerCase()}`}>
                    <Button
                      variant="ghost"
                      className="text-accent hover:text-accent/80 hover:bg-accent/10"
                    >
                      View More &rarr;
                    </Button>
                  </Link>
                }
              >
                <TripCarousel trips={categoryTrips} />
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
              <Button
                variant="ghost"
                className="text-accent hover:text-accent/80 hover:bg-accent/10"
              >
                View All Trips &rarr;
              </Button>
            </Link>
          }
        >
          <TripCarousel trips={featuredTrips} />
        </FeaturedSection>
      </ScrollReveal>

      {/* Testimonials */}
      <Testimonials />

      {/* Latest Stories */}
      {blogs.length > 0 && (
        <section className="bg-accent/5 py-12">
          <ScrollReveal width="100%">
            <FeaturedSection
              title="From the Journal"
              subtitle="Stories, tips, and travel guides."
              className="py-0" // Reset internal padding since wrapper handles vertical spacing if needed, or keep standard
              action={
                <Link href="/blogs">
                  <Button
                    variant="ghost"
                    className="font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
                  >
                    Read All Stories &rarr;
                  </Button>
                </Link>
              }
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {blogs.map((blog: any) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </FeaturedSection>
          </ScrollReveal>
        </section>
      )}

      {/* Custom Trip Form */}
      <CustomTripForm />

      {/* Newsletter / Final CTA */}
      <Newsletter />
    </main>
  );
}
