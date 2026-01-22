#!/usr/bin/env node

/**
 * Complete Role Structure Fix
 * Creates the 6 correct roles as per original design:
 * 1. SUPER_ADMIN - Full system access
 * 2. ADMIN - Full admin panel access
 * 3. TRIP_MANAGER - Trip & booking management
 * 4. TRIP_GUIDE - Assigned trips management
 * 5. UPLOADER - Media library management
 * 6. USER - Regular user access
 */

import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔧 FIXING COMPLETE ROLE STRUCTURE...\n");

  try {
    // 1. Delete all duplicate/incorrect roles (keeping data intact)
    console.log("📋 Step 1: Removing duplicate/incorrect roles...");

    const rolesToDelete = ["admin", "user", "organizer", "CONTENT_CREATOR", "GUIDE"];

    for (const roleName of rolesToDelete) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (role) {
        // First delete role permissions
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
        // Then delete user roles
        await prisma.userRole.deleteMany({ where: { roleId: role.id } });
        // Finally delete the role
        await prisma.role.delete({ where: { name: roleName } });
        console.log(`  ✅ Deleted: ${roleName}`);
      }
    }

    // 2. Create correct 6 roles
    console.log("\n📝 Step 2: Creating 6 correct roles...\n");

    const roles = {
      superAdmin: await prisma.role.upsert({
        where: { name: "SUPER_ADMIN" },
        update: { description: "Super Administrator - Full system access" },
        create: {
          name: "SUPER_ADMIN",
          description: "Super Administrator - Full system access",
          isSystem: true,
        },
      }),
      admin: await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: { description: "Administrator - Full admin panel access" },
        create: {
          name: "ADMIN",
          description: "Administrator - Full admin panel access",
          isSystem: true,
        },
      }),
      tripManager: await prisma.role.upsert({
        where: { name: "TRIP_MANAGER" },
        update: { description: "Trip Manager - Trip & booking management" },
        create: {
          name: "TRIP_MANAGER",
          description: "Trip Manager - Trip & booking management",
          isSystem: true,
        },
      }),
      tripGuide: await prisma.role.upsert({
        where: { name: "TRIP_GUIDE" },
        update: { description: "Trip Guide - Assigned trips management" },
        create: {
          name: "TRIP_GUIDE",
          description: "Trip Guide - Assigned trips management",
          isSystem: true,
        },
      }),
      uploader: await prisma.role.upsert({
        where: { name: "UPLOADER" },
        update: { description: "Uploader - Media library management" },
        create: {
          name: "UPLOADER",
          description: "Uploader - Media library management",
          isSystem: true,
        },
      }),
      user: await prisma.role.upsert({
        where: { name: "USER" },
        update: { description: "Regular User - Basic user access", isSystem: false },
        create: {
          name: "USER",
          description: "Regular User - Basic user access",
          isSystem: false,
        },
      }),
    };

    console.log("✅ All 6 roles created successfully!");

    // 3. Create all permissions
    console.log("\n🔐 Step 3: Creating permissions...\n");

    const permissionsData = [
      // Trip permissions
      { key: "trip:create", description: "Create new trips", category: "trips" },
      { key: "trip:read", description: "Read/View trips", category: "trips" },
      { key: "trip:update", description: "Update trips", category: "trips" },
      { key: "trip:delete", description: "Delete trips", category: "trips" },
      { key: "trip:publish", description: "Publish trips", category: "trips" },
      { key: "trip:view:internal", description: "View internal/draft trips", category: "trips" },
      { key: "trip:assign-guide", description: "Assign guides to trips", category: "trips" },
      { key: "trip:assign-manager", description: "Assign managers to trips", category: "trips" },

      // Booking permissions
      { key: "booking:read", description: "View bookings", category: "bookings" },
      { key: "booking:create", description: "Create bookings", category: "bookings" },
      { key: "booking:update", description: "Update bookings", category: "bookings" },
      { key: "booking:cancel", description: "Cancel bookings", category: "bookings" },
      { key: "booking:refund", description: "Process refunds", category: "bookings" },
      { key: "booking:manage", description: "Manage all bookings", category: "bookings" },

      // User permissions
      { key: "user:list", description: "List users", category: "users" },
      { key: "user:create", description: "Create users", category: "users" },
      { key: "user:read", description: "Read user details", category: "users" },
      { key: "user:update", description: "Update user details", category: "users" },
      { key: "user:delete", description: "Delete users", category: "users" },
      { key: "user:manage", description: "Manage users (all operations)", category: "users" },
      { key: "user:ban", description: "Ban/suspend users", category: "users" },

      // Blog permissions
      { key: "blog:create", description: "Create blog posts", category: "blogs" },
      { key: "blog:read", description: "Read blog posts", category: "blogs" },
      { key: "blog:update", description: "Update blog posts", category: "blogs" },
      { key: "blog:delete", description: "Delete blog posts", category: "blogs" },

      // Media permissions
      { key: "media:upload", description: "Upload media files", category: "media" },
      { key: "media:read", description: "View/Download media", category: "media" },
      { key: "media:update", description: "Update media details", category: "media" },
      { key: "media:delete", description: "Delete media", category: "media" },
      { key: "media:manage", description: "Manage media library", category: "media" },

      // Review permissions
      { key: "review:read", description: "Read reviews", category: "reviews" },
      { key: "review:moderate", description: "Moderate reviews", category: "reviews" },
      { key: "review:delete", description: "Delete reviews", category: "reviews" },

      // Admin permissions
      { key: "admin:dashboard", description: "Access admin dashboard", category: "admin" },
      { key: "admin:access", description: "Access admin panel", category: "admin" },
      { key: "admin:settings", description: "Manage system settings", category: "admin" },
      { key: "admin:audit", description: "View audit logs", category: "admin" },

      // Role permissions
      { key: "role:list", description: "List roles", category: "roles" },
      { key: "role:create", description: "Create roles", category: "roles" },
      { key: "role:update", description: "Update roles", category: "roles" },
      { key: "role:delete", description: "Delete roles", category: "roles" },
      { key: "role:manage", description: "Manage roles", category: "roles" },

      // Content permissions
      { key: "content:manage", description: "Manage site content", category: "content" },
      { key: "blog:update", description: "Update blog", category: "content" },
      { key: "media:view", description: "View media library", category: "content" },
    ];

    const permissions: Record<string, { id: string }> = {};

    for (const permData of permissionsData) {
      const perm = await prisma.permission.upsert({
        where: { key: permData.key },
        update: { category: permData.category },
        create: permData,
      });
      permissions[permData.key] = perm;
    }

    console.log(`✅ Created ${Object.keys(permissions).length} permissions\n`);

    // 4. Assign permissions to each role
    console.log("🔗 Step 4: Assigning permissions to roles...\n");

    // SUPER_ADMIN gets ALL permissions
    console.log("  • SUPER_ADMIN: All permissions");
    for (const perm of Object.values(permissions)) {
      await prisma.rolePermission.create({
        data: { roleId: roles.superAdmin.id, permissionId: perm.id },
      });
    }

    // ADMIN gets all except user:delete and role:delete
    console.log("  • ADMIN: All except user:delete and role:delete");
    const adminPermissionKeys = Object.keys(permissions).filter(
      (k) => k !== "user:delete" && k !== "role:delete" && k !== "booking:refund",
    );
    for (const key of adminPermissionKeys) {
      await prisma.rolePermission.create({
        data: { roleId: roles.admin.id, permissionId: permissions[key].id },
      });
    }

    // TRIP_MANAGER: Trip & booking management
    console.log("  • TRIP_MANAGER: Trip and booking management");
    const tripManagerPermissionKeys = [
      "trip:read",
      "trip:create",
      "trip:update",
      "trip:view:internal",
      "trip:assign-guide",
      "booking:read",
      "booking:create",
      "booking:update",
      "booking:cancel",
      "media:upload",
      "media:read",
      "media:manage",
      "user:read",
    ];
    for (const key of tripManagerPermissionKeys) {
      if (permissions[key]) {
        await prisma.rolePermission.create({
          data: { roleId: roles.tripManager.id, permissionId: permissions[key].id },
        });
      }
    }

    // TRIP_GUIDE: View & update assigned trips
    console.log("  • TRIP_GUIDE: Assigned trips management");
    const tripGuidePermissionKeys = [
      "trip:read",
      "trip:view:internal",
      "booking:read",
      "booking:update",
      "review:moderate",
      "media:upload",
      "media:read",
    ];
    for (const key of tripGuidePermissionKeys) {
      if (permissions[key]) {
        await prisma.rolePermission.create({
          data: { roleId: roles.tripGuide.id, permissionId: permissions[key].id },
        });
      }
    }

    // UPLOADER: Media management only
    console.log("  • UPLOADER: Media library management");
    const uploaderPermissionKeys = [
      "media:upload",
      "media:read",
      "media:update",
      "media:delete",
      "media:manage",
    ];
    for (const key of uploaderPermissionKeys) {
      if (permissions[key]) {
        await prisma.rolePermission.create({
          data: { roleId: roles.uploader.id, permissionId: permissions[key].id },
        });
      }
    }

    // USER: Basic read-only access
    console.log("  • USER: Basic user access\n");
    const userPermissionKeys = [
      "trip:read",
      "blog:read",
      "review:read",
      "media:read",
      "booking:read",
    ];
    for (const key of userPermissionKeys) {
      if (permissions[key]) {
        await prisma.rolePermission.create({
          data: { roleId: roles.user.id, permissionId: permissions[key].id },
        });
      }
    }

    // 5. Display final summary
    console.log("✅ ROLE STRUCTURE FIXED SUCCESSFULLY!\n");
    console.log("📊 Final Role Summary:\n");

    const rolesSummary = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });

    for (const role of rolesSummary) {
      console.log(`  ${role.name}`);
      console.log(`    Description: ${role.description}`);
      console.log(`    System Role: ${role.isSystem ? "Yes" : "No"}`);
      console.log(`    Permissions: ${role.permissions.length}`);
      console.log("");
    }

    // 6. Show user assignments
    console.log("👥 User-Role Assignments:\n");

    const users = await prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });

    for (const user of users) {
      const roleNames = user.roles.map((ur) => ur.role.name).join(", ");
      console.log(`  ${user.email}: ${roleNames || "(no roles)"}`);
    }

    console.log("\n✅ COMPLETE! Role structure is now correct.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
