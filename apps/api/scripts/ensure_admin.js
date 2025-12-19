require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const email = "admin@local.test";
  const password = "password123";
  const hashed = await bcrypt.hash(password, 12);

  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, name: "Local Admin" },
    });
    console.log("Updated existing admin password");
    user = await prisma.user.findUnique({ where: { email } });
  } else {
    user = await prisma.user.create({
      data: { email, password: hashed, name: "Local Admin" },
    });
    console.log("Created admin user");
  }

  const superRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  if (!superRole) {
    console.error("SUPER_ADMIN role not found; run prisma seed");
    process.exit(1);
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superRole.id } },
    update: {},
    create: { userId: user.id, roleId: superRole.id },
  });

  console.log("Admin ensured:", email, "password:", password);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
