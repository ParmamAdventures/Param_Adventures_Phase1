const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VIDEO_URL = "/uploads/original/c3d21228-03e1-4da7-a436-81b4cbd57d5f.mp4";
const SLIDE_TITLE = "Trek and Camping";

async function main() {
  // Find the slide first
  const slide = await prisma.heroSlide.findFirst({
    where: { title: SLIDE_TITLE }
  });

  if (!slide) {
    console.error(`Slide "${SLIDE_TITLE}" not found!`);
    process.exit(1);
  }

  const updated = await prisma.heroSlide.update({
    where: { id: slide.id },
    data: { videoUrl: VIDEO_URL }
  });

  console.log("Updated slide:", updated);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
