const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Get latest user
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      console.log("No users found.");
      return;
    }

    console.log(`Found latest user: ${user.email} (${user.id})`);

    // 2. Get SUPER_ADMIN role
    const role = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!role) {
      console.log("SUPER_ADMIN role not found.");
      return;
    }

    // 3. Check if already assigned
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
    });

    if (existing) {
      console.log("User is already a SUPER_ADMIN.");
      return;
    }

    // 4. Assign role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });

    console.log(`Successfully assigned SUPER_ADMIN role to ${user.email}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
