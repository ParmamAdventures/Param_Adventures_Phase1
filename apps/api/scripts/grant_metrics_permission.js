require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    const key = "metrics:read";
    const p = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });

    const role = await prisma.role.findUnique({
      where: { name: "SUPER_ADMIN" },
    });
    if (!role) {
      console.error("SUPER_ADMIN role not found");
      process.exit(2);
    }

    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
      update: {},
      create: { roleId: role.id, permissionId: p.id },
    });

    console.log("Granted metrics:read to SUPER_ADMIN");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
