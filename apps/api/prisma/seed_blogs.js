import "dotenv/config.js";
import { PrismaClient  } from "@prisma/client";


const prisma = new PrismaClient();

const BLOG_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with a clean slate.",
    theme: "modern",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    },
  },
  {
    id: "day-by-day",
    name: "Day-by-Day Journal (Journal Theme)",
    description: "Chronicle your adventure day by day. Perfect for long treks.",
    theme: "journal",
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
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Day 1: The Beginning" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "We started our journey at the base camp." }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Day 2: The Ascent" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "The climb got steeper today..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Day 3: The Summit" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Finally reached the top..." }] },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Final Thoughts" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "This was truly a life changing experience." }],
        },
      ],
    },
  },
  {
    id: "photo-showcase",
    name: "Photo Showcase (Minimal Theme)",
    description: "Let the pictures do the talking. Heavy on gallery usage.",
    theme: "minimal",
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
        { type: "paragraph" },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Landscapes" }] },
        { type: "paragraph", content: [{ type: "text", text: "Endless horizons." }] },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Camp Life" }] },
        { type: "paragraph", content: [{ type: "text", text: "Cozy nights by the fire." }] },
      ],
    },
  },
  {
    id: "culinary-journey",
    name: "Culinary Journey (Vibrant Theme)",
    description: "Focus on the local flavors, street food, and mountain meals.",
    theme: "vibrant",
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
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Local Delicacies" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "The spicy noodles were incredible!" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Street Food Finds" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Found a hidden gem selling momos." }],
        },
      ],
    },
  },
  {
    id: "cultural-immersion",
    name: "Cultural Immersion (Nature Theme)",
    description: "Dive deep into the traditions, people, and stories of the locals.",
    theme: "nature",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "People & Traditions" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "The locals welcomed us with open arms." }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Local Legends" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The village elder told us about the guardian spirit of the mountain.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Festivals & Customs" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "We were lucky to witness the harvest festival." }],
        },
      ],
    },
  },
];

async function main() {
  console.log("Finding user and trip...");

  // Find a user - we'll take the first one found
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No users found. Cannot create blogs.");
    return;
  }

  // Find a trip - we'll take the first one found
  const trip = await prisma.trip.findFirst();
  if (!trip) {
    console.error("No trips found. Cannot create blogs.");
    return;
  }

  console.log(`Using User: ${user.email} (${user.id})`);
  console.log(`Using Trip: ${trip.title} (${trip.id})`);

  // Choose the 5 specific templates we want to showcase
  const templatesToUse = [
    BLOG_TEMPLATES.find((t) => t.id === "day-by-day"), // Journal
    BLOG_TEMPLATES.find((t) => t.id === "photo-showcase"), // Minimal
    BLOG_TEMPLATES.find((t) => t.id === "culinary-journey"), // Vibrant
    BLOG_TEMPLATES.find((t) => t.id === "cultural-immersion"), // Nature
    BLOG_TEMPLATES.find((t) => t.id === "budget-backpacker"), // Modern (Budget Backpacker is mapped to Modern in recent edit)
  ].filter(Boolean);

  for (const template of templatesToUse) {
    const title = `Sample: ${template.name}`;
    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Math.random().toString(36).substring(7);

    console.log(`Creating blog: ${title} (${template.theme})`);

    try {
      console.log(`Attempting to create blog: ${title}`);
      console.log(`User ID: ${user.id} (Type: ${typeof user.id})`);
      console.log(`Trip ID: ${trip.id} (Type: ${typeof trip.id})`);

      await prisma.blog.create({
        data: {
          title: title,
          slug: slug,
          excerpt: template.description,
          content: template.content,
          theme: template.theme,
          status: "PUBLISHED",
          authorId: user.id,
          tripId: trip.id,
        },
      });
    } catch (createError) {
      console.error("Failed to create blog:", title);
      console.error(createError);
    }
  }

  console.log("Successfully created 5 sample blogs!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
