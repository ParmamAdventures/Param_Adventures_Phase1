require("dotenv").config();
const fetch = globalThis.fetch;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("Starting join trip test");

  // 1. Register/login test user
  const email = `join-test-${Date.now()}@example.com`;
  const password = "password123";

  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginJson = await loginRes.json();
  const accessToken = loginJson.accessToken;

  if (!accessToken) {
    console.error("Login failed", loginJson);
    process.exit(1);
  }

  // Assign booking:create permission to test user by attaching PUBLIC role (test-only)
  const testUser = await prisma.user.findUnique({ where: { email } });
  const publicRole = await prisma.role.findUnique({
    where: { name: "PUBLIC" },
  });
  if (testUser && publicRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: testUser.id, roleId: publicRole.id } },
      update: {},
      create: { userId: testUser.id, roleId: publicRole.id },
    });
    // Ensure the PUBLIC role actually has the booking:create permission (test-only)
    let bookingPerm = await prisma.permission.findUnique({
      where: { key: "booking:create" },
    });
    if (!bookingPerm) {
      bookingPerm = await prisma.permission.create({
        data: { key: "booking:create" },
      });
    }
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: publicRole.id,
          permissionId: bookingPerm.id,
        },
      },
      update: {},
      create: { roleId: publicRole.id, permissionId: bookingPerm.id },
    });
    console.log("Assigned PUBLIC role to test user and ensured booking:create permission");
  }

  // 2. Fetch a published trip
  // Debug: fetch /auth/me to verify permissions
  const meRes = await fetch("http://localhost:3000/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log("/auth/me status:", meRes.status, await meRes.json());

  const tripsRes = await fetch("http://localhost:3000/trips/public");
  const trips = await tripsRes.json();
  if (!trips || trips.length === 0) {
    console.error("No published trips available to join");
    process.exit(1);
  }
  const trip = trips[0];

  // 3. Join trip - happy path
  const bookingRes = await fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ tripId: trip.id }),
  });

  console.log("Join status:", bookingRes.status);
  console.log(await bookingRes.json());

  // 4. Duplicate booking -> expect 409
  const dupRes = await fetch("http://localhost:3000/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ tripId: trip.id }),
  });
  console.log("Duplicate status (expect 409):", dupRes.status);
  console.log(await dupRes.json());

  // 5. Fetch my bookings
  const myRes = await fetch("http://localhost:3000/bookings/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log("My bookings status:", myRes.status);
  console.log(await myRes.json());
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
