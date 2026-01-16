import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";



const prisma = new PrismaClient();

async function main() {
  const slug = "e2e-test-trip-" + Date.now();
  console.log("Seeding trip:", slug);
  
  const trip = await prisma.trip.create({
    data: {
      title: "E2E Test Trip",
      slug: slug,
      description: "A trip for testing",
      price: 5000,
      duration: 3,
      difficulty: "Easy",
      location: "Testland",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 3),
      type: "Trekking",
      status: "PUBLISHED",
      images: ["https://placehold.co/600x400"],
      itinerary: []
    }
  });

  console.log("TRIP_SLUG=" + trip.slug);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
