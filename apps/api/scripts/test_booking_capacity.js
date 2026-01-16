import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";

const fetch = globalThis.fetch;

const prisma = new PrismaClient();

async function run() {
  console.log("Starting booking capacity test");

  // Create a trip creator
  const creator = await prisma.user.create({
    data: {
      email: `creator-${Date.now()}@example.com`,
      password: "pw",
      name: "Creator",
    },
  });

  const trip = await prisma.trip.create({
    data: {
      title: "Capacity Test Trip",
      slug: `capacity-test-${Date.now()}`,
      description: "Capacity test",
      itinerary: [],
      durationDays: 1,
      difficulty: "Easy",
      location: "Test Land",
      price: 0,
      status: "PUBLISHED",
      createdById: creator.id,
      capacity: 1,
    },
  });

  // Create two booking users and their bookings (REQUESTED)
  const u1 = await prisma.user.create({
    data: { email: `u1-${Date.now()}@example.com`, password: "pw" },
  });
  const u2 = await prisma.user.create({
    data: { email: `u2-${Date.now()}@example.com`, password: "pw" },
  });

  const b1 = await prisma.booking.create({
    data: { userId: u1.id, tripId: trip.id, status: "REQUESTED" },
  });
  const b2 = await prisma.booking.create({
    data: { userId: u2.id, tripId: trip.id, status: "REQUESTED" },
  });

  // Create admin user via register endpoint then grant SUPER_ADMIN role directly in DB
  const adminEmail = `admin-${Date.now()}@example.com`;
  const adminPassword = "password123";
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  const superRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superRole.id },
  });

  // Login admin to get token
  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const loginJson = await loginRes.json();
  const adminToken = loginJson.accessToken;

  // Approve first booking - expect 200
  const res1 = await fetch(`http://localhost:3000/bookings/${b1.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("Approve b1 status:", res1.status);
  console.log(await res1.json());

  // Approve second booking - expect 409
  const res2 = await fetch(`http://localhost:3000/bookings/${b2.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("Approve b2 status (expect 409):", res2.status);
  console.log(await res2.json());

  // Invalid transition: approve already confirmed -> expect 403
  const res3 = await fetch(`http://localhost:3000/bookings/${b1.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("Re-approve b1 status (expect 403):", res3.status);
  console.log(await res3.json());

  // Cleanup - remove created bookings/trip/users (best-effort)
  await prisma.booking.deleteMany({ where: { tripId: trip.id } });
  await prisma.trip.delete({ where: { id: trip.id } });
  await prisma.user
    .deleteMany({ where: { email: { contains: "capacity-test-" } } })
    .catch(() => {});

  console.log("Booking capacity test complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
