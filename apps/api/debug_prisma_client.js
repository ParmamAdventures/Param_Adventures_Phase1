import { PrismaClient  } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Prisma Client for isFeatured field...");

  // 1. Create a dummy trip
  const trip = await prisma.trip.create({
    data: {
      title: "Debug Trip Featured",
      slug: "debug-trip-featured-" + Date.now(),
      description: "Test",
      itinerary: {},
      durationDays: 1,
      difficulty: "Easy",
      location: "Test",
      price: 100,
      createdById: (await prisma.user.findFirst()).id,
      isFeatured: true, // Try setting it
    },
  });

  console.log("Created trip with isFeatured:", trip.isFeatured);

  // 2. Update it
  const updated = await prisma.trip.update({
    where: { id: trip.id },
    data: { isFeatured: false },
  });

  console.log("Updated trip isFeatured:", updated.isFeatured);

  // Cleanup
  await prisma.trip.delete({ where: { id: trip.id } });
  console.log("Test passed!");
}

main()
  .catch((e) => {
    console.error("Test FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
