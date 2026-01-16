import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";



const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where: { name: "CONTENT_MANAGER" },
    update: {},
    create: {
      name: "CONTENT_MANAGER",
      description: "Manages blog and trip content",
      isSystem: false,
    },
  });

  const keys = ["blog:create", "blog:approve", "trip:create", "trip:approve", "trip:publish"];
  const perms = await prisma.permission.findMany({
    where: { key: { in: keys } },
  });

  for (const p of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
      update: {},
      create: { roleId: role.id, permissionId: p.id },
    });
  }

  console.log("CONTENT_MANAGER role created/updated with content permissions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
