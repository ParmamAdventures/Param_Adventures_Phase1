export const BLOG_TEMPLATES = [
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
    name: "Day-by-Day Journal",
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
          content: [{ type: "text", text: "A brief summary of the entire trip..." }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Day 1: The Beginning" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "We started our journey at..." }] },
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
        { type: "paragraph" },
      ],
    },
  },
  {
    id: "photo-showcase",
    name: "Photo Showcase",
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
        { type: "paragraph" }, // Placeholder for image
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Landscapes" }] },
        { type: "paragraph" },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Camp Life" }] },
        { type: "paragraph" },
      ],
    },
  },
  {
    id: "culinary-journey",
    name: "Culinary Journey",
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
        { type: "paragraph", content: [{ type: "text", text: "The best dish I tried was..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Street Food Finds" }],
        },
        { type: "paragraph" },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Campfire Cooking" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Nothing beats a hot meal at 10,000ft..." }],
        },
      ],
    },
  },
  {
    id: "cultural-immersion",
    name: "Cultural Immersion",
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
          content: [{ type: "text", text: "Encounters that defined my trip..." }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Local Legends" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "A story shared by a local elder..." }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Festivals & Customs" }],
        },
        { type: "paragraph" },
      ],
    },
  },
  {
    id: "solo-traveler",
    name: "Solo Traveler's Log",
    description: "Reflections on solitude, safety, and self-discovery.",
    theme: "journal",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Going It Alone" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Why I chose to travel solo..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Challenges Faced" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "The hardest part was..." }] },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Safety Tips" }] },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Always tell someone your route." }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Lessons Learned" }],
        },
      ],
    },
  },
  {
    id: "budget-backpacker",
    name: "Budget Backpacker",
    description: "Guide to traveling cheap without missing out.",
    theme: "modern",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Trip Cost Breakdown" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Travel & Transport" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Cost: ₹..." }] },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Stay & Food" }] },
        { type: "paragraph", content: [{ type: "text", text: "Cost: ₹..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Money Saving Hacks" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Book early..." }] }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "luxury-escapes",
    name: "Luxury Escapes",
    description: "Highlighting the premium side of adventure.",
    theme: "minimal",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Glamping in Style" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Detailing the premium amenities..." }],
        },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "The Stay" }] },
        { type: "paragraph" },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Exclusive Experiences" }],
        },
        { type: "paragraph" },
      ],
    },
  },
  {
    id: "wildlife-diary",
    name: "Wildlife Diary",
    description: "Documenting the flora and fauna of the wild.",
    theme: "nature",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Wild Encounters" }],
        },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Flora" }] },
        { type: "paragraph", content: [{ type: "text", text: "Rare flowers spotted..." }] },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Fauna" }] },
        { type: "paragraph", content: [{ type: "text", text: "We were lucky to see..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Conservation Note" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Always leave no trace..." }] },
      ],
    },
  },
  {
    id: "family-adventure",
    name: "Family Adventure",
    description: "Tips and stories for traveling with kids and elders.",
    theme: "modern",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Family Trip Report" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Kid-Friendly Activities" }],
        },
        { type: "paragraph" },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Pacing & Rest" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "How we managed energy levels..." }] },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Parent Hacks" }] },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Bring extra snacks..." }] },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "gear-review",
    name: "Gear Review",
    description: "Review the equipment that helped (or hindered) you.",
    theme: "modern",
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Gear Loadout" }] },
        {
          type: "paragraph",
          content: [{ type: "text", text: "What I packed for this expedition..." }],
        },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "The Good" }] },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Item 1: ..." }] }],
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Item 2: ..." }] }],
            },
          ],
        },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "The Bad" }] },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Item 1: ..." }] }],
            },
          ],
        },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Verdict" }] },
        { type: "paragraph" },
      ],
    },
  },
  {
    id: "tips-tricks",
    name: "Tips & Tricks",
    description: "Help future travelers with your hard-earned wisdom.",
    theme: "vibrant",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Essential Tips for this Trek" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "1. Best Time to Visit" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "I recommend going during..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "2. Difficulty Level" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Be prepared for..." }] },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "3. What to Pack" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "Don't forget..." }] },
      ],
    },
  },
];
