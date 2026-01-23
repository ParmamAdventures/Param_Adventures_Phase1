#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const routePermissionKeys = [
  // Analytics & metrics
  "analytics:view",
  "metrics:read",

  // Admin bookings
  "booking:read:admin",
  "booking:approve",
  "booking:reject",

  // Trip lifecycle
  "trip:edit",
  "trip:submit",
  "trip:approve",
  "trip:archive",
  "trip:update-status",
  "trip:assign-guide",
  "trip:assign-manager",

  // Blog moderation
  "blog:submit",
  "blog:approve",
  "blog:reject",
  "blog:publish",
  "blog:view:internal",

  // User management granular
  "user:edit",
  "user:assign-role",
  "user:remove-role",

  // Role management granular
  "role:assign",

  // Existing keys that may be missing in some DBs
  "media:manage",
];

async function main() {
  console.log("\n🔄 Syncing route permission keys to database...\n");

  try {
    // Upsert permissions
    const created: Record<string, string> = {};
    for (const key of routePermissionKeys) {
      const p = await prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: key },
      });
      created[key] = p.id;
    }
    console.log(`✅ Upserted ${routePermissionKeys.length} permissions`);

    // Fetch roles
    const superAdmin = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
    const admin = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    const tripManager = await prisma.role.findUnique({ where: { name: "TRIP_MANAGER" } });
    const tripGuide = await prisma.role.findUnique({ where: { name: "TRIP_GUIDE" } });
    const uploader = await prisma.role.findUnique({ where: { name: "UPLOADER" } });
    const user = await prisma.role.findUnique({ where: { name: "USER" } });

    if (!superAdmin || !admin || !tripManager || !tripGuide || !uploader || !user) {
      throw new Error("Roles missing — run scripts/fix-complete-roles.ts first");
    }

    // Helper to assign a list safely
    async function assign(roleId: string, keys: string[]) {
      for (const key of keys) {
        const permissionId = created[key];
        if (!permissionId) continue;
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          update: {},
          create: { roleId, permissionId },
        });
      }
    }

    // SUPER_ADMIN: all route keys
    await assign(superAdmin.id, routePermissionKeys);

    // ADMIN: all except destructive ops and role assignment
    const adminKeys = routePermissionKeys.filter(
      (k) =>
        ![
          "user:delete",
          "role:delete",
          "booking:refund",
          "role:assign",
          "user:assign-role",
          "user:remove-role",
        ].includes(k),
    );
    await assign(admin.id, adminKeys);

    // TRIP_MANAGER: operational trip keys (no approve/publish/update-status), media manage, booking read/update/cancel
    const tripManagerKeys = [
      "trip:edit",
      "trip:submit",
      "trip:assign-guide",
      "trip:assign-manager",
      "trip:archive",
      "media:manage",
    ];
    await assign(tripManager.id, tripManagerKeys);

    // TRIP_GUIDE: minimal — none of the new route keys beyond existing
    // UPLOADER, USER: no changes here

    console.log("\n✅ Permissions synced to roles successfully\n");

    // Quick summary
    const roles = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });
    for (const r of roles) {
      console.log(`${r.name}: ${r.permissions.length} permissions`);
    }
  } catch (err) {
    console.error("❌ Sync failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
