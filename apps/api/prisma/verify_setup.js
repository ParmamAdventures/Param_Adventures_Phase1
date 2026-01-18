#!/usr/bin/env node
/**
 * Verification Script - Confirm All Demo Data is Properly Configured
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifySetup() {
  console.log("\n" + "=".repeat(80));
  console.log("✅ VERIFICATION: Demo Data Setup");
  console.log("=".repeat(80) + "\n");

  try {
    // 1. Check Users
    console.log("1️⃣  USERS:");
    const users = await prisma.user.findMany({
      select: { email: true, name: true, status: true },
    });
    console.log(`   ✅ ${users.length} users created`);
    for (const user of users) {
      console.log(`      • ${user.name} (${user.email}) - ${user.status}`);
    }

    // 2. Check Roles
    console.log("\n2️⃣  ROLES:");
    const roles = await prisma.role.findMany({
      include: { _count: { select: { permissions: true } } },
    });
    console.log(`   ✅ ${roles.length} roles with permissions:`);
    for (const role of roles) {
      console.log(`      • ${role.name} - ${role._count.permissions} permissions`);
    }

    // 3. Check Permissions
    console.log("\n3️⃣  PERMISSIONS:");
    const permissions = await prisma.permission.findMany();
    console.log(`   ✅ ${permissions.length} permissions configured`);
    const keyPermissions = ["admin:dashboard", "admin:trips", "content:create", "user:book"];
    for (const key of keyPermissions) {
      const exists = permissions.some((p) => p.key === key);
      console.log(`      • ${key}: ${exists ? "✅ YES" : "❌ MISSING"}`);
    }

    // 4. Check Trips
    console.log("\n4️⃣  TRIPS:");
    const tripStats = await prisma.trip.groupBy({
      by: ["status"],
      _count: true,
    });
    let totalTrips = 0;
    let publishedTrips = 0;
    for (const stat of tripStats) {
      console.log(`      • ${stat.status}: ${stat._count} trips`);
      totalTrips += stat._count;
      if (stat.status === "PUBLISHED") publishedTrips = stat._count;
    }
    console.log(`   ✅ Total: ${totalTrips} trips (${publishedTrips} published)`);

    // 5. Check Blogs
    console.log("\n5️⃣  BLOG POSTS:");
    const blogStats = await prisma.blog.groupBy({
      by: ["status"],
      _count: true,
    });
    let totalBlogs = 0;
    let publishedBlogs = 0;
    for (const stat of blogStats) {
      console.log(`      • ${stat.status}: ${stat._count} blogs`);
      totalBlogs += stat._count;
      if (stat.status === "PUBLISHED") publishedBlogs = stat._count;
    }
    console.log(`   ✅ Total: ${totalBlogs} blogs (${publishedBlogs} published)`);

    // 6. Check Admin Access
    console.log("\n6️⃣  ADMIN ACCESS CHECK:");
    const admin = await prisma.user.findUnique({
      where: { email: "admin@paramadventures.com" },
      include: {
        roles: {
          include: { role: { include: { permissions: true } } },
        },
      },
    });
    if (admin && admin.roles.length > 0) {
      const adminRole = admin.roles[0].role;
      console.log(`   ✅ Admin user exists: ${admin.name}`);
      console.log(`      • Role: ${adminRole.name}`);
      console.log(`      • Permissions: ${adminRole.permissions.length} assigned`);
    }

    // 7. Summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));

    const status = {
      users: users.length >= 6 ? "✅" : "⚠️",
      roles: roles.length >= 4 ? "✅" : "⚠️",
      permissions: permissions.length >= 9 ? "✅" : "⚠️",
      trips: publishedTrips >= 7 ? "✅" : "⚠️",
      blogs: publishedBlogs >= 5 ? "✅" : "⚠️",
    };

    console.log(`\n${status.users} Users: ${users.length}/6 demo users`);
    console.log(`${status.roles} Roles: ${roles.length}/4 roles configured`);
    console.log(`${status.permissions} Permissions: ${permissions.length}/9 permissions`);
    console.log(`${status.trips} Trips: ${publishedTrips}/7 published trips`);
    console.log(`${status.blogs} Blogs: ${publishedBlogs}/5 published blogs`);

    const allGood = Object.values(status).every((s) => s === "✅");

    console.log("\n" + "=".repeat(80));
    if (allGood) {
      console.log("🎉 ALL SYSTEMS READY! Demo is fully configured and operational.");
      console.log("\n📋 NEXT STEPS:");
      console.log("   1. Start the API: cd apps/api && npm run dev");
      console.log("   2. Start the Web: cd apps/web && npm run dev");
      console.log("   3. Open: http://localhost:3000");
      console.log("   4. Login with demo credentials from CREDENTIALS.md");
    } else {
      console.log("⚠️  Some components are missing. Run seed scripts to fix.");
      console.log("\n   Run: node apps/api/prisma/seed_demo_data.js");
    }
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ Verification Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
