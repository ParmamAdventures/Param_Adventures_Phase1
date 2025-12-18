require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node checkPermissions.js <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }

  const roles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const roleNames = roles.map((r) => r.role?.name).filter(Boolean);
  const permissionSet = new Set();
  for (const r of roles) {
    const perms = r.role?.permissions ?? [];
    for (const p of perms) {
      if (p?.permission?.key) permissionSet.add(p.permission.key);
    }
  }

  console.log("User:", email);
  console.log("Roles:", roleNames);
  console.log("Permissions:", Array.from(permissionSet));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
