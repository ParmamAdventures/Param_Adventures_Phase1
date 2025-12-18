require("dotenv").config();
const fetch = globalThis.fetch;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("Starting admin list bookings test");

  const creator = await prisma.user.create({
    data: { email: `alist-creator-${Date.now()}@example.com`, password: "pw" },
  });
  const trip = await prisma.trip.create({
    data: {
      title: "AdminList Trip",
      slug: `alist-${Date.now()}`,
      description: "",
      itinerary: [],
      durationDays: 1,
      difficulty: "Easy",
      location: "Here",
      price: 0,
      status: "PUBLISHED",
      createdById: creator.id,
      capacity: 5,
    },
  });

  // create 3 bookings
  const users = [];
  for (let i = 0; i < 3; i++) {
    const u = await prisma.user.create({
      data: {
        email: `alist-user-${Date.now()}-${i}@example.com`,
        password: "pw",
        name: `User ${i}`,
      },
    });
    users.push(u);
    await prisma.booking.create({
      data: { userId: u.id, tripId: trip.id, status: "REQUESTED" },
    });
  }

  // create super admin and assign SUPER_ADMIN role
  const adminEmail = `admin-list-${Date.now()}@example.com`;
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

  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const adminToken = (await loginRes.json()).accessToken;

  const res = await fetch(
    `http://localhost:3000/admin/trips/${trip.id}/bookings`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log("Admin list status:", res.status);
  console.log(await res.json());

  console.log("Admin list bookings test complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
