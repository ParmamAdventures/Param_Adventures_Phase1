export const TRIP_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070", // Mountain
  "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=2070", // Himalayan
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070", // Road
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070", // River
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070", // Camping
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070", // Cycling
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070", // Nature
  "https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=2070", // Forest
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070", // Lake
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070", // Landscape
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070", // Travel
  "https://images.unsplash.com/photo-1433832597046-d4469273c0ae?q=80&w=2070", // Culture
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070", // Peaks
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070", // Tent
  "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=2070", // Spiritual
];

export const RAW_TRIP_DATA = [
  // TREK
  {
    title: "Everest Base Camp Trek",
    category: "TREK",
    price: 125000,
    duration: 14,
    difficulty: "HARD",
    location: "Nepal",
  },
  {
    title: "Annapurna Circuit",
    category: "TREK",
    price: 95000,
    duration: 12,
    difficulty: "HARD",
    location: "Nepal",
  },
  {
    title: "Valley of Flowers",
    category: "TREK",
    price: 35000,
    duration: 6,
    difficulty: "EASY",
    location: "Uttarakhand",
  },
  {
    title: "Roopkund Mystery Lake",
    category: "TREK",
    price: 45000,
    duration: 8,
    difficulty: "MODERATE",
    location: "Uttarakhand",
  },
  {
    title: "Hampta Pass",
    category: "TREK",
    price: 30000,
    duration: 5,
    difficulty: "MODERATE",
    location: "Himachal Pradesh",
  },
  {
    title: "Kashmir Great Lakes",
    category: "TREK",
    price: 55000,
    duration: 8,
    difficulty: "HARD",
    location: "Kashmir",
  },
  {
    title: "Chadar Frozen River",
    category: "TREK",
    price: 85000,
    duration: 9,
    difficulty: "EXTREME",
    location: "Ladakh",
  },
  {
    title: "Sandakphu Ridge Trek",
    category: "TREK",
    price: 32000,
    duration: 6,
    difficulty: "MODERATE",
    location: "West Bengal",
  },
  {
    title: "Kheerganga Hike",
    category: "TREK",
    price: 8000,
    duration: 2,
    difficulty: "EASY",
    location: "Himachal Pradesh",
  },
  {
    title: "Markha Valley",
    category: "TREK",
    price: 42000,
    duration: 9,
    difficulty: "HARD",
    location: "Ladakh",
  },

  // CAMPING
  {
    title: "Rishikesh Riverside Camp",
    category: "CAMPING",
    price: 5500,
    duration: 2,
    difficulty: "EASY",
    location: "Rishikesh",
  },
  {
    title: "Spiti Valley Stargazing",
    category: "CAMPING",
    price: 45000,
    duration: 7,
    difficulty: "MODERATE",
    location: "Spiti",
  },
  {
    title: "Jaisalmer Desert Camp",
    category: "CAMPING",
    price: 12000,
    duration: 3,
    difficulty: "EASY",
    location: "Rajasthan",
  },
  {
    title: "Wayanad Forest Stay",
    category: "CAMPING",
    price: 15000,
    duration: 3,
    difficulty: "EASY",
    location: "Kerala",
  },
  {
    title: "Pawna Lake Side",
    category: "CAMPING",
    price: 3500,
    duration: 2,
    difficulty: "EASY",
    location: "Maharashtra",
  },
  {
    title: "Kanatal Heights",
    category: "CAMPING",
    price: 7500,
    duration: 2,
    difficulty: "EASY",
    location: "Uttarakhand",
  },

  // SPIRITUAL
  {
    title: "Varanasi Ghats Tour",
    category: "SPIRITUAL",
    price: 25000,
    duration: 4,
    difficulty: "EASY",
    location: "Uttar Pradesh",
  },
  {
    title: "Char Dham Yatra",
    category: "SPIRITUAL",
    price: 150000,
    duration: 12,
    difficulty: "MODERATE",
    location: "Uttarakhand",
  },
  {
    title: "Amarnath Cave Expedition",
    category: "SPIRITUAL",
    price: 65000,
    duration: 7,
    difficulty: "HARD",
    location: "Kashmir",
  },
  {
    title: "Golden Temple & Wagah",
    category: "SPIRITUAL",
    price: 18000,
    duration: 3,
    difficulty: "EASY",
    location: "Punjab",
  },
  {
    title: "Rishikesh Yoga Retreat",
    category: "SPIRITUAL",
    price: 45000,
    duration: 7,
    difficulty: "EASY",
    location: "Uttarakhand",
  },
  {
    title: "Bodh Gaya Pilgrimage",
    category: "SPIRITUAL",
    price: 32000,
    duration: 5,
    difficulty: "EASY",
    location: "Bihar",
  },

  // CORPORATE
  {
    title: "Team Synergy Manali",
    category: "CORPORATE",
    price: 25000,
    duration: 3,
    difficulty: "EASY",
    location: "Manali",
  },
  {
    title: "Leadership Offsite Coorg",
    category: "CORPORATE",
    price: 35000,
    duration: 4,
    difficulty: "EASY",
    location: "Karnataka",
  },
  {
    title: "Strategy Retreat Goa",
    category: "CORPORATE",
    price: 45000,
    duration: 4,
    difficulty: "EASY",
    location: "Goa",
  },
  {
    title: "Wellness Workshop Shimla",
    category: "CORPORATE",
    price: 22000,
    duration: 3,
    difficulty: "EASY",
    location: "Shimla",
  },
  {
    title: "Innovation Camp Pune",
    category: "CORPORATE",
    price: 28000,
    duration: 3,
    difficulty: "EASY",
    location: "Maharashtra",
  },
  {
    title: "Founders Summit Ladakh",
    category: "CORPORATE",
    price: 85000,
    duration: 5,
    difficulty: "MODERATE",
    location: "Ladakh",
  },

  // EDUCATIONAL
  {
    title: "Bio-Diversity Tour Kerala",
    category: "EDUCATIONAL",
    price: 42000,
    duration: 6,
    difficulty: "EASY",
    location: "Kerala",
  },
  {
    title: "Historical Hampi Walk",
    category: "EDUCATIONAL",
    price: 28000,
    duration: 4,
    difficulty: "EASY",
    location: "Karnataka",
  },
  {
    title: "Astronomy Camp Spiti",
    category: "EDUCATIONAL",
    price: 52000,
    duration: 7,
    difficulty: "MODERATE",
    location: "Spiti",
  },
  {
    title: "Marine Life Andamans",
    category: "EDUCATIONAL",
    price: 75000,
    duration: 6,
    difficulty: "EASY",
    location: "Andaman",
  },
  {
    title: "Geology Tour Rajasthan",
    category: "EDUCATIONAL",
    price: 32000,
    duration: 5,
    difficulty: "EASY",
    location: "Rajasthan",
  },

  // CUSTOM
  {
    title: "Photography Expedition",
    category: "CUSTOM",
    price: 65000,
    duration: 6,
    difficulty: "MODERATE",
    location: "Kashmir",
  },
  {
    title: "Cooking Tour of India",
    category: "CUSTOM",
    price: 85000,
    duration: 10,
    difficulty: "EASY",
    location: "Pan India",
  },
  {
    title: "Yoga & Wellness Safari",
    category: "CUSTOM",
    price: 120000,
    duration: 8,
    difficulty: "EASY",
    location: "Rishikesh",
  },
  {
    title: "Art & Craft Trail",
    category: "CUSTOM",
    price: 45000,
    duration: 5,
    difficulty: "EASY",
    location: "Rajasthan",
  },
  {
    title: "Wine Tour Nashik",
    category: "CUSTOM",
    price: 22000,
    duration: 2,
    difficulty: "EASY",
    location: "Maharashtra",
  },
];
