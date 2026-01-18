/**
 * Comprehensive Demo Data Seed Script
 * - Multiple users with different roles
 * - Sample blog posts/journals
 * - Demo credentials
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Demo credentials to display at end
const DEMO_CREDENTIALS = {
  superAdmin: {
    email: "admin@paramadventures.com",
    password: "Admin@123",
    name: "Admin User",
    role: "ADMIN",
  },
  admin: {
    email: "manager@paramadventures.com",
    password: "Manager@123",
    name: "Travel Manager",
    role: "ADMIN",
  },
  contentCreator: {
    email: "writer@paramadventures.com",
    password: "Writer@123",
    name: "Sarah Johnson",
    role: "CONTENT_CREATOR",
  },
  guide: {
    email: "guide@paramadventures.com",
    password: "Guide@123",
    name: "Rajesh Kumar",
    role: "GUIDE",
  },
  regularUser1: {
    email: "user1@example.com",
    password: "User@123",
    name: "Alex Thompson",
    role: "USER",
  },
  regularUser2: {
    email: "user2@example.com",
    password: "User@123",
    name: "Priya Sharma",
    role: "USER",
  },
};

const DEMO_BLOGS = [
  {
    title: "My First Everest Base Camp Trek - A Life-Changing Journey",
    slug: "everest-base-camp-experience",
    excerpt:
      "Reaching the base camp at 5,364m was the most incredible experience of my life. Here's how I prepared and what I learned along the way.",
    content: {
      blocks: [
        {
          type: "heading",
          data: { level: 2, text: "The Journey Begins" },
        },
        {
          type: "paragraph",
          data: {
            text: "Standing at the Everest Base Camp, surrounded by the majesty of the Himalayas, I realized that all the training, sacrifice, and determination had been worth it. The air was thin, the temperature was dropping, but my heart was full.",
          },
        },
        {
          type: "heading",
          data: { level: 2, text: "Day-by-Day Breakdown" },
        },
        {
          type: "paragraph",
          data: {
            text: "Day 1-2: Acclimatization in Kathmandu. Day 3: Lukla to Phakding. Day 4-7: Steady climb through Namche Bazaar and higher camps. Days 8-10: Summit push and descent.",
          },
        },
      ],
    },
    theme: "modern",
    status: "PUBLISHED",
  },
  {
    title: "Hidden Gems in Kerala Backwaters: Off the Beaten Path",
    slug: "kerala-backwaters-hidden-gems",
    excerpt:
      "Discover the serene beauty of Kerala's backwaters beyond the tourist hotspots. Local insights and photography.",
    content: {
      blocks: [
        {
          type: "heading",
          data: {
            level: 2,
            text: "Why Kerala Backwaters Should Be on Your Bucket List",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "The Kerala backwaters are a network of lagoons and lakes lying parallel to the Arabian Sea coast. What makes them special is the unique ecosystem and the authentic lifestyle of the locals.",
          },
        },
        {
          type: "heading",
          data: { level: 2, text: "Best Time to Visit" },
        },
        {
          type: "paragraph",
          data: {
            text: "September to February offers the best weather for backwater cruises. The water is calm, and the temperatures are comfortable for exploring.",
          },
        },
      ],
    },
    theme: "modern",
    status: "PUBLISHED",
  },
  {
    title: "Manali to Leh Expedition: Road Trip Diaries",
    slug: "manali-leh-road-trip",
    excerpt:
      "An epic 5-day motorcycle journey through one of the world's highest motorable passes. Adventure, challenges, and stunning vistas.",
    content: {
      blocks: [
        {
          type: "heading",
          data: {
            level: 2,
            text: "Conquering Khardung La: Asia's Highest Motorable Pass",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "At 5,359 meters, Khardung La is not just a pass; it's a rite of passage for adventure seekers. The ride up is intense, the view from the top is worth every moment of struggle.",
          },
        },
        {
          type: "heading",
          data: { level: 2, text: "Essential Tips for the Journey" },
        },
        {
          type: "paragraph",
          data: {
            text: "Acclimatize properly in Leh before attempting high passes. Carry extra fuel and emergency supplies. Start early to avoid mountain passes after dark.",
          },
        },
      ],
    },
    theme: "modern",
    status: "PUBLISHED",
  },
  {
    title: "Paragliding in Bir-Billing: Soaring Over the Himalayas",
    slug: "paragliding-bir-billing",
    excerpt:
      "Experience the thrill of flying above the Himalayan foothills. A beginner's guide to paragliding at India's top destination.",
    content: {
      blocks: [
        {
          type: "heading",
          data: { level: 2, text: "First Flight - Nerves and Exhilaration" },
        },
        {
          type: "paragraph",
          data: {
            text: "My heart was pounding as I stepped off the cliff at Billing. For just a second, I felt weightless before the paraglute opened and I soared into the sky. The valley below looked like a miniature world.",
          },
        },
        {
          type: "heading",
          data: { level: 2, text: "Why Bir-Billing is Perfect for Beginners" },
        },
        {
          type: "paragraph",
          data: {
            text: "With reliable thermals and experienced instructors, Bir-Billing is the safest place to start your paragliding journey. The views of the Dhauladhar range are breathtaking.",
          },
        },
      ],
    },
    theme: "modern",
    status: "PUBLISHED",
  },
  {
    title: "White Water Rafting in Rishikesh: Adventure on the Ganges",
    slug: "rishikesh-white-water-rafting",
    excerpt:
      "Navigate the thrilling rapids of the Ganges River. Adrenaline, nature, and spiritual vibes in one unforgettable experience.",
    content: {
      blocks: [
        {
          type: "heading",
          data: { level: 2, text: "Rapids Ahead: The Rishikesh Experience" },
        },
        {
          type: "paragraph",
          data: {
            text: "Rishikesh is known as the yoga capital, but few realize it's also one of India's best rafting destinations. The Ganges here offers a mix of technical rapids and scenic stretches.",
          },
        },
        {
          type: "heading",
          data: { level: 2, text: "What to Expect" },
        },
        {
          type: "paragraph",
          data: {
            text: "Depending on the season and water level, rafting here ranges from class II to class V rapids. Professional guides ensure safety while providing an adrenaline-pumping experience.",
          },
        },
      ],
    },
    theme: "modern",
    status: "PUBLISHED",
  },
];

async function seedDemoData() {
  console.log("\n" + "=".repeat(80));
  console.log("🌱 SEEDING DEMO DATA - Users, Roles, and Blogs");
  console.log("=".repeat(80) + "\n");

  try {
    // 1. Setup Roles
    console.log("1️⃣  Setting up roles...");

    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: { name: "ADMIN", description: "System administrator" },
      }),
      prisma.role.upsert({
        where: { name: "CONTENT_CREATOR" },
        update: {},
        create: {
          name: "CONTENT_CREATOR",
          description: "Blog and content writer",
        },
      }),
      prisma.role.upsert({
        where: { name: "GUIDE" },
        update: {},
        create: { name: "GUIDE", description: "Trip guide and organizer" },
      }),
      prisma.role.upsert({
        where: { name: "USER" },
        update: {},
        create: { name: "USER", description: "Regular user" },
      }),
    ]);

    console.log("   ✅ Roles setup complete");

    // 2. Setup Permissions
    console.log("\n2️⃣  Setting up permissions...");

    const permissionsData = [
      { key: "admin:dashboard", description: "Access admin dashboard" },
      { key: "admin:users", description: "Manage users" },
      { key: "admin:trips", description: "Manage trips" },
      { key: "admin:bookings", description: "View bookings" },
      { key: "admin:blogs", description: "Manage blog posts" },
      { key: "content:create", description: "Create blog posts" },
      { key: "content:edit", description: "Edit blog posts" },
      { key: "content:publish", description: "Publish blog posts" },
      { key: "trips:guide", description: "Guide trips" },
      { key: "user:book", description: "Book trips" },
      { key: "user:view_bookings", description: "View own bookings" },
      { key: "user:profile", description: "Update profile" },
      { key: "public:view", description: "View public content" },
    ];

    const permissions = [];
    for (const permData of permissionsData) {
      const perm = await prisma.permission.upsert({
        where: { key: permData.key },
        update: {},
        create: permData,
      });
      permissions.push(perm);
    }
    console.log(`   ✅ ${permissions.length} permissions created`);

    // 3. Assign permissions to roles
    console.log("\n3️⃣  Assigning permissions to roles...");

    // Admin permissions (all)
    const adminRole = roles[0];
    await prisma.rolePermission.deleteMany({
      where: { roleId: adminRole.id },
    });
    for (const perm of permissions) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id },
      });
    }
    console.log("   ✅ ADMIN role: All permissions");

    // Content Creator permissions
    const contentRole = roles[1];
    await prisma.rolePermission.deleteMany({
      where: { roleId: contentRole.id },
    });
    for (const perm of permissions.filter(
      (p) => p.key.startsWith("content:") || p.key.startsWith("public:"),
    )) {
      await prisma.rolePermission.create({
        data: { roleId: contentRole.id, permissionId: perm.id },
      });
    }
    console.log("   ✅ CONTENT_CREATOR role: Content permissions");

    // Guide permissions
    const guideRole = roles[2];
    await prisma.rolePermission.deleteMany({
      where: { roleId: guideRole.id },
    });
    for (const perm of permissions.filter((p) =>
      ["trips:guide", "user:book", "public:view", "user:view_bookings"].includes(p.key),
    )) {
      await prisma.rolePermission.create({
        data: { roleId: guideRole.id, permissionId: perm.id },
      });
    }
    console.log("   ✅ GUIDE role: Trip guide permissions");

    // User permissions
    const userRole = roles[3];
    await prisma.rolePermission.deleteMany({
      where: { roleId: userRole.id },
    });
    for (const perm of permissions.filter((p) =>
      ["user:book", "user:view_bookings", "user:profile", "public:view"].includes(p.key),
    )) {
      await prisma.rolePermission.create({
        data: { roleId: userRole.id, permissionId: perm.id },
      });
    }
    console.log("   ✅ USER role: Basic user permissions");

    // 4. Create or update users
    console.log("\n4️⃣  Creating demo users...");

    const users = {};

    for (const [key, cred] of Object.entries(DEMO_CREDENTIALS)) {
      const hashedPassword = await bcrypt.hash(cred.password, 10);

      const user = await prisma.user.upsert({
        where: { email: cred.email },
        update: {
          password: hashedPassword,
          name: cred.name,
          status: "ACTIVE",
        },
        create: {
          email: cred.email,
          password: hashedPassword,
          name: cred.name,
          status: "ACTIVE",
        },
        include: { roles: true },
      });

      users[key] = user;

      // Assign role
      const roleToAssign = roles.find((r) => r.name === cred.role);
      const hasRole = user.roles.some((ur) => ur.roleId === roleToAssign.id);

      if (!hasRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: roleToAssign.id,
          },
        });
      }

      console.log(`   ✅ ${cred.name} (${cred.role})`);
    }

    // 5. Create demo blogs
    console.log("\n5️⃣  Creating demo blog posts...");

    let blogsCreated = 0;

    for (let i = 0; i < DEMO_BLOGS.length; i++) {
      const blogData = DEMO_BLOGS[i];
      const author = i % 2 === 0 ? users.contentCreator : users.guide;

      const blog = await prisma.blog.upsert({
        where: { slug: blogData.slug },
        update: {
          title: blogData.title,
          content: blogData.content,
          status: blogData.status,
        },
        create: {
          ...blogData,
          authorId: author.id,
        },
      });

      console.log(`   ✅ ${blog.title}`);
      blogsCreated++;
    }

    // 6. Summary
    console.log("\n" + "=".repeat(80));
    console.log("✅ DEMO DATA SETUP COMPLETE!");
    console.log("=".repeat(80));

    console.log("\n📋 DEMO USERS & CREDENTIALS:\n");

    for (const [key, cred] of Object.entries(DEMO_CREDENTIALS)) {
      console.log(`┌─ ${cred.role}`);
      console.log(`├─ Name: ${cred.name}`);
      console.log(`├─ Email: ${cred.email}`);
      console.log(`└─ Password: ${cred.password}\n`);
    }

    console.log("📝 BLOG POSTS CREATED:\n");
    console.log(`✅ ${blogsCreated} published blog posts ready for the JOURNAL section\n`);

    console.log("🔑 KEY CREDENTIALS:\n");
    console.log(`Super Admin: admin@paramadventures.com / Admin@123`);
    console.log(`Manager: manager@paramadventures.com / Manager@123`);
    console.log(`Content Creator: writer@paramadventures.com / Writer@123\n`);

    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
