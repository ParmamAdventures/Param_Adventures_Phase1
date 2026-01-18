/**
 * E2E Test Data Seeder
 * Creates minimal data required for E2E Playwright tests
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding E2E test data...");

  // Create a test user for E2E
  const testUser = await prisma.user.upsert({
    where: { email: "e2e-test@example.com" },
    update: {},
    create: {
      email: "e2e-test@example.com",
      password: "$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU", // "password123"
      name: "E2E Test User",
      phoneNumber: "1234567890",
      status: "ACTIVE",
    },
  });

  console.log("✅ E2E test user created:", testUser.email);

  // Create E2E test trip
  const e2eTrip = await prisma.trip.upsert({
    where: { slug: "e2e-test-expedition" },
    update: {
      status: "PUBLISHED",
      title: "E2E Test Expedition",
      price: 5000,
    },
    create: {
      title: "E2E Test Expedition",
      slug: "e2e-test-expedition",
      description: "A test expedition for E2E Playwright testing",
      location: "Test Mountain Range",
      startPoint: "Test Base Camp",
      endPoint: "Test Summit",
      altitude: "5000m",
      distance: "50km",
      durationDays: 5,
      difficulty: "EASY",
      price: 5000,
      capacity: 20,
      status: "PUBLISHED",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-06"),
      itinerary: {
        days: [
          {
            day: 1,
            title: "Arrival and Orientation",
            description: "Meet the team and prepare for the journey",
            meals: ["Dinner"],
            accommodation: "Base Camp Hotel",
          },
        ],
      },
      highlights: [
        "Scenic mountain views",
        "Professional guides",
        "All meals included",
        "Transportation provided",
      ],
      inclusions: ["Accommodation", "All meals", "Transportation", "Guide services"],
      exclusions: ["Personal expenses", "Travel insurance", "Tips"],
      thingsToPack: ["Warm clothing", "Trekking boots", "Water bottle", "Sunscreen"],
      createdById: testUser.id,
    },
  });

  console.log("✅ E2E test trip created:", e2eTrip.slug);
  console.log("\n🎉 E2E test data seeding complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ E2E seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
