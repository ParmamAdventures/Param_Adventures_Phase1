import "dotenv/config.js";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed data generation...\n");

  // Get existing admin user
  const admin = await prisma.user.findUnique({
    where: { email: "admin@paramadventures.com" },
  });

  if (!admin) {
    console.error("❌ Admin user not found. Run main seed.js first!");
    return;
  }

  // ===================================
  // 1. CREATE ADDITIONAL TRIPS (15+)
  // ===================================
  console.log("📍 Adding 15+ diverse trips...");

  const newTrips = [
    {
      title: "Manali to Leh Bike Expedition",
      slug: "manali-leh-bike-expedition",
      description:
        "Conquer one of the world's most dangerous roads on two wheels. Ride through high-altitude passes, cross the mighty Indus, and experience the thrill of adventure motorcycling in the Himalayas.",
      location: "Ladakh, India",
      price: 850,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      galleryLegacy: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      ],
      capacity: 12,
      durationDays: 10,
      difficulty: "HARD",
      altitude: "5359m (Khardung La)",
      distance: "480 km",
      startPoint: "Manali",
      endPoint: "Leh",
      highlights: [
        "Cross 5 high-altitude passes",
        "Visit Pangong Lake",
        "Royal Enfield motorcycle experience",
        "Camping under the stars",
      ],
      inclusions: [
        "Royal Enfield 350/411 rental",
        "Fuel",
        "Support vehicle",
        "Camping gear",
        "All meals",
      ],
      exclusions: ["Bike insurance", "Personal gear", "Emergency evacuation"],
      thingsToPack: ["Riding jacket", "Gloves", "Knee guards", "Sunglasses", "Lip balm"],
      seasons: ["Summer (Jun-Sep)"],
      faqs: [
        {
          question: "Do I need riding experience?",
          answer: "Yes, at least 2 years of highway riding experience required.",
        },
        {
          question: "What if I fall sick?",
          answer: "We carry oxygen cylinders and have satellite phones for emergencies.",
        },
      ],
      isFeatured: true,
    },
    {
      title: "Rishikesh White Water Rafting",
      slug: "rishikesh-rafting-adventure",
      description:
        "Experience the ultimate adrenaline rush on the Ganges. Navigate through rapids, cliff jump, and camp by the riverside in the yoga capital of the world.",
      location: "Rishikesh, India",
      price: 120,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      galleryLegacy: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
      ],
      capacity: 30,

      durationDays: 2,
      difficulty: "MODERATE",
      distance: "16 km rapids",
      highlights: [
        "Grade III & IV rapids",
        "Cliff jumping (optional)",
        "Beach camping",
        "Evening bonfire",
      ],
      inclusions: [
        "Safety equipment",
        "Professional guide",
        "Lunch",
        "Evening snacks",
        "Tent stay",
      ],
      exclusions: ["Transport to Rishikesh", "Personal expenses"],
      thingsToPack: ["Swimwear", "Quick-dry clothes", "Sunscreen", "Waterproof phone pouch"],
      seasons: ["Sep-Jun (Monsoon closed)"],
      isFeatured: true,
    },
    {
      title: "Spiti Valley Winter Expedition",
      slug: "spiti-valley-winter",
      description:
        "Explore the frozen desert of Spiti when temperatures drop to -30°C. Visit ancient monasteries, witness frozen waterfalls, and experience life in one of the most remote regions on Earth.",
      location: "Spiti Valley, India",
      price: 950,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      capacity: 8,

      durationDays: 8,
      difficulty: "EXTREME",
      altitude: "4270m (Key Monastery)",
      highlights: [
        "Frozen Spiti River trek",
        "Key Monastery in snow",
        "Chicham Bridge - Asia's highest",
        "Stay in traditional homestays",
      ],
      inclusions: [
        "4x4 vehicle",
        "Homestay accommodation",
        "All meals",
        "Permits",
        "Oxygen cylinders",
      ],
      exclusions: ["Winter gear rental", "Travel insurance"],
      thingsToPack: ["-30°C sleeping bag", "Insulated boots", "Hand warmers", "Balaclava"],
      seasons: ["Winter (Jan-Feb)"],
    },
    {
      title: "Goa Beach & Nightlife Tour",
      slug: "goa-beach-nightlife",
      description:
        "Party on pristine beaches, enjoy water sports, and experience the vibrant nightlife of India's party capital. Perfect for young travelers looking for sun, sand, and fun.",
      location: "Goa, India",
      price: 380,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
      capacity: 25,

      durationDays: 5,
      difficulty: "EASY",
      highlights: [
        "Beach hopping (Anjuna, Baga, Palolem)",
        "Sunset cruise",
        "Club Cubana party night",
        "Parasailing & jet ski",
      ],
      inclusions: ["Beach resort stay", "Breakfast", "Airport transfers", "Water sports package"],
      exclusions: ["Lunch & Dinner", "Alcohol", "Club entry fees"],
      thingsToPack: ["Beachwear", "Sunscreen", "Party outfits", "Flip flops"],
      seasons: ["Oct-Mar (Best weather)"],
      isFeatured: true,
    },
    {
      title: "Corporate Team Building - Lonavala",
      slug: "corporate-lonavala-teambuilding",
      description:
        "Transform your team dynamics with adventure activities, trust exercises, and strategic workshops in the scenic hill station near Mumbai and Pune.",
      location: "Lonavala, India",
      price: 450,
      status: "PUBLISHED",
      category: "CORPORATE",
      coverImageLegacy: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
      capacity: 60,

      durationDays: 2,
      difficulty: "EASY",
      highlights: [
        "High ropes course",
        "Trust fall exercises",
        "Leadership simulation games",
        "Strategy workshops",
      ],
      inclusions: ["Resort accommodation", "All meals", "Workshop materials", "Team activities"],
      exclusions: ["Corporate transport", "Alcohol"],
      thingsToPack: ["Sportswear", "Indoor shoes", "Notebook", "Casual dinner wear"],
      seasons: ["All year"],
    },
    {
      title: "School Science Camp - Ooty",
      slug: "school-science-camp-ooty",
      description:
        "Hands-on science learning in the Nilgiri Hills. Botany walks, telescope astronomy, physics experiments, and wildlife observation for curious young minds.",
      location: "Ooty, India",
      price: 280,
      status: "PUBLISHED",
      category: "EDUCATIONAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
      capacity: 40,

      durationDays: 4,
      difficulty: "EASY",
      highlights: [
        "Botanical Gardens tour",
        "Night sky observation",
        "Tea plantation visit",
        "Microscopy workshop",
      ],
      inclusions: [
        "Hostel accommodation",
        "All meals",
        "Entry fees",
        "Educational materials",
        "Teacher supervision",
      ],
      exclusions: ["Travel to Ooty", "Personal expenses"],
      thingsToPack: ["Notebook", "Warm clothes", "Rain jacket", "Water bottle"],
      seasons: ["Oct-Mar"],
    },
    {
      title: "Kerala Backwaters Houseboat",
      slug: "kerala-backwaters-houseboat",
      description:
        "Cruise through the tranquil backwaters of Kerala on a traditional houseboat. Experience village life, enjoy fresh seafood, and relax in nature's lap.",
      location: "Alleppey, Kerala",
      price: 320,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
      capacity: 16,

      durationDays: 3,
      difficulty: "EASY",
      highlights: [
        "Private houseboat cruise",
        "Fresh Kerala cuisine",
        "Village visits",
        "Sunset views",
      ],
      inclusions: ["Houseboat with AC rooms", "All meals", "Crew", "Sightseeing"],
      exclusions: ["Transport to Alleppey", "Alcohol"],
      thingsToPack: ["Light cotton clothes", "Mosquito repellent", "Camera", "Slippers"],
      seasons: ["Sep-Apr"],
    },
    {
      title: "Hampi Heritage Walk",
      slug: "hampi-heritage-walk",
      description:
        "Walk through the ruins of the Vijayanagara Empire. Explore ancient temples, boulder-strewn landscapes, and learn about India's glorious past from expert historians.",
      location: "Hampi, Karnataka",
      price: 220,
      status: "PUBLISHED",
      category: "EDUCATIONAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1598343392155-7f26fe82f14a?w=800",
      capacity: 20,

      durationDays: 3,
      difficulty: "EASY",
      highlights: [
        "Virupaksha Temple",
        "Vittala Temple chariot",
        "Stone chariot",
        "Sunset at Hemakuta Hill",
      ],
      inclusions: ["Heritage hotel stay", "Breakfast", "Guide fees", "Entry tickets"],
      exclusions: ["Lunch & Dinner", "Camera fees at monuments"],
      thingsToPack: ["Walking shoes", "Hat", "Water bottle", "Sunscreen"],
      seasons: ["Oct-Feb"],
    },
    {
      title: "Varanasi Spiritual Journey",
      slug: "varanasi-spiritual-journey",
      description:
        "Experience the spiritual heart of India. Witness Ganga Aarti, boat rides at dawn, temple visits, and the eternal cycle of life on the ghats of Varanasi.",
      location: "Varanasi, India",
      price: 180,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
      capacity: 15,

      durationDays: 3,
      difficulty: "EASY",
      highlights: [
        "Morning boat ride on Ganges",
        "Ganga Aarti ceremony",
        "Sarnath Buddhist temple",
        "Banarasi silk shopping",
      ],
      inclusions: ["Guesthouse stay", "Breakfast", "Boat rides", "Guide"],
      exclusions: ["Lunch & Dinner", "Shopping"],
      thingsToPack: ["Modest clothing", "Scarf for temples", "Camera", "Wet wipes"],
      seasons: ["Oct-Mar"],
      isFeatured: true,
    },
    {
      title: "Sikkim Monastery Circuit",
      slug: "sikkim-monastery-circuit",
      description:
        "Visit ancient Buddhist monasteries in the lap of Kanchenjunga. Meditate with monks, learn about Tibetan Buddhism, and trek through rhododendron forests.",
      location: "Sikkim, India",
      price: 680,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      capacity: 12,

      durationDays: 7,
      difficulty: "MODERATE",
      highlights: [
        "Rumtek Monastery",
        "Pelling Monastery",
        "Tsomgo Lake",
        "Nathula Pass (Indo-China border)",
      ],
      inclusions: ["Hotel stay", "All meals", "Permits", "Transport"],
      exclusions: ["Tips", "Personal expenses"],
      thingsToPack: ["Warm layers", "Trekking shoes", "Prayer flags (optional)", "Binoculars"],
      seasons: ["Mar-May, Sep-Nov"],
    },
    {
      title: "Rajasthan Desert Safari",
      slug: "rajasthan-desert-safari",
      description:
        "Experience the romance of the Thar Desert. Camel safaris, stay in luxury tents, witness folk dances, and explore the majestic forts of Rajasthan.",
      location: "Jaisalmer, Rajasthan",
      price: 540,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800",
      capacity: 20,

      durationDays: 5,
      difficulty: "EASY",
      highlights: [
        "Camel safari in Sam dunes",
        "Desert camping under stars",
        "Jaisalmer Fort exploration",
        "Rajasthani folk music night",
      ],
      inclusions: ["Luxury tent stay", "All meals", "Camel safari", "Cultural programs"],
      exclusions: ["Travel to Jaisalmer", "Monument entry fees"],
      thingsToPack: ["Sunglasses", "Head scarf", "Moisturizer", "Warm jacket for nights"],
      seasons: ["Oct-Mar"],
      isFeatured: true,
    },
    {
      title: "Andaman Scuba Diving Course",
      slug: "andaman-scuba-diving",
      description:
        "Get PADI certified in crystal-clear tropical waters. Dive with sea turtles, explore coral reefs, and discover the underwater paradise of Havelock Island.",
      location: "Havelock Island, Andaman",
      price: 720,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      capacity: 10,

      durationDays: 5,
      difficulty: "MODERATE",
      highlights: [
        "PADI Open Water certification",
        "4 ocean dives",
        "Radhanagar Beach",
        "Snorkeling at Elephant Beach",
      ],
      inclusions: ["Beach resort", "Dive equipment", "PADI certification fee", "Boat transfers"],
      exclusions: ["Flights to Port Blair", "Meals", "Ferry tickets"],
      thingsToPack: ["Swimwear", "Reef-safe sunscreen", "Underwater camera", "Seasickness tablets"],
      seasons: ["Oct-May"],
    },
    {
      title: "Meghalaya Living Root Bridge Trek",
      slug: "meghalaya-root-bridge-trek",
      description:
        "Trek to the double-decker living root bridges of Meghalaya. Experience the wettest place on Earth, swim in crystal-clear pools, and witness Khasi tribal culture.",
      location: "Cherrapunji, Meghalaya",
      price: 420,
      status: "PUBLISHED",
      category: "TREK",
      coverImageLegacy: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      capacity: 15,

      durationDays: 6,
      difficulty: "MODERATE",
      distance: "25 km total",
      highlights: [
        "Double Decker Root Bridge",
        "Nohkalikai Waterfall",
        "Rainbow Falls trek",
        "Khasi village homestay",
      ],
      inclusions: ["Homestay accommodation", "Local guide", "All meals", "Permits"],
      exclusions: ["Travel to Shillong", "Porter fees"],
      thingsToPack: ["Rain gear (essential)", "Leech socks", "Waterproof bag", "Swimming shorts"],
      seasons: ["Oct-Apr (Less rain)"],
    },
    {
      title: "Jim Corbett Wildlife Safari",
      slug: "jim-corbett-wildlife-safari",
      description:
        "Track the elusive Bengal tiger in India's oldest national park. Jeep safaris, bird watching, nature walks, and riverside camping in the Himalayan foothills.",
      location: "Jim Corbett, Uttarakhand",
      price: 390,
      status: "PUBLISHED",
      category: "EDUCATIONAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800",
      capacity: 18,

      durationDays: 3,
      difficulty: "EASY",
      highlights: [
        "4 jungle safaris",
        "Corbett Museum visit",
        "Bird watching (600+ species)",
        "Kosi River walk",
      ],
      inclusions: ["Forest lodge stay", "All meals", "Safari permits", "Naturalist guide"],
      exclusions: ["Camera charges", "Tips for driver/guide"],
      thingsToPack: [
        "Binoculars",
        "Neutral-colored clothes",
        "Insect repellent",
        "Camera with zoom lens",
      ],
      seasons: ["Nov-Jun (Park closed in monsoon)"],
    },
    {
      title: "Rann of Kutch Festival Tour",
      slug: "rann-of-kutch-festival",
      description:
        "Experience the magic of the white desert during the Rann Utsav. Stay in luxury tents, witness cultural performances, and explore the vast salt marshes under full moon.",
      location: "Kutch, Gujarat",
      price: 580,
      status: "PUBLISHED",
      category: "SPIRITUAL",
      coverImageLegacy: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
      capacity: 25,

      durationDays: 4,
      difficulty: "EASY",
      highlights: [
        "Rann Utsav cultural festival",
        "Full moon white desert walk",
        "Gujarati folk dances",
        "Local handicraft villages",
      ],
      inclusions: ["Tent City accommodation", "All meals", "Festival entry", "Cultural programs"],
      exclusions: ["Travel to Bhuj", "Shopping", "Camel rides"],
      thingsToPack: ["Warm clothes for night", "Sunglasses", "Camera", "Cash for crafts"],
      seasons: ["Nov-Feb (During Rann Utsav)"],
    },
  ];

  for (const trip of newTrips) {
    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: trip,
      create: {
        ...trip,
        createdBy: { connect: { id: admin.id } },
        itinerary: trip.itinerary || { days: [] },
      },
    });
  }

  console.log(`✅ Added ${newTrips.length} new trips!\n`);

  // ===================================
  // 2. CREATE TEST USERS FOR BOOKINGS
  // ===================================
  console.log("👥 Creating test users for bookings...");

  const testUsers = [
    { email: "john.doe@example.com", name: "John Doe", phone: "+919876543210" },
    { email: "jane.smith@example.com", name: "Jane Smith", phone: "+919876543211" },
    { email: "raj.patel@example.com", name: "Raj Patel", phone: "+919876543212" },
    { email: "priya.sharma@example.com", name: "Priya Sharma", phone: "+919876543213" },
    { email: "amit.kumar@example.com", name: "Amit Kumar", phone: "+919876543214" },
    { email: "sneha.reddy@example.com", name: "Sneha Reddy", phone: "+919876543215" },
  ];

  const createdTestUsers = [];
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        phoneNumber: userData.phone,
        password: await bcrypt.hash("password123", 12),
        roles: {
          create: [{ role: { connect: { id: userRole.id } } }],
        },
      },
    });
    createdTestUsers.push(user);
  }

  console.log(`✅ Created ${createdTestUsers.length} test users!\n`);

  // ===================================
  // 3. CREATE BOOKINGS + PAYMENTS
  // ===================================
  console.log("📝 Creating realistic bookings with payments...");

  const allTrips = await prisma.trip.findMany({ where: { status: "PUBLISHED" } });

  const bookingStatuses = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"];
  const paymentStatuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];

  let bookingCount = 0;
  let paymentCount = 0;

  // Create 20-30 bookings with varying statuses
  for (let i = 0; i < 25; i++) {
    const randomUser = createdTestUsers[Math.floor(Math.random() * createdTestUsers.length)];
    const randomTrip = allTrips[Math.floor(Math.random() * allTrips.length)];
    const guests = Math.floor(Math.random() * 4) + 1; // 1-4 guests
    const totalPrice = randomTrip.price * guests;

    const bookingStatus = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];

    // Random dates in the future
    const daysFromNow = Math.floor(Math.random() * 180) + 30; // 30-210 days from now
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);

    const booking = await prisma.booking.create({
      data: {
        userId: randomUser.id,
        tripId: randomTrip.id,
        status: bookingStatus,
        startDate: startDate,
        guests: guests,
        guestDetails: {
          adults: guests,
          children: 0,
          infants: 0,
        },
        totalPrice: totalPrice,
        paymentStatus:
          bookingStatus === "CONFIRMED" || bookingStatus === "COMPLETED" ? "PAID" : "PENDING",
      },
    });

    bookingCount++;

    // Create payment record for the booking
    const paymentStatus =
      booking.status === "CONFIRMED" || booking.status === "COMPLETED"
        ? "CAPTURED"
        : booking.status === "CANCELLED"
          ? "REFUNDED"
          : "CREATED";

    const providerOrderId = `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    await prisma.payment.create({
      data: {
        booking: { connect: { id: booking.id } },
        amount: totalPrice * 100, // Convert to paise
        status: paymentStatus,
        provider: "razorpay",
        providerOrderId: providerOrderId,
        providerPaymentId:
          paymentStatus === "CAPTURED"
            ? `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
            : null,
        method: paymentStatus === "CAPTURED" ? "card" : null,
      },
    });

    paymentCount++;
  }

  console.log(`✅ Created ${bookingCount} bookings with ${paymentCount} payment records!\n`);

  // ===================================
  // 4. CREATE MORE BLOGS (10+)
  // ===================================
  console.log("📝 Creating 10+ blog posts...");

  const blogPosts = [
    {
      title: "10 Essential Items to Pack for Your First Himalayan Trek",
      slug: "essential-items-himalayan-trek",
      excerpt:
        "First time trekking in the Himalayas? Here's what you absolutely cannot forget to pack.",
      theme: "modern",
      tripId: allTrips[0]?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Introduction" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Trekking in the Himalayas is a dream for many adventure enthusiasts. But proper preparation can make or break your experience...",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "1. Proper Trekking Boots" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Your feet will be your best friends (or worst enemies). Invest in quality waterproof boots with ankle support.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Why Ladakh Should Be on Every Rider's Bucket List",
      slug: "ladakh-riders-bucket-list",
      excerpt:
        "The ultimate guide to planning your Manali-Leh bike expedition. Tips, routes, and what to expect.",
      theme: "vibrant",
      tripId: allTrips.find((t) => t.slug === "manali-leh-bike-expedition")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Call of the Mountains" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "There's something magical about riding through the world's highest motorable roads...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Best Time to Visit Kerala Backwaters",
      slug: "best-time-kerala-backwaters",
      excerpt:
        "Planning a houseboat trip? Here's when to visit for the best weather and experience.",
      theme: "minimal",
      tripId: allTrips.find((t) => t.slug === "kerala-backwaters-houseboat")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Weather Patterns in Kerala" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Kerala's tropical climate means warm weather year-round, but timing matters...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Spiti Valley in Winter: A Frozen Paradise",
      slug: "spiti-valley-winter-guide",
      excerpt:
        "What it's really like to visit Spiti when temperatures drop to -30°C. A complete guide.",
      theme: "journal",
      tripId: allTrips.find((t) => t.slug === "spiti-valley-winter")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Day 1: Entering the Frozen Desert" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The moment we crossed the last checkpoint, the landscape transformed...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Rishikesh: More Than Just Rafting",
      slug: "rishikesh-complete-guide",
      excerpt: "Discover the spiritual and adventurous sides of India's yoga capital.",
      theme: "modern",
      tripId: allTrips.find((t) => t.slug === "rishikesh-rafting-adventure")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Yoga Capital" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Rishikesh is where spirituality meets adventure..." }],
          },
        ],
      },
    },
    {
      title: "Scuba Diving for Beginners: Andaman Edition",
      slug: "scuba-diving-beginners-andaman",
      excerpt: "Everything you need to know before your first dive in the Andamans.",
      theme: "vibrant",
      tripId: allTrips.find((t) => t.slug === "andaman-scuba-diving")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Overcoming the Fear of Deep Water" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "I was terrified of the ocean. Here's how I got PADI certified anyway...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Varanasi: A Photographer's Paradise",
      slug: "varanasi-photography-guide",
      excerpt: "Tips for capturing the essence of India's spiritual capital through your lens.",
      theme: "minimal",
      tripId: allTrips.find((t) => t.slug === "varanasi-spiritual-journey")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Golden Hour on the Ghats" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The magic happens at dawn when the first rays hit the Ganges...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Meghalaya's Living Root Bridges: Nature's Engineering Marvel",
      slug: "meghalaya-living-root-bridges",
      excerpt: "How the Khasi tribe creates bridges from living tree roots that last 500+ years.",
      theme: "modern",
      tripId: allTrips.find((t) => t.slug === "meghalaya-root-bridge-trek")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Science Behind Living Bridges" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "These aren't just bridges - they're living, growing structures...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Desert Safari Safety Tips: Rajasthan Edition",
      slug: "rajasthan-desert-safari-safety",
      excerpt: "Stay safe while enjoying camel safaris and desert camping in the Thar Desert.",
      theme: "journal",
      tripId: allTrips.find((t) => t.slug === "rajasthan-desert-safari")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Desert Survival Basics" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The desert is beautiful but unforgiving. Here's what you need to know...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Jim Corbett: A Wildlife Enthusiast's Dream",
      slug: "jim-corbett-wildlife-guide",
      excerpt:
        "Insider tips for spotting tigers and other wildlife in India's oldest national park.",
      theme: "vibrant",
      tripId: allTrips.find((t) => t.slug === "jim-corbett-wildlife-safari")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Thrill of Tiger Tracking" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Our jeep stopped. The guide pointed silently at pug marks on the road...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Rann Utsav: Festival in the White Desert",
      slug: "rann-utsav-festival-guide",
      excerpt:
        "Experience Gujarat's biggest cultural festival in the stunning salt desert of Kutch.",
      theme: "vibrant",
      tripId: allTrips.find((t) => t.slug === "rann-of-kutch-festival")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Full Moon Over the White Desert" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The entire landscape glowed silver under the moon. It was otherworldly...",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Goa Beyond the Beaches: Hidden Gems",
      slug: "goa-hidden-gems",
      excerpt:
        "Discover the lesser-known side of Goa - waterfalls, spice plantations, and Portuguese heritage.",
      theme: "modern",
      tripId: allTrips.find((t) => t.slug === "goa-beach-nightlife")?.id,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Beyond the Party Scene" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Goa has so much more to offer than beaches and clubs..." },
            ],
          },
        ],
      },
    },
  ];

  let blogCount = 0;
  for (const blogData of blogPosts) {
    // Create image for blog
    const blogImage = await prisma.image.create({
      data: {
        originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        mediumUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
        thumbUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
        width: 800,
        height: 600,
        size: 102400,
        mimeType: "image/jpeg",
        uploadedById: admin.id,
      },
    });

    await prisma.blog.create({
      data: {
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        theme: blogData.theme,
        status: "PUBLISHED",
        authorId: admin.id,
        tripId: blogData.tripId,
        coverImageId: blogImage.id,
      },
    });
    blogCount++;
  }

  console.log(`✅ Created ${blogCount} blog posts!\n`);

  // ===================================
  // 5. UPDATE HERO SLIDES WITH VIDEOS
  // ===================================
  console.log("🎬 Updating hero slides with better videos...");

  const heroVideos = [
    {
      title: "Trek and Camping",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-people-hiking-on-a-mountain-trail-42321-large.mp4",
    },
    {
      title: "Corporate Trips",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-team-meeting-in-modern-office-4879-large.mp4",
    },
    {
      title: "Educational Trips",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-students-studying-together-4823-large.mp4",
    },
    {
      title: "Spiritual Trips",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-woman-meditating-at-sunset-34414-large.mp4",
    },
    {
      title: "Custom Trip",
      videoUrl:
        "https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-with-fog-4035-large.mp4",
    },
  ];

  for (const video of heroVideos) {
    const slide = await prisma.heroSlide.findFirst({ where: { title: video.title } });
    if (slide) {
      await prisma.heroSlide.update({
        where: { id: slide.id },
        data: { videoUrl: video.videoUrl },
      });
    }
  }

  console.log("✅ Updated hero slides with video URLs!\n");

  // ===================================
  // 6. ADD SAVED TRIPS FOR USERS
  // ===================================
  console.log("💾 Adding saved trips for users...");

  let savedCount = 0;
  for (const user of createdTestUsers.slice(0, 3)) {
    const randomTrips = allTrips.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const trip of randomTrips) {
      await prisma.savedTrip.create({
        data: {
          userId: user.id,
          tripId: trip.id,
        },
      });
      savedCount++;
    }
  }

  console.log(`✅ Added ${savedCount} saved trips!\n`);

  // ===================================
  // SUMMARY
  // ===================================
  console.log("🎉 Comprehensive seed data completed!\n");
  console.log("=".repeat(50));
  console.log(`📊 SUMMARY:`);
  console.log("=".repeat(50));
  console.log(`✅ Trips: ${newTrips.length} new trips added`);
  console.log(`✅ Users: ${createdTestUsers.length} test users created`);
  console.log(`✅ Bookings: ${bookingCount} bookings with payment records`);
  console.log(`✅ Blogs: ${blogCount} blog posts published`);
  console.log(`✅ Saved Trips: ${savedCount} user saved trips`);
  console.log(`✅ Hero Videos: 5 hero slides updated`);
  console.log("=".repeat(50));
  console.log("\n🌐 Test Credentials:");
  console.log("   Admin: admin@paramadventures.com / password123");
  console.log("   User: john.doe@example.com / password123");
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
