/**
 * Diagnostic Script - Check Admin Access & Trip Status
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function diagnose() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 DIAGNOSTIC: ADMIN ACCESS & TRIPS STATUS");
  console.log("=".repeat(70) + "\n");

  try {
    // 1. Check Admin User & Roles
    console.log("1️⃣  ADMIN USER CHECK:");
    const admin = await prisma.user.findUnique({
      where: { email: "admin@paramadventures.com" },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!admin) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log(`   ✅ Admin found: ${admin.name} (${admin.email})`);
    console.log(`   Status: ${admin.status}`);
    console.log(`\n   Assigned Roles:`);

    if (admin.roles.length === 0) {
      console.log("   ⚠️  NO ROLES ASSIGNED!");
    } else {
      for (const ur of admin.roles) {
        console.log(`     - ${ur.role.name}`);
        console.log(
          `       Permissions: ${ur.role.permissions.map((rp) => rp.permission.key).join(", ") || "NONE"}`,
        );
      }
    }

    // 2. Check Trips Status
    console.log("\n2️⃣  TRIPS STATUS CHECK:");
    const tripStats = await prisma.trip.groupBy({
      by: ["status"],
      _count: true,
    });

    console.log(`   Total trips by status:`);
    for (const stat of tripStats) {
      console.log(`     - ${stat.status}: ${stat._count}`);
    }

    // 3. Check Published Trips
    console.log("\n3️⃣  PUBLISHED TRIPS CHECK:");
    const publishedTrips = await prisma.trip.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, status: true },
    });

    if (publishedTrips.length === 0) {
      console.log("   ❌ NO PUBLISHED TRIPS FOUND!");
      console.log("\n   Fetching all trips to show their status:");
      const allTrips = await prisma.trip.findMany({
        select: { id: true, title: true, slug: true, status: true },
      });
      for (const trip of allTrips) {
        console.log(`     - ${trip.title} (${trip.status})`);
      }
    } else {
      console.log(`   ✅ Found ${publishedTrips.length} published trips:`);
      for (const trip of publishedTrips) {
        console.log(`     - ${trip.title}`);
      }
    }

    // 4. Check Permissions Table
    console.log("\n4️⃣  PERMISSIONS IN DATABASE:");
    const permissions = await prisma.permission.findMany({
      select: { key: true },
    });

    const hasAdminDash = permissions.some((p) => p.key === "admin:dashboard");
    const adminPerm = permissions.find((p) => p.key === "admin:dashboard");

    console.log(`   Total permissions: ${permissions.length}`);
    console.log(`   admin:dashboard permission exists: ${hasAdminDash ? "✅ YES" : "❌ NO"}`);

    if (!hasAdminDash) {
      console.log("\n   ⚠️  Missing admin:dashboard permission!");
      console.log("   Available permissions:");
      for (const perm of permissions.slice(0, 10)) {
        console.log(`     - ${perm.key}`);
      }
    }

    // 5. Summary
    console.log("\n" + "=".repeat(70));
    console.log("📋 SUMMARY & FIXES:");
    console.log("=".repeat(70));

    const issues = [];

    if (admin.roles.length === 0) {
      issues.push("❌ Admin has no roles assigned");
    }

    const adminHasDashPerm = admin.roles.some((ur) =>
      ur.role.permissions.some((rp) => rp.permission.key === "admin:dashboard"),
    );

    if (!adminHasDashPerm) {
      issues.push("❌ Admin doesn't have admin:dashboard permission");
    }

    if (publishedTrips.length === 0) {
      issues.push("❌ No trips have PUBLISHED status");
    }

    if (issues.length === 0) {
      console.log("\n✅ All systems look good!");
      console.log("   - Admin has roles assigned");
      console.log("   - Admin has dashboard permission");
      console.log("   - Trips are published");
    } else {
      console.log("\n🔧 ISSUES FOUND:\n");
      for (const issue of issues) {
        console.log(`   ${issue}`);
      }

      console.log("\n💡 RECOMMENDED FIXES:\n");
      console.log("   Run: node apps/api/prisma/fix_admin_access.js\n");
    }

    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
