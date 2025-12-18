require("dotenv").config();
const fetch = globalThis.fetch;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const adminEmail = "admin@local.test";
  const adminPassword = "password123";

  console.log("Registering admin user:", adminEmail);
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  }).catch(() => {});

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error("Failed to create admin user");

  // Grant SUPER_ADMIN role so admin has full permissions for testing
  const superRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  if (!superRole)
    throw new Error("SUPER_ADMIN role not found in DB (run seed)");
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superRole.id },
  });

  // Create a trip
  const creator = admin;
  const trip = await prisma.trip.create({
    data: {
      title: "Admin UI Test Trip",
      slug: `admin-ui-${Date.now()}`,
      description: "Trip for admin UI testing",
      itinerary: [],
      durationDays: 1,
      difficulty: "Easy",
      location: "Localhost",
      price: 0,
      status: "PUBLISHED",
      createdById: creator.id,
      capacity: 1,
    },
  });

  // Create two booking users and bookings
  const u1 = await prisma.user.create({
    data: {
      email: `a-user1-${Date.now()}@example.com`,
      password: "pw",
      name: "User One",
    },
  });
  const u2 = await prisma.user.create({
    data: {
      email: `a-user2-${Date.now()}@example.com`,
      password: "pw",
      name: "User Two",
    },
  });

  const b1 = await prisma.booking.create({
    data: { userId: u1.id, tripId: trip.id, status: "REQUESTED" },
  });
  const b2 = await prisma.booking.create({
    data: { userId: u2.id, tripId: trip.id, status: "REQUESTED" },
  });

  console.log(
    "Setup complete. Use these credentials to sign in via the web app:"
  );
  console.log("Admin email:", adminEmail);
  console.log("Admin password:", adminPassword);
  console.log("Admin bookings page URL (open in browser after starting web):");
  console.log(`http://localhost:3001/admin/trips/${trip.id}/bookings`);
  console.log("Trip id:", trip.id);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
