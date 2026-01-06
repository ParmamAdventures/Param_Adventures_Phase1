const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@paramadventures.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log(`Resetting password for ${email}...`);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        name: "System Admin",
        password: hashedPassword,
        roles: {
          create: [{ role: { connect: { name: "SUPER_ADMIN" } } }]
        }
      }
    });
    console.log("Password reset successful.");
  } catch (e) {
    console.error("Error resetting password:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
