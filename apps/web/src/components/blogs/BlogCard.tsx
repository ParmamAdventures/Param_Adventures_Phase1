"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import BlogMeta from "./BlogMeta";

/**
 * BlogCard - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export default function BlogCard({ blog, index = 0 }: { blog: any; index?: number }) {
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
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--accent)]/10 hover:shadow-2xl"
    >
      {/* Image Container */}
      <div className="bg-muted relative aspect-[16/10] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)]/20">
            <span className="text-6xl font-black italic opacity-10">PARAM</span>
          </div>
        )}

        {/* Category Overlay */}
        <div className="absolute top-4 left-4">
          <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
            Adventure
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[var(--accent)] uppercase">
            <span>{readingTime} MIN READ</span>
          </div>

          <Link href={`/blogs/${blog.slug}`} className="relative block">
            <h2 className="text-foreground text-2xl leading-tight font-extrabold decoration-[var(--accent)] decoration-2 underline-offset-4 transition-colors group-hover:text-[var(--accent)] group-hover:underline">
              {blog.title}
            </h2>
          </Link>

          {blog.excerpt && (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed opacity-80 transition-opacity group-hover:opacity-100">
              {blog.excerpt}
            </p>
          )}
        </div>

        <div className="border-t border-[var(--border)]/50 pt-4">
          <BlogMeta blog={blog} />
        </div>
      </div>
    </motion.div>
  );
}
