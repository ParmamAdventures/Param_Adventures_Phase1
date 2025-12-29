const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding test users...");
  const password = await bcrypt.hash("password123", 10);
  
  const usersToSeed = [
    { email: "superadmin@local.test", name: "Test Super Admin", roleName: "SUPER_ADMIN" },
    { email: "admin@local.test",      name: "Test Admin",       roleName: "ADMIN" },
    { email: "user@local.test",       name: "Test User",        roleName: "USER" },
    // { email: "uploader@local.test",   name: "Test Uploader",    roleName: "UPLOADER" }, // Schema seed implies this role exists
  ];

  // Also check if UPLOADER role exists, seed implies it does
  // Adding explicitly if the seed file has it. Seed file has: UPLOADER.
  usersToSeed.push({ email: "uploader@local.test", name: "Test Uploader", roleName: "UPLOADER" });

  for (const u of usersToSeed) {
    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password }, // Update password just in case
      create: {
        email: u.email,
        name: u.name,
        password,
        status: "ACTIVE",
        nickname: u.roleName.toLowerCase() // Add a nickname for profile testing
      }
    });

    // 2. Find Role
    const role = await prisma.role.findUnique({ where: { name: u.roleName } });
    
    if (role) {
      // 3. Assign Role (Upsert to avoid duplicates)
      await prisma.userRole.upsert({
         where: { userId_roleId: { userId: user.id, roleId: role.id } },
         update: {},
         create: { userId: user.id, roleId: role.id }
      });
      console.log(`✅ Seeded ${u.email} with role ${u.roleName}`);
    } else {
        console.warn(`⚠️ Role ${u.roleName} not found! Run the main seed first (npm run prisma:seed)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
