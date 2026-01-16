import { PrismaClient  } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "akashkbhat216@gmail.com";

  // Find roles
  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });

  if (!superAdminRole || !adminRole) {
    throw new Error("Roles not found");
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Assign roles
  await prisma.userRole.createMany({
    data: [
      { userId: user.id, roleId: superAdminRole.id },
      { userId: user.id, roleId: adminRole.id },
    ],
    skipDuplicates: true,
  });

  console.log(`Successfully assigned SUPER_ADMIN and ADMIN roles to ${email}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
