"use client";

import { motion } from "framer-motion";
import BlogMeta from "./BlogMeta";
import { MediaCard } from "../ui/MediaCard";
import { Blog } from "@/types/blog";

export default function BlogCard({ blog, index = 0 }: { blog: Blog; index?: number }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  let imageUrl = blog.coverImage?.mediumUrl || blog.image;

  if (imageUrl?.startsWith("/uploads")) {
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  // Estimate reading time: ~200 words per minute
  const readingTime = Math.max(1, Math.ceil(JSON.stringify(blog.content || "").length / 5 / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="h-full"
    >
      <MediaCard
        title={blog.title}
        href={`/blogs/${blog.slug}`}
        imageUrl={imageUrl}
        aspectRatio="aspect-[16/10]"
        badges={
          <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
            Adventure
          </span>
        }
        footer={<BlogMeta blog={blog} />}
      >
        <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[var(--accent)] uppercase">
          <span>{readingTime} MIN READ</span>
        </div>
        <h2 className="text-foreground -mt-1 text-2xl leading-tight font-extrabold decoration-[var(--accent)] decoration-2 underline-offset-4 transition-colors group-hover:text-[var(--accent)] group-hover:underline">
          {blog.title}
        </h2>
        {blog.excerpt && (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed opacity-80 transition-opacity group-hover:opacity-100">
            {blog.excerpt}
          </p>
        )}
      </MediaCard>
    </motion.div>
  );
}
