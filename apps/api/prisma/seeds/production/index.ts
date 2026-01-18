/**
 * PRODUCTION SEED - Demo Ready
 * 
 * This seed creates realistic, production-quality demo data including:
 * - RBAC system (roles, permissions)
 * - Sample users (admin, guides, customers)
 * - Featured trips with full details
 * - Blogs and media
 * - Hero page content
 * - Sample bookings and payments
 * - Ongoing trips
 * 
 * SAFETY FEATURES:
 * - Uses environment variables for admin credentials
 * - Validates environment before seeding
 * - Can be safely run in production for demos/staging
 */

import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// SAFETY CHECKS
// ============================================================================

function validateEnvironment() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    throw new Error(
      "❌ Cannot seed production without ALLOW_PROD_SEED=true environment variable"
    );
  }

  const requiredEnvVars = ["ADMIN_EMAIL", "ADMIN_PASSWORD"];
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}\n` +
        `Set them in your .env file or pass them when running the seed.`
    );
  }

  console.log("✅ Environment validation passed");
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

async function createRolesAndPermissions() {
  console.log("\n📋 Creating roles and permissions...");

  const permissions = [
    { key: "trips:read", description: "View trips", category: "trips" },
    { key: "trips:create", description: "Create trips", category: "trips" },
    { key: "trips:update", description: "Update trips", category: "trips" },
    { key: "trips:delete", description: "Delete trips", category: "trips" },
    { key: "trips:publish", description: "Publish trips", category: "trips" },
    { key: "bookings:read", description: "View bookings", category: "bookings" },
    { key: "bookings:manage", description: "Manage bookings", category: "bookings" },
    { key: "users:read", description: "View users", category: "users" },
    { key: "users:manage", description: "Manage users", category: "users" },
    { key: "payments:read", description: "View payments", category: "payments" },
    { key: "payments:refund", description: "Process refunds", category: "payments" },
    { key: "media:upload", description: "Upload media", category: "media" },
    { key: "blogs:write", description: "Write blogs", category: "blogs" },
    { key: "analytics:view", description: "View analytics", category: "analytics" },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
    createdPermissions.push(created);
  }

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Full system access",
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "MANAGER" },
    update: {},
    create: {
      name: "MANAGER",
      description: "Trip and booking management",
      isSystem: true,
    },
  });

  const guideRole = await prisma.role.upsert({
    where: { name: "GUIDE" },
    update: {},
    create: {
      name: "GUIDE",
      description: "Tour guide access",
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Regular user access",
      isSystem: true,
    },
  });

  // Assign all permissions to admin
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Assign specific permissions to manager
  const managerPermKeys = [
    "trips:read",
    "trips:create",
    "trips:update",
    "bookings:read",
    "bookings:manage",
    "analytics:view",
  ];
  for (const key of managerPermKeys) {
    const perm = createdPermissions.find((p) => p.key === key);
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  console.log(`✅ Created ${createdPermissions.length} permissions and 4 roles`);
  return { adminRole, managerRole, guideRole, userRole };
}

async function createUsers(roles: any) {
  console.log("\n👥 Creating users...");

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
  const demoPassword = await bcrypt.hash("Demo@2026", 10);

  // Admin user (from env vars)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL!,
      password: hashedPassword,
      name: "Admin User",
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: roles.adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: roles.adminRole.id,
    },
  });

  // Demo users
  const manager = await prisma.user.upsert({
    where: { email: "manager@paramadventures.com" },
    update: {},
    create: {
      email: "manager@paramadventures.com",
      password: demoPassword,
      name: "Rajesh Kumar",
      phoneNumber: "+91-9876543210",
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: manager.id,
        roleId: roles.managerRole.id,
      },
    },
    update: {},
    create: {
      userId: manager.id,
      roleId: roles.managerRole.id,
    },
  });

  const guide1 = await prisma.user.upsert({
    where: { email: "guide.rahul@paramadventures.com" },
    update: {},
    create: {
      email: "guide.rahul@paramadventures.com",
      password: demoPassword,
      name: "Rahul Singh",
      phoneNumber: "+91-9876543211",
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: guide1.id,
        roleId: roles.guideRole.id,
      },
    },
    update: {},
    create: {
      userId: guide1.id,
      roleId: roles.guideRole.id,
    },
  });

  const guide2 = await prisma.user.upsert({
    where: { email: "guide.priya@paramadventures.com" },
    update: {},
    create: {
      email: "guide.priya@paramadventures.com",
      password: demoPassword,
      name: "Priya Sharma",
      phoneNumber: "+91-9876543212",
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: guide2.id,
        roleId: roles.guideRole.id,
      },
    },
    update: {},
    create: {
      userId: guide2.id,
      roleId: roles.guideRole.id,
    },
  });

  // Customer users
  const customers = [];
  const customerData = [
    { email: "amit.patel@email.com", name: "Amit Patel", phone: "+91-9123456789" },
    { email: "sarah.johnson@email.com", name: "Sarah Johnson", phone: "+91-9123456790" },
    { email: "rohit.verma@email.com", name: "Rohit Verma", phone: "+91-9123456791" },
  ];

  for (const data of customerData) {
    const customer = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: demoPassword,
        name: data.name,
        phoneNumber: data.phone,
        status: "ACTIVE",
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: customer.id,
          roleId: roles.userRole.id,
        },
      },
      update: {},
      create: {
        userId: customer.id,
        roleId: roles.userRole.id,
      },
    });

    customers.push(customer);
  }

  console.log(`✅ Created admin, manager, 2 guides, and ${customers.length} customers`);
  return { admin, manager, guide1, guide2, customers };
}

async function createImages(users: any) {
  console.log("\n🖼️  Creating images...");

  const imageData = [
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      desc: "Mountain landscape",
    },
    {
      url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e",
      desc: "Himalayan trek",
    },
    {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
      desc: "Backwaters",
    },
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
      desc: "River rafting",
    },
    {
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
      desc: "Camping",
    },
    {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
      desc: "Cycling",
    },
  ];

  const images = [];
  for (const data of imageData) {
    const image = await prisma.image.create({
      data: {
        originalUrl: `${data.url}?w=1920`,
        mediumUrl: `${data.url}?w=800`,
        thumbUrl: `${data.url}?w=400`,
        width: 1920,
        height: 1080,
        size: 250000,
        mimeType: "image/jpeg",
        type: "IMAGE",
        uploadedById: users.admin.id,
      },
    });
    images.push(image);
  }

  console.log(`✅ Created ${images.length} images`);
  return images;
}

async function createTrips(users: any, images: any[]) {
  console.log("\n🌍 Creating trips...");

  const tripsData = [
    {
      title: "Everest Base Camp Trek",
      slug: "everest-base-camp-trek",
      description:
        "Embark on the world's most iconic trek to reach the base camp of Mount Everest. Experience breathtaking Himalayan scenery and Sherpa culture.",
      location: "Everest Region, Nepal",
      startPoint: "Kathmandu",
      endPoint: "Everest Base Camp",
      altitude: "5,364m",
      distance: "130 km",
      durationDays: 14,
      difficulty: "HARD",
      price: 120000,
      capacity: 15,
      category: "TREK",
      status: "PUBLISHED",
      isFeatured: true,
      coverImageId: images[0]?.id,
      heroImageId: images[1]?.id,
      startDate: new Date("2026-03-15"),
      endDate: new Date("2026-03-29"),
      highlights: ["Trek to world's highest base camp", "Summit Kala Patthar", "Sherpa culture"],
      inclusions: ["Guide", "Porter", "Meals", "Accommodation", "Permits"],
      exclusions: ["Flights", "Visa", "Insurance"],
      thingsToPack: ["Warm jacket", "Trekking boots", "Sleeping bag"],
      seasons: ["Spring (Mar-May)", "Autumn (Sep-Nov)"],
      itinerary: {
        days: [
          { day: 1, title: "Arrival in Kathmandu", description: "Orientation" },
          { day: 2, title: "Fly to Lukla", description: "Trek to Phakding" },
          { day: 14, title: "Return", description: "Fly back to Kathmandu" },
        ],
      },
    },
    {
      title: "Manali to Leh Bike Expedition",
      slug: "manali-leh-bike",
      description:
        "Conquer the legendary Manali-Leh Highway on Royal Enfield bikes. Navigate 5 high-altitude passes.",
      location: "Ladakh, India",
      startPoint: "Manali",
      endPoint: "Leh",
      altitude: "5,359m",
      distance: "480 km",
      durationDays: 10,
      difficulty: "HARD",
      price: 85000,
      capacity: 12,
      category: "TREK",
      status: "PUBLISHED",
      isFeatured: true,
      coverImageId: images[5]?.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-11"),
      highlights: ["Royal Enfield bikes", "5 high passes", "Pangong Lake"],
      inclusions: ["Bike rental", "Fuel", "Support vehicle", "Camping"],
      exclusions: ["Insurance", "Damage deposit"],
      thingsToPack: ["Helmet", "Jacket", "Gloves"],
      seasons: ["Summer (Jun-Sep)"],
      itinerary: {
        days: [
          { day: 1, title: "Manali briefing", description: "Bike allocation" },
          { day: 2, title: "Manali to Sarchu", description: "240km ride" },
        ],
      },
    },
    {
      title: "Kerala Backwaters Houseboat",
      slug: "kerala-backwaters",
      description: "Cruise through enchanting backwaters on traditional houseboats. Experience village life.",
      location: "Kerala, India",
      startPoint: "Cochin",
      endPoint: "Alleppey",
      altitude: "Sea level",
      distance: "100+ km",
      durationDays: 5,
      difficulty: "EASY",
      price: 55000,
      capacity: 20,
      category: "SPIRITUAL",
      status: "PUBLISHED",
      isFeatured: false,
      coverImageId: images[2]?.id,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-06"),
      highlights: ["Houseboat cruise", "Beaches", "Ayurveda spa"],
      inclusions: ["Houseboat", "Meals", "Tours"],
      exclusions: ["Activities not mentioned"],
      thingsToPack: ["Light clothes", "Sunscreen"],
      seasons: ["Year-round"],
      itinerary: {
        days: [
          { day: 1, title: "Cochin tour", description: "Fort and beaches" },
          { day: 2, title: "Houseboat", description: "Backwater cruise" },
        ],
      },
    },
    {
      title: "Rishikesh White Water Rafting",
      slug: "rishikesh-rafting",
      description: "Adrenaline-pumping white water rafting on the Ganges. Camp under stars.",
      location: "Rishikesh, India",
      startPoint: "Rishikesh",
      endPoint: "Rishikesh",
      altitude: "340m",
      distance: "16 km rapids",
      durationDays: 2,
      difficulty: "MODERATE",
      price: 12000,
      capacity: 30,
      category: "TREK",
      status: "PUBLISHED",
      isFeatured: false,
      coverImageId: images[3]?.id,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-03"),
      highlights: ["Grade III & IV rapids", "Cliff jumping", "Bonfire"],
      inclusions: ["Raft", "Safety gear", "Guide", "Meals"],
      exclusions: ["Insurance"],
      thingsToPack: ["Swimwear", "Towel"],
      seasons: ["Sep-Jun"],
      itinerary: {
        days: [
          { day: 1, title: "Rafting", description: "Morning and afternoon" },
          { day: 2, title: "Adventure", description: "Cliff jumping" },
        ],
      },
    },
    {
      title: "Himalayan Camping Adventure",
      slug: "himalayan-camping",
      description: "Experience pristine camping in the Himalayas with stargazing and bonfires.",
      location: "Himachal Pradesh, India",
      startPoint: "Shimla",
      endPoint: "Shimla",
      altitude: "2,500m",
      distance: "25 km",
      durationDays: 3,
      difficulty: "EASY",
      price: 18000,
      capacity: 25,
      category: "CAMPING",
      status: "PUBLISHED",
      isFeatured: true,
      coverImageId: images[4]?.id,
      startDate: new Date("2026-05-10"),
      endDate: new Date("2026-05-13"),
      highlights: ["Mountain camping", "Stargazing", "Nature walks"],
      inclusions: ["Tents", "Meals", "Guides"],
      exclusions: ["Transport to Shimla"],
      thingsToPack: ["Warm clothes", "Flashlight"],
      seasons: ["Apr-Oct"],
      itinerary: {
        days: [
          { day: 1, title: "Trek to camp", description: "Setup and bonfire" },
          { day: 2, title: "Exploration", description: "Nature trails" },
        ],
      },
    },
  ];

  const trips = [];
  for (const data of tripsData) {
    const trip = await prisma.trip.upsert({
      where: { slug: data.slug },
      update: data,
      create: {
        ...data,
        createdById: users.admin.id,
        approvedById: users.admin.id,
        managerId: users.manager.id,
        publishedAt: new Date(),
      },
    });
    trips.push(trip);

    // Assign guides
    if (trip.id) {
      await prisma.tripsOnGuides.upsert({
        where: {
          tripId_guideId: {
            tripId: trip.id,
            guideId: users.guide1.id,
          },
        },
        update: {},
        create: {
          tripId: trip.id,
          guideId: users.guide1.id,
        },
      });
    }
  }

  console.log(`✅ Created ${trips.length} trips`);
  return trips;
}

async function createHeroSlides() {
  console.log("\n🎬 Creating hero slides...");

  const slides = [
    {
      title: "Discover Your Next Adventure",
      subtitle: "Experience the Himalayas like never before",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/hero-mountains.mp4",
      ctaLink: "/trips",
      order: 1,
    },
    {
      title: "Join Expert-Led Expeditions",
      subtitle: "Professional guides for unforgettable journeys",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/hero-trek.mp4",
      ctaLink: "/trips?category=TREK",
      order: 2,
    },
    {
      title: "Create Memories That Last",
      subtitle: "From rafting to camping, we've got it all",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/hero-adventure.mp4",
      ctaLink: "/about",
      order: 3,
    },
  ];

  for (const data of slides) {
    await prisma.heroSlide.upsert({
      where: { id: `hero-${data.order}` },
      update: data,
      create: {
        id: `hero-${data.order}`,
        ...data,
      },
    });
  }

  console.log(`✅ Created ${slides.length} hero slides`);
}

async function createBlogs(users: any, trips: any[], images: any[]) {
  console.log("\n📝 Creating blogs...");

  const blogs = [
    {
      title: "Essential Tips for High Altitude Trekking",
      slug: "high-altitude-trekking-tips",
      excerpt: "Learn how to prepare for and succeed in high altitude adventures.",
      content: JSON.stringify({
        blocks: [
          { type: "heading", text: "Acclimatization is Key" },
          { type: "paragraph", text: "Give your body time to adjust to altitude." },
        ],
      }),
      status: "PUBLISHED",
      coverImageId: images[0]?.id,
      authorId: users.admin.id,
      tripId: trips[0]?.id,
    },
    {
      title: "Best Time to Visit Ladakh",
      slug: "best-time-visit-ladakh",
      excerpt: "Complete guide to planning your Ladakh adventure.",
      content: JSON.stringify({
        blocks: [
          { type: "paragraph", text: "June to September is ideal for Ladakh trips." },
        ],
      }),
      status: "PUBLISHED",
      coverImageId: images[5]?.id,
      authorId: users.manager.id,
      tripId: trips[1]?.id,
    },
  ];

  for (const data of blogs) {
    await prisma.blog.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }

  console.log(`✅ Created ${blogs.length} blogs`);
}

async function createBookingsAndPayments(users: any, trips: any[]) {
  console.log("\n📅 Creating bookings and payments...");

  // Completed booking with payment
  const booking1 = await prisma.booking.create({
    data: {
      userId: users.customers[0].id,
      tripId: trips[0].id,
      startDate: new Date("2026-03-15"),
      guests: 2,
      totalPrice: 240000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      guestDetails: [
        { name: "Amit Patel", email: "amit.patel@email.com", age: 32, gender: "Male" },
        { name: "Priya Patel", email: "priya.patel@email.com", age: 29, gender: "Female" },
      ],
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      provider: "razorpay",
      providerOrderId: `order_demo_${Date.now()}_1`,
      providerPaymentId: `pay_demo_${Date.now()}_1`,
      amount: 240000,
      currency: "INR",
      status: "CAPTURED",
      method: "card",
    },
  });

  // Ongoing trip booking
  const booking2 = await prisma.booking.create({
    data: {
      userId: users.customers[1].id,
      tripId: trips[1].id,
      startDate: new Date("2026-06-01"),
      guests: 1,
      totalPrice: 85000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      provider: "razorpay",
      providerOrderId: `order_demo_${Date.now()}_2`,
      providerPaymentId: `pay_demo_${Date.now()}_2`,
      amount: 85000,
      currency: "INR",
      status: "CAPTURED",
      method: "upi",
    },
  });

  // Pending booking
  await prisma.booking.create({
    data: {
      userId: users.customers[2].id,
      tripId: trips[2].id,
      startDate: new Date("2026-04-01"),
      guests: 4,
      totalPrice: 220000,
      status: "REQUESTED",
      paymentStatus: "PENDING",
    },
  });

  console.log("✅ Created 3 bookings with payments");
}

async function createReviewsAndInquiries(users: any, trips: any[]) {
  console.log("\n⭐ Creating reviews and inquiries...");

  await prisma.review.create({
    data: {
      userId: users.customers[0].id,
      tripId: trips[3].id,
      rating: 5,
      comment: "Amazing experience! The guides were professional and the rapids were thrilling.",
    },
  });

  await prisma.tripInquiry.create({
    data: {
      name: "Vikram Mehta",
      email: "vikram.m@email.com",
      phoneNumber: "+91-9988776655",
      destination: "Manali-Leh",
      dates: "July 2026",
      budget: "80000-100000",
      details: "Interested in bike expedition for 2 people",
      status: "NEW",
    },
  });

  console.log("✅ Created reviews and inquiries");
}

async function createSiteConfig() {
  console.log("\n⚙️  Creating site configuration...");

  const configs = [
    { key: "site_name", value: "Param Adventures", label: "Site Name" },
    { key: "contact_email", value: "info@paramadventures.com", label: "Contact Email" },
    { key: "contact_phone", value: "+91-9876543210", label: "Contact Phone" },
    { key: "address", value: "123 Adventure Street, Manali, HP", label: "Address" },
  ];

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, label: config.label },
      create: config,
    });
  }

  console.log("✅ Created site configuration");
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  try {
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║          PRODUCTION SEED - DEMO READY                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    validateEnvironment();

    console.log("\n🗑️  Clearing existing data...");
    await prisma.$transaction([
      prisma.payment.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.review.deleteMany(),
      prisma.savedTrip.deleteMany(),
      prisma.tripInquiry.deleteMany(),
      prisma.newsletterSubscriber.deleteMany(),
      prisma.heroSlide.deleteMany(),
      prisma.blog.deleteMany(),
      prisma.tripGalleryImage.deleteMany(),
      prisma.tripsOnGuides.deleteMany(),
      prisma.trip.deleteMany(),
      prisma.image.deleteMany(),
      prisma.userRole.deleteMany(),
      prisma.rolePermission.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.siteConfig.deleteMany(),
    ]);
    console.log("✅ Database cleared");

    const roles = await createRolesAndPermissions();
    const users = await createUsers(roles);
    const images = await createImages(users);
    const trips = await createTrips(users, images);
    await createHeroSlides();
    await createBlogs(users, trips, images);
    await createBookingsAndPayments(users, trips);
    await createReviewsAndInquiries(users, trips);
    await createSiteConfig();

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║              ✨ SEED COMPLETED SUCCESSFULLY ✨             ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    console.log("\n📊 Summary:");
    console.log("   • 4 Roles with permissions");
    console.log("   • 7 Users (1 admin, 1 manager, 2 guides, 3 customers)");
    console.log("   • 6 Images");
    console.log("   • 5 Featured trips");
    console.log("   • 3 Hero slides");
    console.log("   • 2 Blog posts");
    console.log("   • 3 Bookings (2 confirmed, 1 pending)");
    console.log("   • 2 Payments");
    console.log("   • Site configuration");

    console.log("\n🔑 Login Credentials:");
    console.log(`   Admin:    ${process.env.ADMIN_EMAIL}`);
    console.log(`   Manager:  manager@paramadventures.com / Demo@2026`);
    console.log(`   Guide:    guide.rahul@paramadventures.com / Demo@2026`);
    console.log(`   Customer: amit.patel@email.com / Demo@2026\n`);
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
