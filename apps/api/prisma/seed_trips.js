const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING DIVERSE TRIPS ---");

  const admin = await prisma.user.findFirst({
    where: { roles: { some: { role: { name: "SUPER_ADMIN" } } } },
  });

  if (!admin) {
    console.error("Super Admin not found. Please run seed_users.js first.");
    return;
  }

  const trips = [
    // TREKS
    {
      title: "Annapurna Circuit Trek",
      slug: "annapurna-circuit",
      description: "One of the most diverse treks in the world, crossing Thorong La Pass.",
      itinerary: { days: [] },
      durationDays: 18,
      difficulty: "Hard",
      location: "Nepal",
      price: 1200,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
      capacity: 12,
      startDate: new Date("2026-04-01"), // Future date
      endDate: new Date("2026-04-18"),
      createdById: admin.id
    },
    {
      title: "Valley of Flowers",
      slug: "valley-of-flowers",
      description: "A UNESCO World Heritage site known for its meadows of endemic alpine flowers.",
      itinerary: { days: [] },
      durationDays: 6,
      difficulty: "Moderate",
      location: "Uttarakhand, India",
      price: 350,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      capacity: 20,
      createdById: admin.id
    },
    // CORPORATE
    {
      title: "Team Building in Rishikesh",
      slug: "corporate-rishikesh",
      description: "White water rafting and team bonding by the Ganges.",
      itinerary: { days: [] },
      durationDays: 3,
      difficulty: "Easy",
      location: "Rishikesh, India",
      price: 250,
      status: "PUBLISHED",
      category: "CORPORATE",
      coverImageLegacy: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
      capacity: 40,
      createdById: admin.id
    },
    {
       title: "Desert Leadership Workshop",
       slug: "desert-leadership",
       description: "Strategy and leadership sessions under the stars in Rajasthan.",
       itinerary: { days: [] },
       durationDays: 4,
       difficulty: "Easy",
       location: "Jaisalmer, India",
       price: 600,
       status: "PUBLISHED",
       category: "CORPORATE",
       coverImageLegacy: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7",
       capacity: 15,
       createdById: admin.id
    },
    // EDUCATIONAL
    {
      title: "Marine Biology Expedition",
      slug: "marine-biology-andaman",
      description: "Explore coral reefs and underwater ecosystems in the Andamans.",
      itinerary: { days: [] },
      durationDays: 7,
      difficulty: "Easy",
      location: "Andaman Islands",
      price: 1100,
      status: "PUBLISHED",
      category: "EDUCATIONAL",
      coverImageLegacy: "https://plus.unsplash.com/premium_photo-1661819381489-015886618685",
      capacity: 15,
      createdById: admin.id
    },
    {
       title: "Astro-Photography in Spiti",
       slug: "astro-spiti",
       description: "Learn to capture the Milky Way in the high-altitude cold desert.",
       itinerary: { days: [] },
       durationDays: 8,
       difficulty: "Moderate",
       location: "Spiti Valley, India",
       price: 900,
       status: "PUBLISHED",
       category: "EDUCATIONAL",
       coverImageLegacy: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
       capacity: 10,
       createdById: admin.id
    },
    // SPIRITUAL
    {
      title: "Vipassana Meditation Retreat",
      slug: "vipassana-retreat",
      description: "Ten days of silence and deep meditation in a serene mountain setting.",
      itinerary: { days: [] },
      durationDays: 10,
      difficulty: "Moderate",
      location: "Dharamshala, India",
      price: 450,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
      capacity: 25,
      createdById: admin.id
    },
    {
       title: "Ganga Aarti Experience",
       slug: "ganga-aarti-varanasi",
       description: "A spiritual journey through the oldest living city in the world.",
       itinerary: { days: [] },
       durationDays: 4,
       difficulty: "Easy",
       location: "Varanasi, India",
       price: 300,
       status: "PUBLISHED",
       category: "SPIRITUAL",
       coverImageLegacy: "https://images.unsplash.com/photo-1561361513-2d000a5010b2",
       capacity: 30,
       createdById: admin.id
    }
  ];

  for (const trip of trips) {
    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: trip,
      create: trip,
    });
  }

  console.log("Seeded " + trips.length + " trips.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
