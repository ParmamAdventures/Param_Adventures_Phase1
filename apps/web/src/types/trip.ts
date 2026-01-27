import { User } from "./auth";

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  meals?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  accommodation?: string;
  distance?: string;
  travelTime?: string;
};

export type TripDocument = {
  type?: string;
  uploadedAt: string;
  url: string;
};

export interface Trip {
  id: string;
  title: string;
  slug: string;
  location: string;
  startPoint?: string;
  endPoint?: string;
  durationDays?: number;
  duration?: string; // Sometimes used for string "5 days"
  difficulty?: string;
  category?: string;
  price?: number;
  capacity?: number;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  coverImage?:
    | string
    | { mediumUrl: string; originalUrl?: string; type?: "IMAGE" | "VIDEO" }
    | null;
  heroImage?: string | { originalUrl: string; mediumUrl?: string; type?: "IMAGE" | "VIDEO" } | null;
  gallery?: {
    image: {
      id: string;
      thumbUrl?: string;
      mediumUrl: string;
      originalUrl: string;
      type?: "IMAGE" | "VIDEO";
    };
  }[];
  itinerary?: ItineraryDay[] | { days: ItineraryDay[] } | TripDocument[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  cancellationPolicy?: Record<string, unknown>;
  thingsToPack?: string[];
  faqs?: { question: string; answer: string }[];
  seasons?: string[];
  altitude?: string;
  distance?: string;
  isFeatured?: boolean;
  publishedAt?: Date | null;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  itineraryPdf?: string;
  _count?: { bookings: number };
  guides?: { id: string; guide: User }[];
}
