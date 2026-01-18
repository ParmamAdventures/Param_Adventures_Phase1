#!/usr/bin/env node

/**
 * Complete Production Seed Data
 * Creates everything needed for manual testing and deployment:
 * - Users with all roles (ADMIN, CONTENT_CREATOR, GUIDE, USER)
 * - Trips in different states (DRAFT, PUBLISHED, ARCHIVED)
 * - Blogs with rich content
 * - Hero slides for homepage
 * - Reviews, bookings, payments
 * 
 * Run: npx ts-node scripts/seed-production-complete.ts
 */

import { PrismaClient, TripStatus } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing ALL existing data...\n");

  // Delete everything in correct order
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.savedTrip.deleteMany();
  await prisma.review.deleteMany();
  await prisma.tripInquiry.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.tripGalleryImage.deleteMany();
  await prisma.tripsOnGuides.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.image.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database cleared\n");

  // ================================
  // 1. ROLES & PERMISSIONS
  // ================================
  console.log("📋 Creating roles and permissions...");

  const roles = {
    admin: await prisma.role.create({
      data: { name: "ADMIN", description: "System Administrator" },
    }),
    contentCreator: await prisma.role.create({
      data: { name: "CONTENT_CREATOR", description: "Content Writer & Editor" },
    }),
    guide: await prisma.role.create({
      data: { name: "GUIDE", description: "Tour Guide" },
    }),
    user: await prisma.role.create({
      data: { name: "USER", description: "Regular User" },
    }),
  };

  const permissionKeys = [
    "trips:read",
    "trips:create",
    "trips:update",
    "trips:delete",
    "bookings:read",
    "bookings:create",
    "bookings:update",
    "users:read",
    "users:manage",
    "blogs:create",
    "blogs:update",
    "reviews:moderate",
    "payments:view",
  ];

  const permissions = [];
  for (const key of permissionKeys) {
    const perm = await prisma.permission.create({
      data: { key, description: key },
    });
    permissions.push(perm);

    // Admin gets all permissions
    await prisma.rolePermission.create({
      data: { roleId: roles.admin.id, permissionId: perm.id },
    });
  }

  // Content creator permissions
  const contentPerms = permissions.filter((p) =>
    ["blogs:create", "blogs:update", "trips:read", "trips:create"].includes(p.key)
  );
  for (const perm of contentPerms) {
    await prisma.rolePermission.create({
      data: { roleId: roles.contentCreator.id, permissionId: perm.id },
    });
  }

  // Guide permissions
  const guidePerms = permissions.filter((p) =>
    ["trips:read", "bookings:read", "reviews:moderate"].includes(p.key)
  );
  for (const perm of guidePerms) {
    await prisma.rolePermission.create({
      data: { roleId: roles.guide.id, permissionId: perm.id },
    });
  }

  console.log("✅ Created 4 roles and 13 permissions\n");

  // ================================
  // 2. USERS
  // ================================
  console.log("👥 Creating users with different roles...");

  const hashedPassword = await bcryptjs.hash("Admin@123", 10);

  const users = {
    admin: await prisma.user.create({
      data: {
        email: "admin@paramadventures.com",
        password: hashedPassword,
        name: "Admin User",
        phoneNumber: "+91-9999900001",
        status: "ACTIVE",
      },
    }),
    contentWriter: await prisma.user.create({
      data: {
        email: "writer@paramadventures.com",
        password: hashedPassword,
        name: "Sarah Writer",
        phoneNumber: "+91-9999900002",
        status: "ACTIVE",
      },
    }),
    guide1: await prisma.user.create({
      data: {
        email: "guide1@paramadventures.com",
        password: hashedPassword,
        name: "Rajesh Kumar (Guide)",
        phoneNumber: "+91-9999900003",
        status: "ACTIVE",
        bio: "Expert mountaineer with 10 years of Himalayan trekking experience",
      },
    }),
    guide2: await prisma.user.create({
      data: {
        email: "guide2@paramadventures.com",
        password: hashedPassword,
        name: "Priya Sharma (Guide)",
        phoneNumber: "+91-9999900004",
        status: "ACTIVE",
        bio: "Wildlife enthusiast and certified adventure guide",
      },
    }),
    user1: await prisma.user.create({
      data: {
        email: "user1@example.com",
        password: hashedPassword,
        name: "John Doe",
        phoneNumber: "+91-9999900005",
        status: "ACTIVE",
      },
    }),
    user2: await prisma.user.create({
      data: {
        email: "user2@example.com",
        password: hashedPassword,
        name: "Jane Smith",
        phoneNumber: "+91-9999900006",
        status: "ACTIVE",
      },
    }),
  };

  // Assign roles
  await prisma.userRole.create({ data: { userId: users.admin.id, roleId: roles.admin.id } });
  await prisma.userRole.create({
    data: { userId: users.contentWriter.id, roleId: roles.contentCreator.id },
  });
  await prisma.userRole.create({ data: { userId: users.guide1.id, roleId: roles.guide.id } });
  await prisma.userRole.create({ data: { userId: users.guide2.id, roleId: roles.guide.id } });
  await prisma.userRole.create({ data: { userId: users.user1.id, roleId: roles.user.id } });
  await prisma.userRole.create({ data: { userId: users.user2.id, roleId: roles.user.id } });

  console.log("✅ Created 6 users with roles\n");

  // ================================
  // 3. IMAGES
  // ================================
  console.log("🖼️  Creating images...");

  const images = [];
  const imageUrls = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "https://images.unsplash.com/photo-1519904981063-b0cf448d479e",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5",
    "https://images.unsplash.com/photo-1542259009477-d625272157b7",
  ];

  for (let i = 0; i < imageUrls.length; i++) {
    const img = await prisma.image.create({
      data: {
        originalUrl: imageUrls[i],
        mediumUrl: `${imageUrls[i]}?w=800`,
        thumbUrl: `${imageUrls[i]}?w=400`,
        width: 1920,
        height: 1080,
        size: 245000 + i * 1000,
        mimeType: "image/jpeg",
        type: "IMAGE",
        uploadedById: users.admin.id,
      },
    });
    images.push(img);
  }

  console.log("✅ Created 8 images\n");

  // ================================
  // 4. TRIPS - Different States
  // ================================
  console.log("🗺️  Creating trips in different states...");

  const trips = [];

  // PUBLISHED Trips (5)
  trips.push(
    await prisma.trip.create({
      data: {
        title: "Manali to Leh Motorcycle Adventure",
        slug: "manali-leh-bike-adventure",
        description:
          "Epic 10-day motorcycle journey through the highest motorable passes in the world. Experience the thrill of riding through the majestic Himalayas, crossing rivers, and camping under starlit skies.",
        itinerary: {
          days: [
            { day: 1, title: "Manali Arrival", activities: ["Meet & Greet", "Bike allocation", "Safety briefing"] },
            { day: 2, title: "Rohtang Pass", activities: ["Cross Rohtang", "Reach Jispa", "Acclimatization"] },
            { day: 3, title: "Leh Arrival", activities: ["Khardung La", "Explore Leh Market"] },
          ],
        },
        durationDays: 10,
        difficulty: "HARD",
        location: "Himachal Pradesh to Ladakh",
        price: 65000,
        capacity: 15,
        category: "TREK",
        status: "PUBLISHED" as TripStatus,
        highlights: ["Rohtang Pass (3978m)", "Khardung La (5359m)", "Pangong Lake", "Nubra Valley"],
        inclusions: ["Royal Enfield 350cc", "Fuel", "Accommodation", "All meals", "Support vehicle"],
        exclusions: ["Personal expenses", "Bike insurance", "Emergency evacuation"],
        coverImageId: images[0].id,
        createdById: users.admin.id,
        isFeatured: true,
      },
    })
  );

  trips.push(
    await prisma.trip.create({
      data: {
        title: "Kerala Backwaters Houseboat Cruise",
        slug: "kerala-backwaters-houseboat",
        description:
          "Serene 3-day cruise through the tranquil backwaters of Kerala in a traditional kettuvallam (houseboat). Experience authentic Kerala cuisine and village life.",
        itinerary: {
          days: [
            { day: 1, title: "Alleppey Check-in", activities: ["Board houseboat", "Lunch onboard", "Cruise begins"] },
            { day: 2, title: "Backwater Exploration", activities: ["Village visits", "Sunset views", "Traditional dinner"] },
            { day: 3, title: "Return", activities: ["Morning tea", "Disembark", "Farewell"] },
          ],
        },
        durationDays: 3,
        difficulty: "EASY",
        location: "Kerala, India",
        price: 25000,
        capacity: 8,
        category: "SPIRITUAL",
        status: "PUBLISHED" as TripStatus,
        highlights: ["Traditional houseboat", "Kerala cuisine", "Village visits", "Sunset views"],
        inclusions: ["Houseboat stay", "All meals", "Guide"],
        exclusions: ["Transport to Alleppey", "Personal expenses"],
        coverImageId: images[1].id,
        createdById: users.admin.id,
        isFeatured: true,
      },
    })
  );

  trips.push(
    await prisma.trip.create({
      data: {
        title: "Rajasthan Desert Safari Experience",
        slug: "rajasthan-desert-safari",
        description:
          "5-day desert adventure exploring the golden sands of Thar Desert. Camel safari, desert camping, and cultural performances under the stars.",
        itinerary: {
          days: [
            { day: 1, title: "Jaisalmer Arrival", activities: ["Fort visit", "Market exploration"] },
            { day: 2, title: "Desert Safari", activities: ["Camel ride", "Sand dunes", "Camp setup"] },
            { day: 3, title: "Cultural Evening", activities: ["Folk dance", "Bonfire", "Stargazing"] },
          ],
        },
        durationDays: 5,
        difficulty: "EASY",
        location: "Rajasthan, India",
        price: 18000,
        capacity: 20,
        category: "CORPORATE",
        status: "PUBLISHED" as TripStatus,
        highlights: ["Jaisalmer Fort", "Camel safari", "Desert camping", "Cultural performances"],
        inclusions: ["Accommodation", "All meals", "Camel safari", "Cultural shows"],
        exclusions: ["Transport to Jaisalmer", "Alcohol", "Personal expenses"],
        coverImageId: images[2].id,
        createdById: users.contentWriter.id,
        isFeatured: true,
      },
    })
  );

  trips.push(
    await prisma.trip.create({
      data: {
        title: "Goa Beach & Nightlife Package",
        slug: "goa-beach-nightlife",
        description:
          "4-day beach vacation with water sports, beach parties, and sunset cruises. Perfect for groups and couples.",
        itinerary: {
          days: [
            { day: 1, title: "Arrival", activities: ["Check-in", "Beach time", "Shack dinner"] },
            { day: 2, title: "Water Sports", activities: ["Parasailing", "Jet ski", "Banana boat"] },
            { day: 3, title: "Party Night", activities: ["Beach club", "DJ night", "Bonfire"] },
          ],
        },
        durationDays: 4,
        difficulty: "EASY",
        location: "Goa, India",
        price: 15000,
        capacity: 25,
        category: "CORPORATE",
        status: "PUBLISHED" as TripStatus,
        highlights: ["Private beach access", "Water sports", "Beach parties", "Sunset cruise"],
        inclusions: ["Hotel stay", "Breakfast", "Water sports", "Party entry"],
        exclusions: ["Lunch & dinner", "Alcohol", "Transport"],
        coverImageId: images[3].id,
        createdById: users.admin.id,
        isFeatured: false,
      },
    })
  );

  trips.push(
    await prisma.trip.create({
      data: {
        title: "Rishikesh Rafting & Camping",
        slug: "rishikesh-rafting-camping",
        description:
          "2-day adventure with white water rafting on the Ganges, cliff jumping, and riverside camping. Ideal for thrill-seekers.",
        itinerary: {
          days: [
            { day: 1, title: "Rafting Day", activities: ["16 km rapids", "Cliff jumping", "Beach camping"] },
            { day: 2, title: "Morning Yoga", activities: ["Yoga session", "Breakfast", "Departure"] },
          ],
        },
        durationDays: 2,
        difficulty: "MODERATE",
        location: "Uttarakhand, India",
        price: 5500,
        capacity: 30,
        category: "TREK",
        status: "PUBLISHED" as TripStatus,
        highlights: ["Grade III rapids", "Cliff jumping", "Beach camping", "Morning yoga"],
        inclusions: ["Rafting equipment", "Guide", "Camping gear", "Meals"],
        exclusions: ["Transport to Rishikesh", "Personal gear"],
        coverImageId: images[4].id,
        createdById: users.admin.id,
        isFeatured: true,
      },
    })
  );

  // DRAFT Trips (2)
  trips.push(
    await prisma.trip.create({
      data: {
        title: "Spiti Valley Winter Expedition",
        slug: "spiti-valley-winter",
        description:
          "Challenging 12-day winter expedition to the remote Spiti Valley. Experience sub-zero temperatures and pristine snow landscapes. (Coming Soon)",
        itinerary: { days: [] },
        durationDays: 12,
        difficulty: "HARD",
        location: "Himachal Pradesh",
        price: 75000,
        capacity: 10,
        category: "TREK",
        status: "DRAFT" as TripStatus,
        highlights: ["Frozen waterfalls", "Key Monastery", "Snow leopard tracking"],
        inclusions: ["4WD vehicle", "Winter gear", "Accommodation", "All meals"],
        exclusions: ["Personal clothing", "Insurance"],
        coverImageId: images[5].id,
        createdById: users.contentWriter.id,
        isFeatured: false,
      },
    })
  );

  trips.push(
    await prisma.trip.create({
      data: {
        title: "Andaman Scuba Diving Course",
        slug: "andaman-scuba-diving",
        description:
          "7-day PADI Open Water certification course in the crystal-clear waters of Andaman. Learn to dive with professionals. (In Planning)",
        itinerary: { days: [] },
        durationDays: 7,
        difficulty: "MODERATE",
        location: "Andaman & Nicobar Islands",
        price: 45000,
        capacity: 12,
        category: "TREK",
        status: "DRAFT" as TripStatus,
        highlights: ["PADI certification", "Coral reefs", "Marine life", "Beach resort stay"],
        inclusions: ["Course fees", "Equipment rental", "Accommodation", "Breakfast"],
        exclusions: ["Flights", "Lunch & dinner", "Certification card fees"],
        coverImageId: images[6].id,
        createdById: users.contentWriter.id,
        isFeatured: false,
      },
    })
  );

  // ARCHIVED Trip (1)
  trips.push(
    await prisma.trip.create({
      data: {
        title: "Sikkim Winter Trek 2023",
        slug: "sikkim-winter-trek-2023",
        description: "Past trip: Winter trek in Sikkim (Completed in Dec 2023)",
        itinerary: { days: [] },
        durationDays: 8,
        difficulty: "HARD",
        location: "Sikkim",
        price: 32000,
        capacity: 15,
        category: "TREK",
        status: "ARCHIVED" as TripStatus,
        highlights: ["Completed successfully"],
        inclusions: [],
        exclusions: [],
        coverImageId: images[7].id,
        createdById: users.admin.id,
        isFeatured: false,
      },
    })
  );

  console.log("✅ Created 8 trips (5 published, 2 draft, 1 archived)\n");

  // Assign guides to trips
  await prisma.tripsOnGuides.create({
    data: { tripId: trips[0].id, guideId: users.guide1.id },
  });
  await prisma.tripsOnGuides.create({
    data: { tripId: trips[0].id, guideId: users.guide2.id },
  });
  await prisma.tripsOnGuides.create({
    data: { tripId: trips[4].id, guideId: users.guide1.id },
  });

  // ================================
  // 5. HERO SLIDES (Homepage)
  // ================================
  console.log("🎬 Creating hero slides for homepage...");

  await prisma.heroSlide.createMany({
    data: [
      {
        title: "Adventure Awaits in the Himalayas",
        subtitle: "Discover breathtaking landscapes and thrilling experiences",
        videoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920",
        ctaLink: "/trips",
        order: 1,
      },
      {
        title: "Beach Paradise in Goa",
        subtitle: "Sun, sand, and unforgettable memories",
        videoUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920",
        ctaLink: "/trips/goa-beach-nightlife",
        order: 2,
      },
      {
        title: "Serene Kerala Backwaters",
        subtitle: "Experience tranquility on a traditional houseboat",
        videoUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920",
        ctaLink: "/trips/kerala-backwaters-houseboat",
        order: 3,
      },
      {
        title: "Desert Safari in Rajasthan",
        subtitle: "Witness the golden dunes under starlit skies",
        videoUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920",
        ctaLink: "/trips/rajasthan-desert-safari",
        order: 4,
      },
      {
        title: "White Water Rafting in Rishikesh",
        subtitle: "Adrenaline-pumping action on the sacred Ganges",
        videoUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1920",
        ctaLink: "/trips/rishikesh-rafting-camping",
        order: 5,
      },
    ],
  });

  console.log("✅ Created 5 hero slides\n");

  // ================================
  // 6. BLOGS
  // ================================
  console.log("📝 Creating blog posts...");

  const blogs = [];

  blogs.push(
    await prisma.blog.create({
      data: {
        title: "10 Essential Tips for Your First Himalayan Trek",
        slug: "first-himalayan-trek-tips",
        content: `# Introduction

Planning your first Himalayan trek? Here are 10 essential tips to ensure a safe and memorable adventure.

## 1. Acclimatization is Key

Never rush to high altitudes. Give your body time to adjust. Spend at least 2-3 days at moderate altitude before ascending further.

## 2. Pack Smart

Don't overpack! Essential items include:
- Layered clothing
- Good trekking boots
- Water purification tablets
- First aid kit
- Sunscreen (SPF 50+)

## 3. Physical Preparation

Start training at least 2 months before. Focus on cardio and leg strength.

## 4. Stay Hydrated

Drink 3-4 liters of water daily at high altitude to prevent altitude sickness.

## 5. Respect Local Culture

The Himalayas are home to diverse cultures. Be respectful of local customs and traditions.

*Happy trekking!*`,
        excerpt: "Essential preparation tips for first-time Himalayan trekkers",
        featuredImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
        status: "PUBLISHED",
        authorId: users.contentWriter.id,
        publishedAt: new Date(),
        tags: ["trekking", "himalayas", "tips", "adventure"],
      },
    })coverImageId: images[0].id,
        status: "PUBLISHED",
        authorId: users.contentWriter.id
      data: {
        title: "Why Kerala Should Be Your Next Vacation Destination",
        slug: "kerala-vacation-guide",
        content: `# God's Own Country

Kerala, located in southwestern India, is a tropical paradise known for its backwaters, beaches, and rich cultural heritage.

## The Backwaters Experience

Cruise through serene backwaters on a traditional houseboat. Watch life unfold along the banks as you drift past coconut groves and paddy fields.

## Cuisine

Kerala cuisine is a gastronomic delight. Don't miss:
- Appam with stew
- Fish curry
- Sadya (traditional feast)
- Fresh coconut water

## Best Time to Visit

October to March is ideal when the weather is pleasant and perfect for exploration.

## Must-Visit Places

1. Munnar - Tea plantations
2. Alleppey - Backwaters
3. Kochi - Historic port city
4. Wayanad - Wildlife

Book your Kerala trip today!`,
        excerpt: "Discover why Kerala is the perfect blend of nature, culture, and relaxation",
        featuredImageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200",
        status: "PUBLISHED",
        coverImageId: images[1].id,
        status: "PUBLISHED",
        authorId: users.contentWriter.id
  );

  blogs.push(
    await prisma.blog.create({
      data: {
        title: "Motorcycle Safety Tips for Leh-Ladakh Trip",
        slug: "leh-ladakh-motorcycle-safety",
        content: `# Riding Safe in the Himalayas

The Manali-Leh highway is a dream for every motorcyclist, but it demands respect and preparation.

## Pre-Trip Preparation

- Get your bike serviced thoroughly
- Check tire pressure and tread
- Carry spare tubes and puncture kit
- Test all lights and brakes

## On the Road

1. **Start Early**: Begin your day at sunrise to avoid afternoon winds
2. **Ride Slow**: Roads are unpredictable
3. **Stay Visible**: Wear bright colored jackets
4. **Respect Nature**: Don't litter, stay on roads

## Emergency Preparedness

- Carry satellite phone
- Keep emergency contacts handy
- Inform family of your route
- Join a group if possible

Stay safe and enjoy the ride!`,
        excerpt: "Essential safety tips for your Leh-Ladakh motorcycle adventure",
        featuredImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
        status: "PUBLISHED",
        coverImageId: images[2].id,
        status: "PUBLISHED",
        authorId: users.admin.id
  );

  blogs.push(
    await prisma.blog.create({
      data: {
        title: "Best Time to Visit Rajasthan Desert",
        slug: "rajasthan-desert-best-time",
        content: `# When to Experience the Thar Desert

Rajasthan's Thar Desert is magical, but timing your visit is crucial for comfort.

## Winter (October to March) - BEST TIME

Perfect weather with temperatures between 10-27°C. Ideal for:
- Desert safari
- Camping
- Photography
- Cultural festivals

## Summer (April to June) - Avoid

Extremely hot (40-50°C). Not recommended unless you're a desert enthusiast.

## Monsoon (July to September)

Light rainfall transforms the desert. Unique experience but limited activities.

## Festival Season

Don't miss:
- Desert Festival (February)
- Pushkar Camel Fair (November)

Plan your desert adventure wisely!`,
        excerpt: "Complete guide to choosing the perfect time for your Rajasthan desert experience",
        featuredImageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200",
        status: "PUBLISHED",
        authorId: users.contentWriter.id,
        publishedAt: new Date(),
        coverImageId: images[3].id,
        status: "PUBLISHED",
        authorId: users.contentWriter.id
  blogs.push(
    await prisma.blog.create({
      data: {
        title: "Upcoming: Spiti Valley Winter Expedition Guide",
        slug: "spiti-winter-guide-draft",
        content: "Draft content for Spiti Valley winter guide...",
        excerpt: "Coming soon: Complete guide for winter travel to Spiti",
        featuredImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
        status: "DRAFT",
        authorId: users.contentWriter.id,
        tags: ["spiti", "winter", "draft"],
      },coverImageId: images[4].id,
        status: "DRAFT",
        authorId: users.contentWriter.id
  console.log("✅ Created 5 blog posts (4 published, 1 draft)\n");

  // ================================
  // 7. REVIEWS
  // ================================
  console.log("⭐ Creating reviews...");

  await prisma.review.create({
    data: {
      rating: 5,
      comment:
        "Absolutely incredible experience! The ride through Khardung La was breathtaking. Our guide Rajesh was amazing and very knowledgeable. Highly recommend!",
      tripId: trips[0].id,
      userId: users.user1.id,
      isFeatured: true,
    },
  });
},
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment:
        "The houseboat cruise was so peaceful and relaxing. Food was delicious, staff was friendly. Perfect getaway!",
      tripId: trips[1].id,
      userId: users.user2.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment:
        "Great desert experience. Camel safari was fun. Only complaint is it got a bit cold at night in the desert camp.",
      tripId: trips[2].id,
      userId: users.user1.id
  console.log("✅ Created 3 reviews\n");

  // ================================
  // 8. BOOKINGS & PAYMENTS
  // ================================
  console.log("💳 Creating sample bookings...");

  const booking1 = await prisma.booking.create({
    data: {
      tripId: trips[0].id,
      userId: users.user1.id,
      numberOfPeople: 2,
      totalPrice: 130000,
      status: "CONFIRMED",
      emergencyContact: {
        name: "Alice Doe",
        phone: "+91-9876543210",
      guests: 2,
      startDate: new Date("2026-06-15"),
      totalPrice: 130000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      guestDetails: [
        { name: "John Doe", age: 32, email: "john@example.com" },
        { name: "Alice Doe", age: 30, email: "alice@example.com" },
      ],
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 130000,
      provider: "razorpay",
      status: "CAPTURED",
      method: "CARD",
      providerOrderId: "order_test_123",
      providerPaymentId: "pay_test_456",
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      tripId: trips[1].id,
      userId: users.user2.id,
      guests: 2,
      startDate: new Date("2026-07-01"),
      totalPrice: 50000,
      status: "REQUESTED",
      paymentStatus: "PENDING",
      guestDetails: [
        { name: "Jane Smith", age: 28, email: "jane@example.com" },
        { name: "Bob Smith", age: 30, email: "bob@example.com" },
      ],
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      amount: 50000,
      provider: "razorpay",
      status: "CREATEDed 2 bookings with payments\n");

  // ================================
  // SUMMARY
  // ================================
  console.log("════════════════════════════════════════════");
  console.log("🎉 COMPLETE PRODUCTION SEED SUCCESSFUL!");
  console.log("════════════════════════════════════════════\n");

  console.log("📊 Summary:");
  console.log("   ✅ 4 Roles (ADMIN, CONTENT_CREATOR, GUIDE, USER)");
  console.log("   ✅ 13 Permissions");
  console.log("   ✅ 6 Users with different roles");
  console.log("   ✅ 8 Images");
  console.log("   ✅ 8 Trips (5 published, 2 draft, 1 archived)");
  console.log("   ✅ 5 Hero slides (homepage)");
  console.log("   ✅ 5 Blog posts (4 published, 1 draft)");
  console.log("   ✅ 3 Reviews");
  console.log("   ✅ 2 Bookings with payments\n");

  console.log("🔐 Login Credentials (All passwords: Admin@123):");
  console.log("   👑 Super Admin:     admin@paramadventures.com");
  console.log("   ✍️  Content Writer:  writer@paramadventures.com");
  console.log("   🗺️  Guide 1:         guide1@paramadventures.com");
  console.log("   🗺️  Guide 2:         guide2@paramadventures.com");
  console.log("   👤 User 1:          user1@example.com");
  console.log("   👤 User 2:          user2@example.com\n");

  console.log("🗺️  Published Trips:");
  console.log("   • manali-leh-bike-adventure (Featured)");
  console.log("   • kerala-backwaters-houseboat (Featured)");
  console.log("   • rajasthan-desert-safari (Featured)");
  console.log("   • goa-beach-nightlife");
  console.log("   • rishikesh-rafting-camping (Featured)\n");

  console.log("📝 Draft Trips (Admin/Writer can see):");
  console.log("   • spiti-valley-winter");
  console.log("   • andaman-scuba-diving\n");

  console.log("🌐 Homepage Ready with:");
  console.log("   • 5 Hero slides");
  console.log("   • Featured trips display");
  console.log("   • Blog posts\n");

  console.log("✅ This seed data is perfect for:");
  console.log("   • Manual testing");
  console.log("   • Production deployment");
  console.log("   • Demo presentations");
  console.log("   • Role-based access testing\n");

  console.log("🚀 Start servers: npm run dev");
  console.log("🌐 Visit: http://localhost:3000\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
