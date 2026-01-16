import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";

const fetch = globalThis.fetch;

const prisma = new PrismaClient();

async function run() {
  console.log("Starting booking permissions test");

  // Create trip and booking
  const creatorEmail = `perm-creator-${Date.now()}@example.com`;
  const creatorPassword = "pw";
  // Register creator via API so password is hashed and login works
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: creatorEmail, password: creatorPassword }),
  }).catch(() => {});
  const creator = await prisma.user.findUnique({
    where: { email: creatorEmail },
  });
  const trip = await prisma.trip.create({
    data: {
      title: "Perm Test",
      slug: `perm-${Date.now()}`,
      description: "",
      itinerary: [],
      durationDays: 1,
      difficulty: "Easy",
      location: "Here",
      price: 0,
      status: "PUBLISHED",
      createdById: creator.id,
      capacity: 2,
    },
  });

  const userEmail = `user-no-perm-${Date.now()}@example.com`;
  const userPassword = "pw";
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, password: userPassword }),
  }).catch(() => {});
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  const booking = await prisma.booking.create({
    data: { userId: user.id, tripId: trip.id, status: "REQUESTED" },
  });

  // Login as the user (should not have booking:approve)
  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, password: userPassword }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.accessToken;

  // Try approve -> expect 403
  const res = await fetch(`http://localhost:3000/bookings/${booking.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Approve without perm status (expect 403):", res.status);
  console.log(await res.json());

  // Now create super admin and assign ADMIN role to a new user, then try approve with that user
  const adminEmail = `admin-${Date.now()}@example.com`;
  const adminPassword = "password123";
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  }).catch(() => {});
  const superRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  // Grant SUPER_ADMIN directly in DB for test setup
  if (superRole && adminUser) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: superRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: superRole.id },
    });
  }

  // Create operator user and grant ADMIN role directly via Prisma (test helper)
  const operatorEmail = `operator-${Date.now()}@example.com`;
  const operatorPassword = "password123";
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: operatorEmail, password: operatorPassword }),
  }).catch(() => {});
  const operatorUser = await prisma.user.findUnique({
    where: { email: operatorEmail },
  });
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  if (adminRole && operatorUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: operatorUser.id, roleId: adminRole.id },
      },
      update: {},
      create: { userId: operatorUser.id, roleId: adminRole.id },
    });
  }

  // Ensure the ADMIN role has booking:approve permission for the test
  let approvePerm = await prisma.permission.findUnique({
    where: { key: "booking:approve" },
  });
  if (!approvePerm) {
    approvePerm = await prisma.permission.create({
      data: { key: "booking:approve" },
    });
  }
  if (adminRole && approvePerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: approvePerm.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: approvePerm.id },
    });
  }

  // Login as operator
  const opLogin = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: operatorEmail, password: operatorPassword }),
  });
  const opToken = (await opLogin.json()).accessToken;

  // (debug /auth/me removed)

  // Try approve as operator (should have booking:approve via ADMIN role)
  const res2 = await fetch(`http://localhost:3000/bookings/${booking.id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${opToken}` },
  });
  console.log("Approve with ADMIN status (expect 200 or 409):", res2.status);
  console.log(await res2.json());

  console.log("Booking permissions test complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
