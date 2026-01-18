/**
 * Fix Admin Access - Setup Complete Permission System
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixAdminAccess() {
  console.log("\n" + "=".repeat(70));
  console.log("🔧 FIXING ADMIN ACCESS - SETTING UP PERMISSIONS");
  console.log("=".repeat(70) + "\n");

  try {
    // 1. Create all permissions
    console.log("1️⃣  Creating permissions...");

    const permissionsData = [
      { key: "admin:dashboard", description: "Access admin dashboard" },
      { key: "admin:users", description: "Manage users" },
      { key: "admin:trips", description: "Manage trips" },
      { key: "admin:bookings", description: "View bookings" },
      { key: "admin:blogs", description: "Manage blog posts" },
      { key: "user:book", description: "Book trips" },
      { key: "user:view_bookings", description: "View own bookings" },
      { key: "user:profile", description: "Update profile" },
      { key: "public:view", description: "View public content" },
    ];

    const permissions = [];
    for (const permData of permissionsData) {
      const perm = await prisma.permission.upsert({
        where: { key: permData.key },
        update: {},
        create: permData,
      });
      permissions.push(perm);
      console.log(`   ✅ ${perm.key}`);
    }

    // 2. Get or create ADMIN role
    console.log("\n2️⃣  Setting up ADMIN role...");

    const adminRole = await prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN" },
    });
    console.log(`   ✅ ADMIN role exists`);

    // 3. Assign all permissions to ADMIN role
    console.log("\n3️⃣  Assigning permissions to ADMIN role...");

    // Remove existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: adminRole.id },
    });
    console.log(`   Cleared existing permissions`);

    // Add all permissions to admin role
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`   ✅ Added ${permission.key}`);
    }

    // 4. Ensure admin user has ADMIN role
    console.log("\n4️⃣  Verifying admin user role assignment...");

    const admin = await prisma.user.findUnique({
      where: { email: "admin@paramadventures.com" },
      include: { roles: true },
    });

    if (!admin) {
      console.log("   ❌ Admin user not found!");
      return;
    }

    const hasAdminRole = admin.roles.some((ur) => ur.roleId === adminRole.id);

    if (!hasAdminRole) {
      await prisma.userRole.create({
        data: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      });
      console.log(`   ✅ Assigned ADMIN role to ${admin.email}`);
    } else {
      console.log(`   ✅ Admin already has ADMIN role`);
    }

    // 5. Create other roles (if needed)
    console.log("\n5️⃣  Setting up USER role...");

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER" },
    });

    // Remove existing permissions from USER role
    await prisma.rolePermission.deleteMany({
      where: { roleId: userRole.id },
    });

    // Assign user permissions
    const userPerms = ["user:book", "user:view_bookings", "user:profile", "public:view"];
    for (const permKey of userPerms) {
      const perm = permissions.find((p) => p.key === permKey);
      if (perm) {
        await prisma.rolePermission.create({
          data: {
            roleId: userRole.id,
            permissionId: perm.id,
          },
        });
      }
    }
    console.log(`   ✅ USER role configured`);

    // 6. Final verification
    console.log("\n6️⃣  FINAL VERIFICATION:");

    const adminFinal = await prisma.user.findUnique({
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

    console.log(`\n   Admin: ${adminFinal.name}`);
    console.log(`   Status: ${adminFinal.status}`);
    console.log(`   Roles:`);
    for (const ur of adminFinal.roles) {
      console.log(`     - ${ur.role.name}`);
      const permKeys = ur.role.permissions.map((rp) => rp.permission.key);
      console.log(`       Permissions (${permKeys.length}): ${permKeys.join(", ")}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ ADMIN ACCESS FIXED!");
    console.log("=".repeat(70));
    console.log("\n✨ Changes made:");
    console.log("   ✅ Created 9 permissions");
    console.log("   ✅ Setup ADMIN role with all permissions");
    console.log("   ✅ Setup USER role with user permissions");
    console.log("   ✅ Verified admin user role assignment");
    console.log("\n🚀 Admin dashboard and trips should now be accessible!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminAccess();
