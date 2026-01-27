"use client";

import dynamic from "next/dynamic";

import { Blog } from "@/types/blog";

// Dynamically import BlogEditor to ensure it only renders on the client
const BlogEditor = dynamic(() => import("@/components/editor/BlogEditor"), {
  ssr: false,
  loading: () => <div className="bg-muted h-[400px] w-full animate-pulse rounded-lg" />,
});

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ContentNode = {
  type?: string;
  attrs?: { src?: string; [key: string]: unknown };
  content?: ContentNode[];
  [key: string]: unknown;
};

type ContentValue = string | number | boolean | null | ContentNode | ContentValue[];

function normalizeContentUrls<T extends ContentValue>(content: T): T {
  if (content === null || typeof content !== "object") return content;

  if (Array.isArray(content)) {
    return content.map((item) => normalizeContentUrls(item)) as T;
  }

  const newObj: ContentNode = { ...content };

  if (newObj.type === "image" && newObj.attrs?.src?.startsWith("/uploads")) {
    newObj.attrs = { ...newObj.attrs, src: `${baseUrl}${newObj.attrs.src}` };
  }

  if (newObj.content) {
    newObj.content = normalizeContentUrls(newObj.content) as ContentNode[];
  }

  return newObj as T;
}

/**
 * BlogClientContent - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function BlogClientContent({ content }: { content: Blog["content"] }) {
  const normalizedContent = normalizeContentUrls(content as ContentValue);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none pb-20">
      <BlogEditor value={normalizedContent} readOnly />
    </div>
  );
}

export default BlogClientContent;
