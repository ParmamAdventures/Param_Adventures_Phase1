const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Broad patterns to match common test accounts created by scripts
const patterns = [
  "test+",
  "test@",
  "auto+",
  "admin+",
  "target+",
  "normal+",
  "uploader+",
  "uploader-draft",
  "booking-test-",
  "join-test-",
  "user-no-perm-",
  "operator-",
  "alist-",
  "alist-user-",
  "capacity-test-",
  "a-user",
  "perm-creator-",
  "creator-",
  "u1-",
  "u2-",
  "admin-list-",
];

function buildWhere() {
  return {
    OR: patterns.map((p) => ({ email: { contains: p } })),
  };
}

async function run() {
  const confirm = process.argv.includes("--yes");

  const superRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  const superAdminIds = superRole
    ? (
        await prisma.userRole.findMany({
          where: { roleId: superRole.id },
          select: { userId: true },
        })
      ).map((r) => r.userId)
    : [];

  const where = buildWhere();

  // Exclude local.test and super admins
  const candidates = await prisma.user.findMany({
    where: {
      AND: [
        where,
        { email: { not: { contains: "local.test" } } },
        { id: { notIn: superAdminIds } },
      ],
    },
  });

  if (!candidates.length) {
    console.log(
      "No candidate test users found to remove (excluding SUPER_ADMINs and local.test)."
    );
    await prisma.$disconnect();
    return;
  }

  console.log(
    "Found",
    candidates.length,
    "candidate users to remove (excluding SUPER_ADMINs):"
  );
  candidates.forEach((u) => console.log(" -", u.email, u.id));

  if (!confirm) {
    console.log(
      "Run this script with --yes to delete the above users and their bookings/roles/trips."
    );
    await prisma.$disconnect();
    return;
  }

  const ids = candidates.map((u) => u.id);

  // Delete bookings belonging to these users
  const bDel = await prisma.booking
    .deleteMany({ where: { userId: { in: ids } } })
    .catch(() => ({ count: 0 }));
  console.log(`Deleted ${bDel.count ?? 0} bookings for candidate users.`);

  // Delete trips created by these users (and bookings for those trips)
  const trips = await prisma.trip.findMany({
    where: { createdById: { in: ids } },
    select: { id: true },
  });
  const tripIds = trips.map((t) => t.id);
  if (tripIds.length) {
    const tbDel = await prisma.booking
      .deleteMany({ where: { tripId: { in: tripIds } } })
      .catch(() => ({ count: 0 }));
    console.log(
      `Deleted ${tbDel.count ?? 0} bookings for ${tripIds.length} trips created by candidates.`
    );
    const tDel = await prisma.trip
      .deleteMany({ where: { id: { in: tripIds } } })
      .catch(() => ({ count: 0 }));
    console.log(`Deleted ${tDel.count ?? 0} trips created by candidates.`);
  }

  // Remove user roles
  const urDel = await prisma.userRole
    .deleteMany({ where: { userId: { in: ids } } })
    .catch(() => ({ count: 0 }));
  console.log(`Removed ${urDel.count ?? 0} user-role relations.`);

  // Finally delete users
  const uDel = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Deleted ${uDel.count} users.`);

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
