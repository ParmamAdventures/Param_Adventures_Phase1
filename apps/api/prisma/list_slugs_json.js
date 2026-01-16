import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.trip.findMany({
    where: { title: { contains: "Kodaikanal" } },
    select: { title: true, slug: true, status: true },
  });
  console.log("---- SLUGS START ----");
  blogs.forEach(b => console.log(`${b.title} -> ${b.slug} [${b.status}]`));
  console.log("---- SLUGS END ----");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
