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

import {
  PrismaClient,
  Prisma,
  TripStatus,
  BlogStatus,
  TripCategory,
  PaymentMethod,
  Difficulty,
} from "@prisma/client";
import { RAW_TRIP_DATA, TRIP_IMAGES } from "./seed_data";

// (Code removed)
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// ============================================================================
// SAFETY CHECKS
// ============================================================================

function validateEnvironment() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
    throw new Error("❌ Cannot seed production without ALLOW_PROD_SEED=true environment variable");
  }

  const requiredEnvVars = ["ADMIN_EMAIL", "SEED_PASSWORD"];
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}\n` +
        `Set them in your .env file or pass them when running the seed.`,
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
    // Trip Management
    { key: "trip:create", description: "Create new trip drafts", category: "trips" },
    { key: "trip:edit", description: "Edit trip details", category: "trips" },
    { key: "trip:submit", description: "Submit trip for review", category: "trips" },
    { key: "trip:approve", description: "Approve trip for publishing", category: "trips" },
    { key: "trip:publish", description: "Publish trip live", category: "trips" },
    { key: "trip:archive", description: "Archive trip", category: "trips" },
    { key: "trip:view:internal", description: "View Draft/Pending Trips", category: "trips" },
    {
      key: "trip:update-status",
      description: "Operational updates (started/ended)",
      category: "trips",
    },
    { key: "trip:assign-guide", description: "Assign guides/managers", category: "trips" },
    { key: "trip:view:guests", description: "View guest list for trip", category: "trips" },

    // Booking Management
    { key: "booking:create", description: "Book a trip", category: "bookings" },
    { key: "booking:view", description: "View own bookings", category: "bookings" },
    { key: "booking:read:admin", description: "View ALL bookings", category: "bookings" },
    { key: "booking:manage", description: "Manage bookings", category: "bookings" },
    { key: "booking:approve", description: "Manually approve booking", category: "bookings" },
    { key: "booking:reject", description: "Reject booking", category: "bookings" },
    { key: "booking:cancel", description: "Cancel booking", category: "bookings" },

    // Content (Blogs & Media)
    { key: "blog:create", description: "Draft a blog", category: "blogs" },
    { key: "blog:update", description: "Edit own blog", category: "blogs" },
    { key: "blog:submit", description: "Submit for review", category: "blogs" },
    { key: "blog:approve", description: "Approve/Reject Blogs", category: "blogs" },
    { key: "blog:publish", description: "Publish Blogs", category: "blogs" },
    { key: "media:upload", description: "Upload Images/Videos", category: "media" },
    { key: "media:view", description: "View Media Library", category: "media" },

    // System Administration
    { key: "user:list", description: "List all users", category: "users" },
    { key: "user:view", description: "View full profiles", category: "users" },
    { key: "user:edit", description: "Edit user details", category: "users" },
    { key: "user:assign-role", description: "Change user roles", category: "users" },
    { key: "role:list", description: "View System Roles", category: "users" },
    { key: "audit:view", description: "View Audit Logs", category: "users" },
    { key: "payments:read", description: "View payments", category: "payments" },
    { key: "payments:refund", description: "Process refunds", category: "payments" },
    { key: "analytics:view", description: "View analytics", category: "analytics" },
  ];

  const createdPermissions: Prisma.PermissionGetPayload<{}>[] = [];
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
    createdPermissions.push(created);
  }

  // Helper to get permission IDs by keys
  const getPermIds = (keys: string[]) =>
    keys.map((k) => createdPermissions.find((p) => p.key === k)?.id).filter(Boolean) as string[];

  // 1. SUPER_ADMIN
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Full System Access (Root)", isSystem: true },
  });
  // Assign ALL permissions
  await assignPermissions(
    superAdminRole.id,
    createdPermissions.map((p) => p.id),
  );

  // 2. ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Operational Admin", isSystem: true },
  });
  const adminPerms = getPermIds([
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:approve",
    "trip:publish",
    "trip:archive",
    "trip:view:internal",
    "trip:update-status",
    "trip:assign-guide",
    "trip:view:guests",
    "booking:create",
    "booking:view",
    "booking:read:admin",
    "booking:approve",
    "booking:reject",
    "booking:cancel",
    "blog:create",
    "blog:update",
    "blog:submit",
    "blog:approve",
    "blog:publish",
    "media:upload",
    "media:view",
    "user:list",
    "user:view",
    "user:edit",
    "user:assign-role",
    "role:list",
    "audit:view",
  ]);
  await assignPermissions(adminRole.id, adminPerms);

  // 3. UPLOADER
  const uploaderRole = await prisma.role.upsert({
    where: { name: "UPLOADER" },
    update: {},
    create: { name: "UPLOADER", description: "Content Creator", isSystem: true },
  });
  const uploaderPerms = getPermIds([
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:view:internal",
    "blog:create",
    "blog:update",
    "blog:submit",
    "media:upload",
    "media:view",
  ]);
  await assignPermissions(uploaderRole.id, uploaderPerms);

  // 4. TRIP_MANAGER
  const managerRole = await prisma.role.upsert({
    where: { name: "TRIP_MANAGER" }, // Renamed from MANAGER
    update: {},
    create: { name: "TRIP_MANAGER", description: "Logistics Coordinator", isSystem: true },
  });
  const managerPerms = getPermIds([
    "trip:view:internal",
    "trip:update-status",
    "trip:assign-guide",
    "trip:view:guests",
    "booking:view",
    "booking:read:admin",
  ]);
  await assignPermissions(managerRole.id, managerPerms);

  // 5. TRIP_GUIDE
  const guideRole = await prisma.role.upsert({
    where: { name: "TRIP_GUIDE" }, // Renamed from GUIDE
    update: {},
    create: { name: "TRIP_GUIDE", description: "Field Staff", isSystem: true },
  });
  const guidePerms = getPermIds(["trip:update-status", "trip:view:guests"]);
  await assignPermissions(guideRole.id, guidePerms);

  // 6. USER
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER", description: "Standard Traveler", isSystem: true },
  });
  const userPerms = getPermIds([
    "booking:create",
    "booking:view",
    "blog:create",
    "blog:update",
    "blog:submit",
    "media:upload",
  ]);
  await assignPermissions(userRole.id, userPerms);

  console.log(`✅ Created 6 roles and assigned permissions`);
  return { superAdminRole, adminRole, uploaderRole, managerRole, guideRole, userRole };
}

async function assignPermissions(roleId: string, permissionIds: string[]) {
  for (const permId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId: permId } },
      update: {},
      create: { roleId, permissionId: permId },
    });
  }
}

async function createUsers(roles: any) {
  console.log("\n👥 Creating users...");

  // Use single password for ALL users (super admin, admin, manager, guides, customers)
  const seedPasswordRaw = process.env.SEED_PASSWORD;

  if (!seedPasswordRaw) {
    throw new Error(
      "❌ SEED_PASSWORD env var is required for seeding.\n" +
        "   Set it in your .env file: SEED_PASSWORD=YourSecurePassword123!",
    );
  }

  const seedPassword = await bcrypt.hash(seedPasswordRaw, 10);

  console.log(`\n🔐 PASSWORD FOR ALL USERS:`);
  console.log(`   (from SEED_PASSWORD env var)`);
  console.log(`   All users share this password for easy demo login\n`);

  // Super Admin user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || `super.admin@paramadventures.com`;
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: seedPassword,
      name: "Super Admin",
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: roles.superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: roles.superAdminRole.id },
  });

  // Admin user (from env vars)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL!,
      password: seedPassword,
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

  // Demo users - One of each role
  if (process.env.SEED_DEMO_DATA === "true") {
    // 1. Manager
    const manager = await prisma.user.upsert({
      where: { email: "manager@paramadventures.com" },
      update: {},
      create: {
        email: "manager@paramadventures.com",
        password: seedPassword,
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

    // 2. Guides
    const guide1 = await prisma.user.upsert({
      where: { email: "guide.rahul@paramadventures.com" },
      update: {},
      create: {
        email: "guide.rahul@paramadventures.com",
        password: seedPassword,
        name: "Rahul Singh",
        phoneNumber: "+91-9876543211",
        status: "ACTIVE",
      },
    });

    const guide2 = await prisma.user.upsert({
      where: { email: "guide.neha@paramadventures.com" },
      update: {},
      create: {
        email: "guide.neha@paramadventures.com",
        password: seedPassword,
        name: "Neha Sharma",
        phoneNumber: "+91-9876543212",
        status: "ACTIVE",
      },
    });

    for (const guide of [guide1, guide2]) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: guide.id, roleId: roles.guideRole.id } },
        update: {},
        create: { userId: guide.id, roleId: roles.guideRole.id },
      });
    }

    // 3. Customers
    const customerEmails = ["amit.patel@email.com", "sneha.k@email.com", "vikram.m@email.com"];
    const customerNames = ["Amit Patel", "Sneha Kapoor", "Vikram Mehta"];
    const customers = [];

    for (let i = 0; i < customerEmails.length; i++) {
      const customer = await prisma.user.upsert({
        where: { email: customerEmails[i] },
        update: {},
        create: {
          email: customerEmails[i],
          password: seedPassword,
          name: customerNames[i],
          status: "ACTIVE",
        },
      });
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: customer.id, roleId: roles.userRole.id } },
        update: {},
        create: { userId: customer.id, roleId: roles.userRole.id },
      });
      customers.push(customer);
    }

    console.log(
      `✅ Created Admin and ${guide1.id ? 2 : 0} Guides and ${customers.length} Customers`,
    );

    return {
      admin,
      manager,
      guide1,
      guide2,
      customers,
    };
  } else {
    console.log("ℹ️  Skipping demo users (SEED_DEMO_DATA not true)");
    return { admin };
  }
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
    const originalUrl = `${data.url}?w=1920`;
    // Defensive check to avoid generated type issues with upsert unique inputs
    let image = await prisma.image.findFirst({ where: { originalUrl } });
    if (!image) {
      image = await prisma.image.create({
        data: {
          originalUrl,
          mediumUrl: `${data.url}?w=800`,
          thumbUrl: `${data.url}?w=400`,
          width: 1920,
          height: 1080,
          size: 250000,
          mimeType: "image/jpeg",
          type: "IMAGE",
          uploadedBy: { connect: { id: users.admin.id } },
        },
      });
    }
    images.push(image);
  }

  console.log(`✅ Created ${images.length} images`);
  return images;
}

async function createTrips(users: any, images: any[]) {
  console.log("\n🌍 Creating a massive expedition fleet (35+ trips)...");

  const trips = [];
  let count = 0;

  for (const data of RAW_TRIP_DATA) {
    count++;
    const slug = data.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "");

    // Rotate images from our pool
    const coverImage = images[count % images.length];
    const heroImage = images[(count + 1) % images.length];

    // Determine status and assignments based on count for variety
    let status: TripStatus = "PUBLISHED";
    let isFeatured = count <= 5;

    if (count % 10 === 0) status = "DRAFT";
    if (count % 15 === 0) status = "IN_PROGRESS";
    if (count % 12 === 0) status = "COMPLETED";

    const tripData: any = {
      title: data.title,
      slug,
      description: `Join us for an unforgettable ${data.category.toLowerCase()} adventure in ${data.location}. Experience the best of ${data.title} with our professional team.`,
      location: data.location,
      price: data.price,
      durationDays: data.duration,
      difficulty: data.difficulty as Difficulty,
      status,
      category: data.category as TripCategory,
      capacity: 10 + (count % 20),
      isFeatured,
      startPoint: "Base Camp",
      endPoint: data.location,
      altitude: "Varies",
      distance: "Varies",
      startDate: new Date(Date.now() + (10 + count) * 24 * 60 * 60 * 1000), // Future dates
      endDate: new Date(Date.now() + (10 + count + data.duration) * 24 * 60 * 60 * 1000),
      highlights: ["Experienced Guides", "All inclusive meals", "Safety First"],
      inclusions: ["Equipment", "Meals", "Permits"],
      exclusions: ["Flights", "Personal Gear"],
      thingsToPack: ["Warm clothes", "Boots", "Spirit of adventure"],
      seasons: ["Spring", "Autumn"],
      itinerary: {
        days: [
          { day: 1, title: "Briefing", description: "Base camp orientation" },
          { day: data.duration, title: "Farewell", description: "Return journey" },
        ],
      },
    };

    const trip = await prisma.trip.upsert({
      where: { slug },
      update: tripData,
      create: {
        ...tripData,
        createdBy: { connect: { id: users.admin.id } },
        approvedBy: { connect: { id: users.admin.id } },
        // Assign manager to every trip
        manager: { connect: { id: users.manager.id } },
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    trips.push(trip);

    // Assign guides to some trips
    if (count % 2 === 0) {
      await prisma.tripsOnGuides.upsert({
        where: { tripId_guideId: { tripId: trip.id, guideId: users.guide1.id } },
        update: {},
        create: { tripId: trip.id, guideId: users.guide1.id },
      });
    }
    if (count % 3 === 0) {
      await prisma.tripsOnGuides.upsert({
        where: { tripId_guideId: { tripId: trip.id, guideId: users.guide2.id } },
        update: {},
        create: { tripId: trip.id, guideId: users.guide2.id },
      });
    }
  }

  console.log(`✅ Successfully seeded ${trips.length} trips!`);
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
        blocks: [{ type: "paragraph", text: "June to September is ideal for Ladakh trips." }],
      }),
      status: "PUBLISHED",
      coverImageId: images[5]?.id,
      authorId: users.manager.id,
      tripId: trips[1]?.id,
    },
  ];

  for (const data of blogs) {
    const blogData = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status as BlogStatus,
    };

    await prisma.blog.upsert({
      where: { slug: data.slug },
      update: {
        ...blogData,
        author: { connect: { id: data.authorId } },
        coverImage: data.coverImageId ? { connect: { id: data.coverImageId } } : undefined,
        trip: data.tripId ? { connect: { id: data.tripId } } : undefined,
      },
      create: {
        ...blogData,
        author: { connect: { id: data.authorId } },
        coverImage: data.coverImageId ? { connect: { id: data.coverImageId } } : undefined,
        trip: data.tripId ? { connect: { id: data.tripId } } : undefined,
      },
    });
  }

  console.log(`✅ Created ${blogs.length} blogs`);
}

async function createBookingsAndPayments(users: any, trips: any[]) {
  console.log("\n📅 Creating bookings and payments...");

  const date1 = new Date("2026-03-15");
  // Completed booking with payment
  const booking1 = await prisma.booking.upsert({
    where: {
      userId_tripId_startDate: {
        userId: users.customers[0].id,
        tripId: trips[0].id,
        startDate: date1,
      },
    },
    update: {},
    create: {
      user: { connect: { id: users.customers[0].id } },
      trip: { connect: { id: trips[0].id } },
      startDate: date1,
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

  await prisma.payment.upsert({
    where: { providerOrderId: "order_demo_fixed_1" },
    update: {},
    create: {
      booking: { connect: { id: booking1.id } },
      provider: "RAZORPAY",
      providerOrderId: "order_demo_fixed_1",
      providerPaymentId: "pay_demo_fixed_1",
      amount: 240000,
      currency: "INR",
      status: "CAPTURED",
      method: PaymentMethod.CARD,
    },
  });

  const date2 = new Date("2026-06-01");
  // Ongoing trip booking
  const booking2 = await prisma.booking.upsert({
    where: {
      userId_tripId_startDate: {
        userId: users.customers[1].id,
        tripId: trips[1].id,
        startDate: date2,
      },
    },
    update: {},
    create: {
      user: { connect: { id: users.customers[1].id } },
      trip: { connect: { id: trips[1].id } },
      startDate: date2,
      guests: 1,
      totalPrice: 85000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });

  await prisma.payment.upsert({
    where: { providerOrderId: "order_demo_fixed_2" },
    update: {},
    create: {
      booking: { connect: { id: booking2.id } },
      provider: "RAZORPAY",
      providerOrderId: "order_demo_fixed_2",
      providerPaymentId: "pay_demo_fixed_2",
      amount: 85000,
      currency: "INR",
      status: "CAPTURED",
      method: PaymentMethod.UPI,
    },
  });

  const date3 = new Date("2026-04-01");
  // Pending booking
  await prisma.booking.upsert({
    where: {
      userId_tripId_startDate: {
        userId: users.customers[2].id,
        tripId: trips[2].id,
        startDate: date3,
      },
    },
    update: {},
    create: {
      user: { connect: { id: users.customers[2].id } },
      trip: { connect: { id: trips[2].id } },
      startDate: date3,
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

  // Use count check or unique key for reviews if possible, but here we'll just check existence
  const existingReview = await prisma.review.findFirst({
    where: { userId: users.customers[0].id, tripId: trips[3].id },
  });
  if (!existingReview) {
    await prisma.review.create({
      data: {
        user: { connect: { id: users.customers[0].id } },
        trip: { connect: { id: trips[3].id } },
        rating: 5,
        comment: "Amazing experience! The guides were professional and the rapids were thrilling.",
      },
    });
  }

  // Defensive check for TripInquiry
  const inquiryEmail = "vikram.m@email.com";
  const existingInquiry = await prisma.tripInquiry.findFirst({
    where: { email: inquiryEmail },
  });
  if (!existingInquiry) {
    await prisma.tripInquiry.create({
      data: {
        name: "Vikram Mehta",
        email: inquiryEmail,
        phoneNumber: "+91-9988776655",
        destination: "Manali-Leh",
        dates: "July 2026",
        budget: "80000-100000",
        details: "Interested in bike expedition for 2 people",
        status: "NEW",
      },
    });
  }

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

    if (process.env.FORCE_RESET === "true") {
      console.log("\n🗑️  Clearing existing data (FORCE_RESET=true)...");
      await prisma.$transaction([
        // Delete dependent records first
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
        prisma.auditLog.deleteMany(),
        prisma.siteConfig.deleteMany(),
        // Delete user relationships
        prisma.userRole.deleteMany(),
        prisma.user.deleteMany(),
        // Delete role relationships and roles
        prisma.rolePermission.deleteMany(),
        prisma.role.deleteMany(),
        prisma.permission.deleteMany(),
      ]);
      console.log("✅ Database cleared");
    } else {
      console.log("\n🛡️  Skipping database clear (idempotent mode)");
    }

    const roles = await createRolesAndPermissions();
    const users = await createUsers(roles);

    if (process.env.SEED_DEMO_DATA === "true") {
      const images = await createImages(users);
      const trips = await createTrips(users, images);
      await createHeroSlides();
      await createBlogs(users, trips, images);
      await createBookingsAndPayments(users, trips);
      await createReviewsAndInquiries(users, trips);
    }

    await createSiteConfig();

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║              ✨ SEED COMPLETED SUCCESSFULLY ✨             ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    console.log("\n📊 Summary:");
    console.log("   • 4 Roles with permissions");
    if (process.env.SEED_DEMO_DATA === "true") {
      console.log("   • 7 Users (1 admin, 1 manager, 2 guides, 3 customers)");
      console.log("   • 6 Images");
      console.log("   • 5 Featured trips");
      console.log("   • 3 Hero slides");
      console.log("   • 2 Blog posts");
      console.log("   • 3 Bookings (2 confirmed, 1 pending)");
      console.log("   • 2 Payments");
    } else {
      console.log("   • System Users (Super Admin, Admin)");
      console.log("   • Site configuration");
    }

    console.log("\n🔑 Login Credentials:");
    console.log(
      `   Super Admin: ${process.env.SUPER_ADMIN_EMAIL || "super.admin@paramadventures.com"}`,
    );
    console.log(`   Admin:       ${process.env.ADMIN_EMAIL}`);
    if (process.env.SEED_DEMO_DATA === "true") {
      console.log(`   Manager:  manager@paramadventures.com / Demo@2026`);
      console.log(`   Guide:    guide.rahul@paramadventures.com / Demo@2026`);
      console.log(`   Customer: amit.patel@email.com / Demo@2026\n`);
    }
  } catch (error: any) {
    console.error("\n❌ Seed failed:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
