require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

async function main() {
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
    "user:assign-role",
    "user:remove-role",
    "role:list",
  ];

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
      description: "Can create and edit draft trips",
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

  const publicRole = await prisma.role.upsert({
    where: { name: "PUBLIC" },
    update: {},
    create: { name: "PUBLIC", description: "Public visitors", isSystem: false },
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

  // Assign suggested mappings
  await grantPermissionsToRole(uploaderRole, [
    "trip:create",
    "trip:edit",
    "trip:submit",
  ]);
  await grantPermissionsToRole(adminRole, [
    "trip:approve",
    "trip:publish",
    "trip:archive",
    // booking admin reads
    "booking:read:admin",
  ]);
  await grantPermissionsToRole(publicRole, ["trip:view:public"]);

  // Booking-related grants
  await grantPermissionsToRole(publicRole, ["booking:create", "booking:view"]);
  await grantPermissionsToRole(uploaderRole, ["booking:view"]);
  await grantPermissionsToRole(adminRole, [
    "booking:approve",
    "booking:reject",
    "booking:cancel",
    "booking:view",
  ]);

  // Blog-related grants
  await grantPermissionsToRole(userRole, [
    "blog:create",
    "blog:update",
    "blog:submit",
  ]);
  await grantPermissionsToRole(adminRole, [
    "blog:approve",
    "blog:reject",
    "blog:publish",
  ]);

  // Seed a sensible default capacity for existing trips
  await prisma.trip.updateMany({ data: { capacity: 10 } });

  // Seed Default Hero Slides
  const heroSlides = [
    {
      title: "Trek and Camping",
      subtitle: "Experience the raw beauty of nature.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hiking-in-the-snow-along-a-path-4318-large.mp4",
      ctaLink: "/trips?category=trekking",
      order: 1,
    },
    {
      title: "Corporate Trips",
      subtitle: "Build stronger teams in nature.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-walking-through-the-forest-98-large.mp4", 
      ctaLink: "/trips?category=corporate",
      order: 2,
    },
    {
      title: "Educational Trips",
      subtitle: "Learning through exploration.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-students-walking-in-university-hallway-4835-large.mp4",
      ctaLink: "/trips?category=education",
      order: 3,
    },
    {
      title: "Spiritual Trips",
      subtitle: "Find your inner peace.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4",
      ctaLink: "/trips?category=spiritual",
      order: 4,
    },
    {
      title: "Custom Trip",
      subtitle: "Your adventure, your way.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-family-walking-together-in-nature-39767-large.mp4",
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
      password: "hashed_password_placeholder", // In real app, hash this
      roles: {
        create: [
          { role: { connect: { name: "SUPER_ADMIN" } } },
          { role: { connect: { name: "ADMIN" } } }
        ]
      }
    }
  });

  // Seed Trips with Categories
  const tripsData = [
    {
      title: "Everest Base Camp Trek",
      slug: "everest-base-camp",
      description: "A legendary trek to the base of the world's highest mountain.",
      itinerary: {},
      durationDays: 14,
      difficulty: "Hard",
      location: "Nepal",
      price: 1400,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop",
      capacity: 15,
      createdById: systemAdminContent.id
    },
    {
      title: "Kyoto Cherry Blossom Tour",
      slug: "kyoto-cherry-blossom",
      description: "Experience the magic of Japan's cherry blossom season.",
      itinerary: {},
      durationDays: 9,
      difficulty: "Easy",
      location: "Japan",
      price: 2200,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop",
      capacity: 20,
      createdById: systemAdminContent.id
    },
    {
      title: "Iceland Northern Lights",
      slug: "iceland-northern-lights",
      description: "Hunt for the aurora borealis in the land of fire and ice.",
      itinerary: {},
      durationDays: 7,
      difficulty: "Moderate",
      location: "Iceland",
      price: 1800,
      status: "PUBLISHED",
      category: "TREK", 
      coverImageLegacy: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2670&auto=format&fit=crop",
      capacity: 12,
      createdById: systemAdminContent.id
    },
    {
      title: "Corporate Leadership Retreat",
      slug: "corporate-leadership-retreat",
      description: "Develop leadership skills in the wilderness.",
      itinerary: {},
      durationDays: 3,
      difficulty: "Easy",
      location: "Himachal Pradesh",
      price: 500,
      status: "PUBLISHED",
      category: "CORPORATE",
      coverImageLegacy: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
      capacity: 50,
      createdById: systemAdminContent.id
    },
    {
      title: "Himalayan Geology Tour",
      slug: "himalayan-geology-tour",
      description: "A geological survey of the world's youngest mountain range.",
      itinerary: {},
      durationDays: 10,
      difficulty: "Moderate",
      location: "Ladakh",
      price: 1200,
      status: "PUBLISHED",
      category: "EDUCATIONAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop",
      capacity: 25,
      createdById: systemAdminContent.id
    }
  ];

  for (const trip of tripsData) {
    await prisma.trip.upsert({
        where: { slug: trip.slug },
        update: { category: trip.category },
        create: trip
    });
  }

  // Force update existing
  for (const slide of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({ where: { title: slide.title } });
    if (existing) {
       await prisma.heroSlide.update({ where: { id: existing.id }, data: { videoUrl: slide.videoUrl }});
    } else {
       await prisma.heroSlide.create({ data: slide });
    }
  }

  // Seed Default Site Configs
  const siteConfigs = [
    { key: "auth_login_image", value: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop", label: "Login Page Image" },
    { key: "auth_signup_image", value: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop", label: "Signup Page Image" },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
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
