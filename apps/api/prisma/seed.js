require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

async function main() {
  const permissions = [
    "user:read",
    "user:assign-role",
    // trip permissions
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:approve",
    "trip:publish",
    "trip:archive",
    "trip:view:internal",
    "trip:view:public",
    // booking permissions
    "booking:create",
    "booking:approve",
    "booking:reject",
    "booking:cancel",
    "booking:view",
    "booking:read:admin",
    "blog:create",
    "blog:approve",
    "audit:read",
    // Admin management permissions
    "user:list",
    "user:view",
    "user:assign-role",
    "user:remove-role",
    "role:list",
  ];

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "System super administrator",
      isSystem: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create standard roles and assign trip-related permissions
  const uploaderRole = await prisma.role.upsert({
    where: { name: "UPLOADER" },
    update: {},
    create: {
      name: "UPLOADER",
      description: "Can create and edit draft trips",
      isSystem: false,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Admin role", isSystem: false },
  });

  const publicRole = await prisma.role.upsert({
    where: { name: "PUBLIC" },
    update: {},
    create: { name: "PUBLIC", description: "Public visitors", isSystem: false },
  });

  // helper to grant permission keys to a role
  async function grantPermissionsToRole(role, keys) {
    for (const key of keys) {
      const p = await prisma.permission.findUnique({ where: { key } });
      if (!p) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id },
      });
    }
  }

  // Assign suggested mappings
  await grantPermissionsToRole(uploaderRole, [
    "trip:create",
    "trip:edit",
    "trip:submit",
  ]);
  await grantPermissionsToRole(adminRole, [
    "trip:approve",
    "trip:publish",
    "trip:archive",
    // booking admin reads
    "booking:read:admin",
  ]);
  await grantPermissionsToRole(publicRole, ["trip:view:public"]);

  // Booking-related grants
  await grantPermissionsToRole(publicRole, ["booking:create", "booking:view"]);
  await grantPermissionsToRole(uploaderRole, ["booking:view"]);
  await grantPermissionsToRole(adminRole, [
    "booking:approve",
    "booking:reject",
    "booking:cancel",
    "booking:view",
  ]);

  // Seed a sensible default capacity for existing trips
  await prisma.trip.updateMany({ data: { capacity: 10 } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
