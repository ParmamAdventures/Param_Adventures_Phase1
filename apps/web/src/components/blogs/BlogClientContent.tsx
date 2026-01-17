"use client";

import dynamic from "next/dynamic";

// Dynamically import BlogEditor to ensure it only renders on the client
const BlogEditor = dynamic(() => import("@/components/editor/BlogEditor"), {
  ssr: false,
  loading: () => <div className="bg-muted h-[400px] w-full animate-pulse rounded-lg" />,
});

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function normalizeContentUrls(content: any): any {
  if (!content) return content;

  // Recursively traverse Tiptap JSON and fix image URLs
  if (Array.isArray(content)) {
    return content.map(normalizeContentUrls);
  }

  if (typeof content === "object") {
    const newObj = { ...content };

    // If it's an image node, fix the src
    if (newObj.type === "image" && newObj.attrs?.src?.startsWith("/uploads")) {
      newObj.attrs.src = `${baseUrl}${newObj.attrs.src}`;
    }

    // Recursively normalize children
    if (newObj.content) {
      newObj.content = normalizeContentUrls(newObj.content);
    }

    return newObj;
  }

  return content;
}

/**
 * BlogClientContent - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function BlogClientContent({ content }: { content: any }) {
  const normalizedContent = normalizeContentUrls(content);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none pb-20">
      <BlogEditor value={normalizedContent} readOnly />
    </div>
  );
}

export default BlogClientContent;
