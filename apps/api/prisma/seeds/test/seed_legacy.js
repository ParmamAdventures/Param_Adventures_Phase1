import "dotenv/config.js";
import bcrypt from "bcryptjs";
import { PrismaClient  } from "@prisma/client";





const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("password123", 12);
  const permissions = [
    "user:read",
    "user:assign-role",
    // trip permissions
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:approve",
    "trip:publish",
    "trip:archive",
    "trip:view:internal",
    "trip:view:public",
    "trip:delete",
    // booking permissions
    "booking:create",
    "booking:approve",
    "booking:reject",
    "booking:cancel",
    "booking:view",
    "booking:read:admin",
    // blog permissions
    "blog:create",
    "blog:update",
    "blog:submit",
    "blog:approve",
    "blog:reject",
    "blog:publish",
    "audit:read",
    // Admin management permissions
    "user:list",
    "user:view",
    "user:edit",
    "user:delete",
    "user:assign-role",
    "user:remove-role",
    "role:list",
    "role:assign",
    "role:revoke",
    "media:upload",
    "media:view",
    "media:delete",
    "audit:view",
    "audit:read",
    "trip:assign-guide",
    "trip:update-status",
    "trip:view:guests",
    "trip:delete", // Added
  ];

  // SUPER ADMIN gets everything via Role-Permissions loop naturally because we add it to 'permissions' list
  // But wait, the loop (line 77) adds ALL permissions to SUPER_ADMIN role. 
  // So just adding to the array at line 10-55 is enough for Super Admin.
  // We DO NOT add it to 'ADMIN' role grant below.

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "System super administrator",
      isSystem: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create standard roles and assign trip-related permissions
  const uploaderRole = await prisma.role.upsert({
    where: { name: "UPLOADER" },
    update: {},
    create: {
      name: "UPLOADER",
      description: "Can create and edit draft trips and content",
      isSystem: false,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Admin role", isSystem: false },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER", description: "Standard authenticated user", isSystem: false },
  });

  const tripManagerRole = await prisma.role.upsert({
    where: { name: "TRIP_MANAGER" },
    update: {},
    create: {
      name: "TRIP_MANAGER",
      description: "Manages specific trip logistics and guides",
      isSystem: false,
    },
  });

  const tripGuideRole = await prisma.role.upsert({
    where: { name: "TRIP_GUIDE" },
    update: {},
    create: { name: "TRIP_GUIDE", description: "On-site trip guide", isSystem: false },
  });

  // helper to grant permission keys to a role
  async function grantPermissionsToRole(role, keys) {
    for (const key of keys) {
      const p = await prisma.permission.findUnique({ where: { key } });
      if (!p) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id },
      });
    }
  }

  // 1. ADMIN - Almost full access
  await grantPermissionsToRole(adminRole, [
    "trip:create",
    "trip:edit",
    "trip:submit",
    "trip:approve",
    "trip:publish",
    "trip:archive",
    "trip:view:internal",
    "booking:read:admin",
    "booking:approve",
    "booking:reject",
    "booking:cancel",
    "booking:view",
    "user:list",
    "user:view",
    "role:list",
    "media:view",
    "media:upload",
    "media:delete",
    "audit:view",
    "blog:approve",
    "blog:reject",
    "blog:publish",
    "trip:assign-guide",
    "trip:update-status",
    "trip:view:guests",
  ]);

  // 2. USER - Standard Traveler
  await grantPermissionsToRole(userRole, [
    "blog:create",
    "blog:update",
    "blog:submit",
    "booking:create",
    "booking:view", // Can view their own bookings
  ]);

  // 3. UPLOADER - Content Creator
  await grantPermissionsToRole(uploaderRole, [
    "trip:create",
    "trip:edit",
    "trip:submit",
    "blog:create",
    "blog:update",
    "blog:submit",
    "media:upload",
    "media:view",
  ]);

  // 4. TRIP MANAGER - Logistics
  await grantPermissionsToRole(tripManagerRole, [
    "trip:view:internal",
    "trip:assign-guide",
    "trip:view:guests",
    "trip:update-status",
    "booking:view",
    "media:view",
    "media:upload",
  ]);

  // 5. TRIP GUIDE - On ground
  await grantPermissionsToRole(tripGuideRole, [
    // "trip:view:internal", // REMOVED: Guides should use Guide Portal, not Manager Portal
    "trip:view:guests",
    "trip:update-status",
    "media:view",
    "media:upload",
  ]);

  // Seed a sensible default capacity for existing trips
  await prisma.trip.updateMany({ data: { capacity: 10 } });

  // Seed Default Hero Slides
  const heroSlides = [
    {
      title: "Trek and Camping",
      subtitle: "Experience the raw beauty of nature.",
      videoUrl: "/seed/trek.mp4",
      ctaLink: "/trips?category=trekking",
      order: 1,
    },
    {
      title: "Corporate Trips",
      subtitle: "Build stronger teams in nature.",
      videoUrl: "/seed/corporate.mp4",
      ctaLink: "/trips?category=corporate",
      order: 2,
    },
    {
      title: "Educational Trips",
      subtitle: "Learning through exploration.",
      videoUrl: "/seed/education.mp4",
      ctaLink: "/trips?category=education",
      order: 3,
    },
    {
      title: "Spiritual Trips",
      subtitle: "Find your inner peace.",
      videoUrl: "/seed/spiritual.mp4",
      ctaLink: "/trips?category=spiritual",
      order: 4,
    },
    {
      title: "Custom Trip",
      subtitle: "Your adventure, your way.",
      videoUrl: "/seed/custom.mp4",
      ctaLink: "/contact",
      order: 5,
    },
  ];

  // Create a default admin user for trip creation
  const systemAdminContent = await prisma.user.upsert({
    where: { email: "admin@paramadventures.com" },
    update: {},
    create: {
      email: "admin@paramadventures.com",
      name: "System Admin",
      password: adminPassword,
      roles: {
        create: [
          { role: { connect: { name: "SUPER_ADMIN" } } },
          { role: { connect: { name: "ADMIN" } } },
        ],
      },
    },
  });

  // Seed Trips with Categories and Rich Data
  const tripsData = [
    {
      title: "Everest Base Camp Trek",
      slug: "everest-base-camp",
      description: "A legendary trek to the base of the world's highest mountain. Experience the Sherpa culture, visit ancient monasteries, and stand beneath the towering peak of sagarmatha.",
      location: "Nepal",
      price: 1400,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "/seed/everest.png",
      capacity: 15,
      createdById: systemAdminContent.id,
      durationDays: 14,
      difficulty: "Hard",
      highlights: [
        "Reach EBC at 5,364m",
        "View of Khumbu Icefall",
        "Visit Tengboche Monastery",
        "Scenic flight to Lukla",
      ],
      inclusions: [
        "Airport transfers",
        "3 nights hotel in Kathmandu",
        "Teahouse accommodation during trek",
        "All meals during trek",
        "Experienced guide and porters",
      ],
      exclusions: [
        "International airfare",
        "Travel insurance (compulsory)",
        "Personal equipment",
        "Tips for guide/porters",
      ],
      thingsToPack: [
        "Down jacket (-20C)",
        "Sleeping bag",
        "Trekking poles",
        "Water purification tablets",
        "Sunscreen and sunglasses",
      ],
      seasons: ["Spring (Mar-May)", "Autumn (Sep-Nov)"],
      faqs: [
        {
          question: "How difficult is the trek?",
          answer: "It is challenging due to altitude, but no technical climbing skills are required.",
        },
        {
          question: "Is there wifi?",
          answer: "Yes, most teahouses offer paid Wi-Fi, but it can be unreliable.",
        },
      ],
      itinerary: {
        days: [
          { day: 1, title: "Arrival in Kathmandu", description: "Transfer to hotel and briefing." },
          { day: 2, title: "Fly to Lukla, Trek to Phakding", description: "The adventure begins with a thrilling flight." },
          { day: 3, title: "Trek to Namche Bazaar", description: "Steep climb to the Sherpa capital." },
          { day: 4, title: "Acclimatization Day in Namche", description: "Hike to Everest View Hotel." },
          { day: 8, title: "Reach Everest Base Camp", description: "The highlight of the trip!" },
          { day: 14, title: "Fly back to Kathmandu", description: "Celebratory dinner." },
        ],
      },
    },
    {
      title: "Kyoto Cherry Blossom Tour",
      slug: "kyoto-cherry-blossom",
      description: "Experience the magic of Japan's cherry blossom season. Visit ancient temples, participate in tea ceremonies, and walk through the philosopher's path under a canopy of pink.",
      location: "Japan",
      price: 2200,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "/seed/kyoto.png",
      capacity: 20,
      createdById: systemAdminContent.id,
      durationDays: 9,
      difficulty: "Easy",
      highlights: [
        "Fushimi Inari Shrine",
        "Private Tea Ceremony",
        "Arashiyama Bamboo Grove",
        "Geisha performance in Gion",
      ],
      inclusions: [
        "JR Rail Pass (7 days)",
        "4-star accommodation",
        "Daily breakfast",
        "Cultural activities fees",
      ],
      exclusions: ["Flights to Japan", "Lunch and Dinner", "Personal shopping"],
      thingsToPack: ["Comfortable walking shoes", "Camera", "Universal adapter", "Light jacket"],
      seasons: ["Spring (Late Mar-Early Apr)"],
      faqs: [
        {
          question: "Will we definitely see cherry blossoms?",
          answer: "Nature is unpredictable, but we time the tour for peak average bloom dates.",
        },
      ],
      itinerary: {
        days: [
          { day: 1, title: "Arrival in Tokyo", description: "Welcome dinner in Shinjuku." },
          { day: 2, title: "Bullet Train to Kyoto", description: "Move to the ancient capital." },
          { day: 3, title: "Temples & Zen Gardens", description: "Visit Kinkaku-ji and Ryoan-ji." },
          { day: 9, title: "Departure", description: "Transfer to Osaka Kansai Airport." },
        ],
      },
      cancellationPolicy: {
        text: "Cancel up to 30 days before for full refund.",
      },
    },
    {
      title: "Iceland Northern Lights",
      slug: "iceland-northern-lights",
      description: "Hunt for the aurora borealis in the land of fire and ice. Explore waterfalls, black sand beaches, and glaciers by day, and the sky by night.",
      location: "Iceland",
      price: 1800,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "/seed/iceland.png",
      capacity: 12,
      createdById: systemAdminContent.id,
      durationDays: 7,
      difficulty: "Moderate",
      highlights: [
        "Northern Lights boat tour",
        "Blue Lagoon soak",
        "Skogafoss Waterfall",
        "Glacier hiking",
      ],
      inclusions: ["4x4 Super Jeep rental", "Guesthouse accommodation", "Guided tours", "Breakfast"],
      exclusions: ["International flights", "Lunch and Dinner", "Alcohol"],
      thingsToPack: [
        "Waterproof pants and jacket",
        "Thermal base layers",
        "Wool socks",
        "Tripod for photography",
      ],
      seasons: ["Winter (Oct-Mar)"],
      faqs: [
        {
          question: "How cold will it be?",
          answer: "Expect temperatures around -5C to 5C, but wind chill can make it feel colder.",
        },
      ],
      itinerary: {
        days: [
          { day: 1, title: "Reykjavik Arrival", description: "Explore the northernmost capital." },
          { day: 2, title: "Golden Circle Route", description: "Geysers and tectonic plates." },
          { day: 3, title: "South Coast", description: "Black sand beaches of Vik." },
          { day: 7, title: "Blue Lagoon & Departure", description: "Relax before your flight." },
        ],
      },
    },
    {
      title: "Corporate Leadership Retreat",
      slug: "corporate-leadership-retreat",
      description: "Develop leadership skills in the wilderness. A mix of intense team challenges and reflective campfire sessions in the Himalayas.",
      location: "Himachal Pradesh",
      price: 500,
      status: "PUBLISHED",
      category: "CORPORATE",
      coverImageLegacy: "/seed/hero.png",
      capacity: 50,
      createdById: systemAdminContent.id,
      durationDays: 3,
      difficulty: "Easy",
      highlights: [
        "Team obstacle course",
        "Strategic war games",
        "Leadership workshops",
        "Bonfire networking",
      ],
      inclusions: ["Luxury tented accommodation", "All meals and beverages", "Workshop materials"],
      exclusions: ["Transport to venue", "Personal expenses"],
      thingsToPack: ["Sportswear", "Notebook", "Business casual for dinner"],
      seasons: ["All year round"],
      faqs: [
        {
          question: "Can we customize the agenda?",
          answer: "Yes, we tailor the workshops to your company's goals.",
        },
      ],
      itinerary: {
        days: [
          { day: 1, title: "Ice Breaking & Strategy", description: "Team formation and initial challenges." },
          { day: 2, title: "Wilderness Survival", description: "Practical problem solving in nature." },
          { day: 3, title: "Closing Ceremony", description: "Awards and future roadmap." },
        ],
      },
    },
    {
      title: "Himalayan Geology Tour",
      slug: "himalayan-geology-tour",
      description: "A geological survey of the world's youngest mountain range. Perfect for students and enthusiasts interested in plate tectonics.",
      location: "Ladakh",
      price: 1200,
      status: "PUBLISHED",
      category: "EDUCATIONAL",
      coverImageLegacy: "/seed/everest.png",
      capacity: 25,
      createdById: systemAdminContent.id,
      durationDays: 10,
      difficulty: "Moderate",
      highlights: [
        "Tso Moriri Lake",
        "Fossil hunting in Spiti",
        "Visit Magnetic Hill",
        "Lectures by expert geologists",
      ],
      inclusions: ["Transport in traveller bus", "Dormitory stay", "Field guide books", "All meals"],
      exclusions: ["Flights to Leh", "Personal gear"],
      thingsToPack: ["Rock hammer (optional)", "Field notebook", "Sun protection", "Warm layers"],
      seasons: ["Summer (Jun-Aug)"],
      faqs: [
        {
          question: "Is this course for credit?",
          answer: "It can be credited towards university fieldwork requirements.",
        },
      ],
      itinerary: {
        days: [
          { day: 1, title: "Fly to Leh", description: "Acclimatization is mandatory." },
          { day: 2, title: "Indus Valley", description: "Study sedimentation layers." },
          { day: 5, title: "Nubra Valley", description: "Cross the high pass of Khardung La." },
          { day: 10, title: "Wrap up", description: "Final presentation of findings." },
        ],
      },
    },
  ];

  for (const trip of tripsData) {
    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: {
        category: trip.category,
        coverImageLegacy: trip.coverImageLegacy,
        highlights: trip.highlights,
        inclusions: trip.inclusions,
        exclusions: trip.exclusions,
        thingsToPack: trip.thingsToPack,
        seasons: trip.seasons,
        faqs: trip.faqs,
        itinerary: trip.itinerary,
        cancellationPolicy: trip.cancellationPolicy || {},
        description: trip.description, // Ensure description updates too
        difficulty: trip.difficulty,
        durationDays: trip.durationDays,
      },
      create: trip,
    });
  }

  // Force update existing
  for (const slide of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({ where: { title: slide.title } });
    if (existing) {
      await prisma.heroSlide.update({
        where: { id: existing.id },
        data: { videoUrl: slide.videoUrl },
      });
    } else {
      await prisma.heroSlide.create({ data: slide });
    }
  }

  // Seed Default Site Configs (Updated with local images)
  const siteConfigs = [
    {
      key: "auth_login_image",
      value: "/seed/everest.png",
      label: "Login Page Image",
    },
    {
      key: "auth_signup_image",
      value: "/seed/iceland.png",
      label: "Signup Page Image",
    },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  // --- BLOG SEEDING ---
  console.log("Seeding sample blogs...");

  const BLOG_TEMPLATES = [
    {
      id: "day-by-day",
      name: "Day-by-Day Journal (Journal Theme)",
      description: "Chronicle your adventure day by day. Perfect for long treks.",
      theme: "journal",
      image: "/seed/everest.png",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Journey Overview" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "A brief summary of the entire trip... We started early morning and the weather was perfect for a long hike.",
              },
            ],
          },
        ],
      },
    },
    {
      id: "photo-showcase",
      name: "Photo Showcase (Minimal Theme)",
      description: "Let the pictures do the talking. Heavy on gallery usage.",
      theme: "minimal",
      image: "/seed/iceland.png",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Visual Highlights" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "The most stunning moments captured on camera." }],
          },
        ],
      },
    },
    {
      id: "culinary-journey",
      name: "Culinary Journey (Vibrant Theme)",
      description: "Focus on the local flavors, street food, and mountain meals.",
      theme: "vibrant",
      image: "/seed/kyoto.png",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "A Taste of the Mountains" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Exploring the region through its food..." }],
          },
        ],
      },
    },
  ];

  const firstTrip = await prisma.trip.findFirst();

  if (systemAdminContent && firstTrip) {
    // --- BLOG SEEDING ---
    console.log("Seeding sample blogs...");
    for (const template of BLOG_TEMPLATES) {
      // 1. Create Image Record
      const blogImage = await prisma.image.create({
        data: {
          originalUrl: template.image,
          mediumUrl: template.image,
          thumbUrl: template.image,
          width: 800,
          height: 600,
          size: 1024,
          mimeType: "image/png",
          uploadedById: systemAdminContent.id,
        }
      });

      const slug = template.id;
      // 2. Create Blog linked to Image
      await prisma.blog.upsert({
        where: { slug },
        update: {
           coverImageId: blogImage.id,
           title: template.name,
           excerpt: template.description,
           content: template.content,
           theme: template.theme,
        },
        create: {
          title: template.name,
          slug: slug,
          excerpt: template.description,
          content: template.content,
          theme: template.theme,
          coverImageId: blogImage.id,
          status: "PUBLISHED",
          authorId: systemAdminContent.id,
          tripId: firstTrip.id,
        },
      });
    }
    console.log("Successfully seeded sample blogs!");

    // --- DUMMY USERS FOR REVIEWS ---
    console.log("Creating dummy users for reviews...");
    const dummyUsers = [
      {
        email: "sarah@example.com",
        name: "Sarah Trekker",
        password: await bcrypt.hash("password123", 12),
        roles: { create: [{ role: { connect: { name: "USER" } } }] },
      },
      {
        email: "mike@example.com",
        name: "Mike Explorer",
        password: await bcrypt.hash("password123", 12),
        roles: { create: [{ role: { connect: { name: "USER" } } }] },
      },
      {
        email: "emma@example.com",
        name: "Emma Wanderer",
        password: await bcrypt.hash("password123", 12),
        roles: { create: [{ role: { connect: { name: "USER" } } }] },
      },
    ];

    const createdUsers = [];
    for (const u of dummyUsers) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
      createdUsers.push(user);
    }

    // --- REVIEW SEEDING ---
    console.log("Seeding reviews...");
    const reviewsData = [
      {
        tripSlug: "everest-base-camp",
        rating: 5,
        comment: "An absolute life-changing experience! The guide was fantastic and the views were unmatched.",
        userIndex: 0, // Sarah
      },
      {
        tripSlug: "everest-base-camp",
        rating: 4,
        comment: "Tough trek but worth it. Make sure you train beforehand!",
        userIndex: 1, // Mike
      },
      {
        tripSlug: "kyoto-cherry-blossom",
        rating: 5,
        comment: "Magical. The tea ceremony was the highlight for me.",
        userIndex: 2, // Emma
      },
      {
        tripSlug: "kyoto-cherry-blossom",
        rating: 4,
        comment: "Beautiful scenery, but a bit crowded. Well organized though.",
        userIndex: 0, // Sarah
      },
      {
        tripSlug: "iceland-northern-lights",
        rating: 5,
        comment: "Saw the lights on the second night! Magical experience.",
        userIndex: 1, // Mike
      },
      {
        tripSlug: "iceland-northern-lights",
        rating: 5,
        comment: "Cold but stunning. The super jeep tour was exciting.",
        userIndex: 2, // Emma
      },
      {
        tripSlug: "corporate-leadership-retreat",
        rating: 5,
        comment: "Great team bonding exercise. Highly recommended for startups.",
        userIndex: 0, // Sarah
      },
    ];

    for (const review of reviewsData) {
      const targetTrip = await prisma.trip.findUnique({ where: { slug: review.tripSlug } });
      const reviewer = createdUsers[review.userIndex];

      if (targetTrip && reviewer) {
        await prisma.review.upsert({
          where: {
            userId_tripId: {
              userId: reviewer.id,
              tripId: targetTrip.id,
            },
          },
          update: {},
          create: {
            rating: review.rating,
            comment: review.comment,
            userId: reviewer.id,
            tripId: targetTrip.id,
          },
        });
      }
    }
    console.log("Successfully seeded reviews from multiple users!");

    // --- FINAL SUPER ADMIN CHECK ---
    console.log("-----------------------------------------");
    console.log("Seed Verification Complete.");
    console.log("Super Admin: admin@paramadventures.com");
    console.log("Password:    password123");
    console.log("-----------------------------------------");
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
