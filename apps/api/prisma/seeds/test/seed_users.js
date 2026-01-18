import bcrypt from "bcryptjs";
import { PrismaClient  } from "@prisma/client";



const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  // admin@local.test (Super Admin)
  const admin = await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {
      password: hashedPassword,
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
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  // user@local.test (Standard User)
  const userRole = await prisma.role.findFirst({ where: { name: "USER" } });

  const user = await prisma.user.upsert({
    where: { email: "user@local.test" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "user@local.test",
      password: hashedPassword,
      name: "Standard User",
    },
  });

  if (userRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userRole.id,
      },
    });
  }

  // manager@local.test (Trip Manager)
  const manager = await prisma.user.upsert({
    where: { email: "manager@local.test" },
    update: { password: hashedPassword },
    create: {
      email: "manager@local.test",
      password: hashedPassword,
      name: "Trip Manager",
    },
  });

  const managerRole = await prisma.role.findFirst({ where: { name: "TRIP_MANAGER" } });
  if (managerRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: manager.id, roleId: managerRole.id } },
      update: {},
      create: { userId: manager.id, roleId: managerRole.id },
    });
  }

  // guide@local.test (Trip Guide)
  const guide = await prisma.user.upsert({
    where: { email: "guide@local.test" },
    update: { password: hashedPassword },
    create: {
      email: "guide@local.test",
      password: hashedPassword,
      name: "Trip Guide",
    },
  });

  const guideRole = await prisma.role.findFirst({ where: { name: "TRIP_GUIDE" } });
  if (guideRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: guide.id, roleId: guideRole.id } },
      update: {},
      create: { userId: guide.id, roleId: guideRole.id },
    });
  }

  console.log("Seed users completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
