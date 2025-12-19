require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const email = "admin@local.test";
  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin)
    throw new Error("Admin user not found; run ensure_admin.js first");

  const trip = await prisma.trip.create({
    data: {
      title: "Seeded Booking Trip",
      slug: `seeded-trip-${Date.now()}`,
      description: "Trip created by seed_admin_booking.js",
      itinerary: [],
      durationDays: 1,
      difficulty: "Easy",
      location: "Localhost",
      price: 1000,
      status: "PUBLISHED",
      createdById: admin.id,
      capacity: 10,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      userId: admin.id,
      tripId: trip.id,
      status: "CONFIRMED",
      paymentStatus: "PENDING",
    },
  });

  console.log("Seeded booking created:");
  console.log("tripId:", trip.id);
  console.log("bookingId:", booking.id);
  console.log(
    "Open the web app and sign in as admin@local.test to see the Pay Now CTA on My Bookings."
  );

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
