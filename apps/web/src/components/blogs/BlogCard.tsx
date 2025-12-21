"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
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
      className="group flex flex-col overflow-hidden rounded-[32px] bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg transaction-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 h-full"
    >
      {/* Cinematic Image Interface */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)]/20">
            <span className="text-6xl font-black opacity-10 italic">PARAM</span>
          </div>
        )}
        
        {/* Category Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/20 shadow-lg">
            Adventure
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
      </div>

      <div className="flex flex-1 flex-col p-8 space-y-6 relative">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>{readingTime} MIN READ</span>
          </div>

          <Link href={`/blogs/${blog.slug}`} className="block relative group-hover:translate-x-1 transition-transform duration-300">
            <h2 className="text-2xl font-black italic leading-[1.1] text-white group-hover:text-accent transition-colors">
              {blog.title}
            </h2>
          </Link>

          {blog.excerpt && (
            <p className="text-white/60 text-sm line-clamp-3 leading-relaxed font-light">
              {blog.excerpt}
            </p>
          )}
        </div>

        <div className="pt-6 border-t border-white/10">
          <BlogMeta blog={blog} />
        </div>
      </div>
    </motion.div>
  );
}
