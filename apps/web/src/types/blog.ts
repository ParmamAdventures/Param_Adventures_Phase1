/**
 * Blog-related types
 */

export interface BlogMeta {
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | Record<string, unknown>;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  coverImage?: {
    id: string;
    originalUrl: string;
    mediumUrl: string;
    thumbUrl: string;
    type?: "IMAGE" | "VIDEO";
  };
  author?: {
    id: string;
    name: string;
    email: string;
  };
  trip?: {
    id: string;
    title: string;
    slug: string;
  };
  tags?: string[];
  views?: number;
  likes?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date;
}

export interface BlogContent {
  blocks?: BlockElement[];
}

export interface BlockElement {
  type: "heading" | "paragraph" | "image" | "video" | "list" | "quote" | "code";
  text?: string;
  url?: string;
  level?: number;
  [key: string]: unknown;
}
