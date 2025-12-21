"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BlogMeta from "./BlogMeta";

export default function BlogCard({ blog, index = 0 }: { blog: any, index?: number }) {
  const imageUrl = blog.coverImage?.mediumUrl || blog.image;
  
  // Estimate reading time: ~200 words per minute
  const readingTime = Math.max(1, Math.ceil((JSON.stringify(blog.content || "").length / 5) / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--accent)]/10 hover:-translate-y-2 h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)]/20">
            <span className="text-6xl font-black opacity-10 italic">PARAM</span>
          </div>
        )}
        
        {/* Category Overlay */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
            Adventure
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="flex flex-1 flex-col p-6 space-y-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
            <span>{readingTime} MIN READ</span>
          </div>

          <Link href={`/blogs/${blog.slug}`} className="block relative">
            <h2 className="text-2xl font-extrabold leading-tight text-foreground group-hover:text-[var(--accent)] transition-colors decoration-[var(--accent)] decoration-2 underline-offset-4 group-hover:underline">
              {blog.title}
            </h2>
          </Link>

          {blog.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              {blog.excerpt}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--border)]/50">
          <BlogMeta blog={blog} />
        </div>
      </div>
    </motion.div>
  );
}
