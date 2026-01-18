import { PrismaClient  } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING FEATURED TRIPS ---");

  // Reset all first
  await prisma.trip.updateMany({ data: { isFeatured: false } });

  const featuredSlugs = [
    "everest-base-camp",
    "kyoto-cherry-blossom",
    "iceland-northern-lights",
    // Add one trek that we seeded recently
    "annapurna-circuit",
  ];

  for (const slug of featuredSlugs) {
    const trip = await prisma.trip.findUnique({ where: { slug } });
    if (trip) {
      await prisma.trip.update({
        where: { slug },
        data: { isFeatured: true },
      });
      console.log(`Marked ${slug} as featured.`);
    } else {
      console.log(`Trip ${slug} not found.`);
    }
  }

  console.log("Featured seeding complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
