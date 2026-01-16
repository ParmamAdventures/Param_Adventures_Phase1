import "dotenv/config.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting booking tests");

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: `booking-test-${Date.now()}@example.com`,
      password: "password",
      name: "Booking Test User",
    },
  });

  // Create a test trip
  const trip = await prisma.trip.create({
    data: {
      title: "Booking Test Trip",
      slug: `booking-test-${Date.now()}`,
      description: "Trip for booking tests",
      itinerary: [],
      durationDays: 1,
      difficulty: "Easy",
      location: "Test Land",
      price: 0,
      status: "PUBLISHED",
      createdById: user.id,
      capacity: 2,
    },
  });

  // Create first booking - should succeed
  const booking1 = await prisma.booking.create({
    data: {
      userId: user.id,
      tripId: trip.id,
      notes: "First booking",
    },
  });
  console.log("First booking created:", booking1.id);

  // Attempt duplicate booking - should fail due to unique constraint
  let duplicateErrored = false;
  try {
    await prisma.booking.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        notes: "Duplicate booking attempt",
      },
    });
  } catch {
    duplicateErrored = true;
    console.log("Duplicate booking rejected as expected");
  }

  if (!duplicateErrored) {
    throw new Error("Duplicate booking was allowed!");
  }

  // Cleanup
  await prisma.booking.deleteMany({ where: { tripId: trip.id } });
  await prisma.trip.delete({ where: { id: trip.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log("Booking uniqueness test passed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
