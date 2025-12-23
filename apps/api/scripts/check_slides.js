const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const slides = await prisma.heroSlide.findMany();
  fs.writeFileSync('slides_dump.json', JSON.stringify(slides, null, 2));
  console.log("Done writing slides_dump.json");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
