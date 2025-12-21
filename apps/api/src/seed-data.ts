
import { PrismaClient, TripStatus, BlogStatus, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const TRIPS = [
  {
    title: "The Antarctic Apex Expedition",
    slug: "antarctic-apex",
    description: "Journey to the end of the world. Experience the raw power of the Antarctic peninsula, navigate through iceberg alleys, and witness the majesty of emperor penguins in their natural habitat. This is not just a trip; it's a testament to human endurance.",
    location: "Antarctica",
    durationDays: 14,
    difficulty: "EXTREME",
    price: 1250000,
    status: "PUBLISHED",
    coverImage: "https://images.unsplash.com/photo-1541097207431-7785c4b3ca96?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1516972622933-4f901261d763?q=80&w=2070",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070",
    ]
  },
  {
    title: "Sahara: The Golden Void",
    slug: "sahara-golden-void",
    description: "Traverse the infinite dunes of the Sahara under the canopy of a billion stars. A luxury nomad experience combining 4x4 adrenaline with premium desert camps.",
    location: "Morocco",
    durationDays: 7,
    difficulty: "MODERATE",
    price: 245000,
    status: "PUBLISHED",
    coverImage: "https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1682685797828-d3b2561deef4?q=80&w=2070",
      "https://images.unsplash.com/photo-1516934024742-b461fba4b72c?q=80&w=2070"
    ]
  },
  {
    title: "Amazonian Deep Jungle",
    slug: "amazonian-deep",
    description: "Penetrate the heart of the Amazon. Encounter rare wildlife, learn survival skills from indigenous guides, and sleep in suspended eco-pods high in the canopy.",
    location: "Brazil",
    durationDays: 10,
    difficulty: "HARD",
    price: 450000,
    status: "PUBLISHED",
    coverImage: "https://images.unsplash.com/photo-1596401490237-7cf4c2b9f3d9?q=80&w=1974&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1546879104-5858eb5b6197?q=80&w=2070",
       "https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?q=80&w=2070"
    ]
  },
  {
    title: "Kyoto: Shadows of the Samurai",
    slug: "kyoto-samurai",
    description: "A cultural odyssey through ancient Japan. Private access to temples, tea ceremonies with masters, and a trek through the misty mountains of Kibune.",
    location: "Japan",
    durationDays: 8,
    difficulty: "EASY",
    price: 380000,
    status: "PUBLISHED",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?q=80&w=2070",
       "https://images.unsplash.com/photo-1528360983277-13d9b152c611?q=80&w=2070"
    ]
  },
  {
    title: "Icelandic Fire & Ice",
    slug: "icelandic-fire",
    description: "Witness the dance of auroras over active volcanoes. A photographic expedition capturing the stark beauty of the north.",
    location: "Iceland",
    durationDays: 9,
    difficulty: "MODERATE",
    price: 520000,
    status: "PUBLISHED",
    coverImage: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2159&auto=format&fit=crop",
     gallery: [
      "https://images.unsplash.com/photo-1504893524553-bfe206dd542f?q=80&w=2070"
    ]
  },
  {
    title: "Himalayan Sky Fortress",
    slug: "himalayan-sky",
    description: "Trek to the forbidden kingdoms of the Himalayas. High altitude passes, ancient monasteries, and the silence of the roof of the world.",
    location: "Nepal",
    durationDays: 21,
    difficulty: "EXTREME",
    price: 180000,
    status: "PUBLISHED",
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop",
     gallery: [
       "https://images.unsplash.com/photo-1486911278844-a81c5267e227?q=80&w=2070"
    ]
  }
];

const IMAGES = {
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop"
};

async function main() {
  console.log("🌱  Seeding Premium Data...");

  // 1. Create a Super Admin / Featured User
  const adminEmail = "akash@param.com"; // Assuming user might use this
  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!user) {
    // 1. Create User first
    user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: "hashedpassword123",
        name: "Akash Admin",
        status: UserStatus.ACTIVE
      }
    });

    // 2. Create Avatar Image
    const avatar = await prisma.image.create({
      data: {
        originalUrl: IMAGES.avatar,
        mediumUrl: IMAGES.avatar,
        thumbUrl: IMAGES.avatar,
        width: 100, height: 100, size: 1000, mimeType: "image/jpeg",
        uploadedById: user.id
      }
    });

    // 3. Update User with Avatar
    await prisma.user.update({
        where: { id: user.id },
        data: { avatarImageId: avatar.id } as any
    });
  }

  console.log(`👤  User verified: ${user.name}`);

  // 2. Clear existing Draft Trips if any (optional, keeping it safe)
  // await prisma.trip.deleteMany({ where: { status: 'DRAFT' } });

  // 3. Seed Trips
  for (const tripData of TRIPS) {
    const exists = await prisma.trip.findUnique({ where: { slug: tripData.slug } });
    if (!exists) {
      await prisma.trip.create({
        data: {
          title: tripData.title,
          slug: tripData.slug,
          description: tripData.description,
          location: tripData.location,
          durationDays: tripData.durationDays,
          difficulty: tripData.difficulty,
          price: tripData.price,
          status: TripStatus.PUBLISHED,

          itinerary: [
              { day: 1, title: "Arrival", description: "Land and settle in." }, 
              { day: 2, title: "Exploration", description: "Venture into the wild." }
          ],  
          createdBy: { connect: { id: user.id } },
          coverImage: {
            create: {
              originalUrl: tripData.coverImage,
              mediumUrl: tripData.coverImage,
              thumbUrl: tripData.coverImage,
              width: 1920, height: 1080, size: 50000, mimeType: "image/jpeg",
              uploadedBy: { connect: { id: user.id } }
            }
          },
          gallery: {
            create: tripData.gallery.map((url, index) => ({
              order: index,
              image: {
                create: {
                    originalUrl: url,
                    mediumUrl: url,
                    thumbUrl: url,
                    width: 1920, height: 1080, size: 50000, mimeType: "image/jpeg",
                    uploadedBy: { connect: { id: user.id } }
                }
              }
            }))
          }
        } as any
      });
      console.log(`✨  Created trip: ${tripData.title}`);
    } else {
        console.log(`⏩  Skipping existing trip: ${tripData.title}`);
    }
  }

  // 4. Seed Blogs
  const BLOGS = [
      {
          title: "The Art of Silence: Why We Go to the Mountains",
          slug: "art-of-silence",
          excerpt: "In a world of constant noise, the mountains offer the ultimate luxury: absolute silence. Here is why your brain needs altitude.",
          image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"
      },
      {
          title: "Gear Guide: Surviving the Antarctic",
          slug: "gear-guide-antarctic",
          excerpt: "From layering systems to polarized optics, here is the essential kit for surviving—and thriving—at the bottom of the world.",
          image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=2071"
      }
  ];

  for (const blog of BLOGS) {
      const exists = await prisma.blog.findUnique({ where: { slug: blog.slug } });
      if(!exists) {
          await prisma.blog.create({
              data: {
                  title: blog.title,
                  slug: blog.slug,
                  excerpt: blog.excerpt,
                  content: { type: "doc", content: [] }, 
                  status: BlogStatus.PUBLISHED,
                  author: { connect: { id: user.id } },
                  coverImage: {
                      create: {
                          originalUrl: blog.image,
                          mediumUrl: blog.image,
                          thumbUrl: blog.image,
                          width: 1920, height: 1080, size: 40000, mimeType: "image/jpeg",
                          uploadedBy: { connect: { id: user.id } }
                      }
                  }
              } as any
          });
          console.log(`📝  Created blog: ${blog.title}`);
      }
  }

  console.log("✅  Seeding complete. The universe is populated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
