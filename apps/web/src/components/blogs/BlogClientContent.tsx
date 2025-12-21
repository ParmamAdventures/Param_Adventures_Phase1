"use client";

import dynamic from "next/dynamic";

// Dynamically import BlogEditor to ensure it only renders on the client
const BlogEditor = dynamic(() => import("@/components/editor/BlogEditor"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded-lg h-[400px] w-full" />,
});

export function BlogClientContent({ content }: { content: any }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none pb-20">
      <BlogEditor value={content} readOnly />
    </div>
  );
}

export default BlogClientContent;
