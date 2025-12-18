const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  console.log(`Found ${users.length} users:`);
  users.forEach((u) => console.log("-", u.email, u.id, u.name || ""));
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
