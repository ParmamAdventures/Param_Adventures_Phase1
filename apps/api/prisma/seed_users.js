const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  // admin@local.test (Super Admin)
  const admin = await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {
        password: hashedPassword
    },
    create: {
      email: "admin@local.test",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  const superAdminRole = await prisma.role.findFirst({ where: { name: "SUPER_ADMIN" } });
  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: { 
          userId_roleId: { 
              userId: admin.id, 
              roleId: superAdminRole.id 
          } 
      },
      update: {},
      create: { 
          userId: admin.id, 
          roleId: superAdminRole.id 
      },
    });
  }

  // user@local.test (Standard User)
  const user = await prisma.user.upsert({
    where: { email: "user@local.test" },
    update: {
        password: hashedPassword
    },
    create: {
      email: "user@local.test",
      password: hashedPassword,
      name: "Standard User",
    },
  });

  const userRole = await prisma.role.findFirst({ where: { name: "USER" } });
  if (userRole) {
    await prisma.userRole.upsert({
      where: { 
          userId_roleId: { 
              userId: user.id, 
              roleId: userRole.id 
          } 
      },
      update: {},
      create: { 
          userId: user.id, 
          roleId: userRole.id 
      },
    });
  }
  
  console.log("Seed users completed.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
