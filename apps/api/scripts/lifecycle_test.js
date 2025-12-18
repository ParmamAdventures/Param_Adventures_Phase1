// Authenticated lifecycle test for trips
// Requires API running at http://localhost:3000

const BASE = process.env.BASE || "http://localhost:3000";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }
  return { status: res.status, body };
}

async function register(email, password, name) {
  return req("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
}

// seed roles/permissions directly via Prisma so test users get needed permissions
async function seedRoles(prisma, uploaderUser, adminUser) {
  const perms = [
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:approve",
    "trip:publish",
    "trip:archive",
    "trip:view:internal",
    "trip:view:public",
  ];

  // upsert permissions
  const permMap = {};
  for (const key of perms) {
    const p = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key },
    });
    permMap[key] = p;
  }

  // create or get roles
  const uploaderRole = await prisma.role.upsert({
    where: { name: "UPLOADER" },
    update: {},
    create: { name: "UPLOADER", isSystem: false },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", isSystem: false },
  });

  // map permissions to roles
  const mapPerms = async (role, keys) => {
    for (const k of keys) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permMap[k].id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permMap[k].id },
      });
    }
  };

  await mapPerms(uploaderRole, [
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:view:public",
  ]);
  await mapPerms(adminRole, [
    "trip:approve",
    "trip:publish",
    "trip:archive",
    "trip:view:internal",
    "trip:view:public",
  ]);

  // assign roles to users
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: uploaderUser.id, roleId: uploaderRole.id },
    },
    update: {},
    create: { userId: uploaderUser.id, roleId: uploaderRole.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });
}

async function login(email, password) {
  // login returns cookie; fetch keeps cookies only if using global agent; we will use the login endpoint to obtain tokens via JSON response if available
  return req("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

function expect(status, got, msg) {
  if (status !== got)
    throw new Error(`Expected ${status} but got ${got} (${msg || ""})`);
}

const { PrismaClient } = require("@prisma/client");

(async () => {
  console.log("Lifecycle test starting");

  const uploaderEmail = `uploader+test.${Date.now()}@example.com`;
  const adminEmail = `admin+test.${Date.now()}@example.com`;
  const password = "Password123!";

  console.log("Register uploader");
  let r = await register(uploaderEmail, password, "Uploader Test");
  expect(201, r.status, "register uploader");

  console.log("Register admin");
  r = await register(adminEmail, password, "Admin Test");
  expect(201, r.status, "register admin");

  console.log("Login uploader");
  r = await login(uploaderEmail, password);
  expect(200, r.status, "login uploader");

  console.log("Login admin");
  r = await login(adminEmail, password);
  expect(200, r.status, "login admin");

  // seed roles/permissions via Prisma and assign to newly created users
  const prisma = new PrismaClient();
  const uploaderUser = await prisma.user.findUnique({
    where: { email: uploaderEmail },
  });
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!uploaderUser || !adminUser)
    throw new Error("Test users not found in DB");
  await seedRoles(prisma, uploaderUser, adminUser);

  // re-login to obtain tokens (if login returns tokens)
  const loginUploader = await login(uploaderEmail, password);
  const loginAdmin = await login(adminEmail, password);
  const uploaderToken = loginUploader.body?.accessToken || null;
  const adminToken = loginAdmin.body?.accessToken || null;

  const authHeaderUploader = uploaderToken
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${uploaderToken}`,
      }
    : { "Content-Type": "application/json" };
  const authHeaderAdmin = adminToken
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      }
    : { "Content-Type": "application/json" };

  // Create trip (Uploader)
  console.log("Create trip (uploader)");
  r = await req("/trips", {
    method: "POST",
    headers: authHeaderUploader,
    body: JSON.stringify({
      title: "Test Trip",
      slug: `test-trip-${Date.now()}`,
      description: "desc",
      itinerary: {},
      durationDays: 3,
      difficulty: "easy",
      location: "Nowhere",
      price: 100,
    }),
  });
  expect(201, r.status, "create trip");
  const trip = r.body;

  // Edit draft (uploader)
  console.log("Edit draft (uploader)");
  r = await req(`/trips/${trip.id}`, {
    method: "PUT",
    headers: authHeaderUploader,
    body: JSON.stringify({ description: "updated" }),
  });
  expect(200, r.status, "edit draft");

  // Submit (uploader)
  console.log("Submit trip (uploader)");
  r = await req(`/trips/${trip.id}/submit`, {
    method: "POST",
    headers: authHeaderUploader,
  });
  expect(200, r.status, "submit");

  // Approve (admin)
  console.log("Approve trip (admin)");
  r = await req(`/trips/${trip.id}/approve`, {
    method: "POST",
    headers: authHeaderAdmin,
  });
  expect(200, r.status, "approve");

  // Publish (admin)
  console.log("Publish trip (admin)");
  r = await req(`/trips/${trip.id}/publish`, {
    method: "POST",
    headers: authHeaderAdmin,
  });
  expect(200, r.status, "publish");

  // Archive (admin)
  console.log("Archive trip (admin)");
  r = await req(`/trips/${trip.id}/archive`, {
    method: "POST",
    headers: authHeaderAdmin,
  });
  expect(200, r.status, "archive");

  // Skip states: try publish directly from DRAFT (should be 403)
  console.log("Skip state test (create new draft and try publish)");
  r = await req("/trips", {
    method: "POST",
    headers: authHeaderUploader,
    body: JSON.stringify({
      title: "SkipTest",
      slug: `skip-${Date.now()}`,
      description: "d",
      itinerary: {},
      durationDays: 1,
      difficulty: "easy",
      location: "X",
      price: 1,
    }),
  });
  expect(201, r.status, "create skip");
  const skipTrip = r.body;
  r = await req(`/trips/${skipTrip.id}/publish`, {
    method: "POST",
    headers: authHeaderAdmin,
  });
  if (r.status === 200) throw new Error("Skip state allowed unexpectedly");
  console.log("Skip state correctly denied with status", r.status);

  console.log("Public list (should include published trips)");
  r = await req("/trips/public");
  expect(200, r.status, "public list");

  console.log("Internal list without permission (should be 401/403)");
  r = await req("/trips/internal");
  if (![401, 403].includes(r.status))
    throw new Error("internal list did not deny unauthenticated");

  console.log("Lifecycle test completed successfully");
})();
