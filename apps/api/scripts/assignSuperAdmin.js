import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";



const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node assignSuperAdmin.js <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }

  const role = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  if (!role) {
    console.error("SUPER_ADMIN role not found");
    process.exit(1);
  }

  // create userRole if not exists
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  console.log(`Assigned SUPER_ADMIN to ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
