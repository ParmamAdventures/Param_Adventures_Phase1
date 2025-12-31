require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.blog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: { title: true, slug: true, theme: true },
  });
  console.log(JSON.stringify(blogs, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
