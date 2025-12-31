const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Matches common test-user patterns used by the repo's scripts.
const patterns = [
  "alist-",
  "alist-user-",
  "capacity-test-",
  "u1-",
  "u2-",
  "creator-",
  "a-user1-",
  "a-user2-",
  "admin-list-",
  "admin-",
  "alist-creator-",
  "alist-",
];

function buildWhere() {
  return {
    OR: patterns.map((p) => ({ email: { contains: p } })),
  };
}

async function run() {
  const confirm = process.argv.includes("--yes");

  const where = buildWhere();

  // Exclude any local.test addresses (keep admin@local.test)
  const candidates = await prisma.user.findMany({
    where: { AND: [where, { email: { not: { contains: "local.test" } } }] },
  });

  if (!candidates.length) {
    console.log("No candidate test users found to remove.");
    await prisma.$disconnect();
    return;
  }

  console.log("Found", candidates.length, "candidate users:");
  candidates.forEach((u) => console.log(" -", u.email, u.id));

  if (!confirm) {
    console.log("Run this script with --yes to delete the above users and their bookings/roles.");
    await prisma.$disconnect();
    return;
  }

  const ids = candidates.map((u) => u.id);

  console.log("Deleting bookings for candidate users...");
  await prisma.booking.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});

  // Delete trips created by these users (and bookings for those trips)
  console.log("Finding trips created by candidate users...");
  const trips = await prisma.trip.findMany({
    where: { createdById: { in: ids } },
    select: { id: true },
  });
  const tripIds = trips.map((t) => t.id);
  if (tripIds.length) {
    console.log(`Deleting bookings for ${tripIds.length} trips created by candidates...`);
    await prisma.booking.deleteMany({ where: { tripId: { in: tripIds } } }).catch(() => {});
    console.log("Deleting trips created by candidates...");
    await prisma.trip.deleteMany({ where: { id: { in: tripIds } } }).catch(() => {});
  }

  console.log("Removing user roles for candidate users...");
  await prisma.userRole.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});

  console.log("Deleting candidate users...");
  const del = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Deleted ${del.count} users.`);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
