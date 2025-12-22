"use client";

import { BlogClientContent } from "@/components/blogs/BlogClientContent";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface BlogDetailViewProps {
    blog: any;
}

export function BlogDetailView({ blog }: BlogDetailViewProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative pb-32 text-[var(--foreground)]">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--accent)] origin-left z-50 shadow-[0_0_10px_var(--accent)]"
        style={{ scaleX }}
      />

      <article className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Hero Header */}
        <header className="relative w-full h-[60vh] min-h-[500px] flex items-end pb-20 overflow-hidden">
          {blog.coverImage ? (
            <div className="absolute inset-0 -z-10">
              <Image
                src={blog.coverImage.originalUrl.startsWith('/uploads') ? `${baseUrl}${blog.coverImage.originalUrl}` : blog.coverImage.originalUrl}
                alt={blog.title}
                fill
                priority
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
            </div>
          ) : (
             <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg)]" />
          )}

          <div className="max-w-4xl mx-auto w-full px-6 space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--accent)]/20">
                Adventure
              </span>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-[var(--bg)]/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--border)]">
                {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)] w-fit pr-12">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-[var(--accent)]/20">
                {blog.author?.name?.[0] || 'P'}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Written By</p>
                <p className="text-lg font-bold">{blog.author?.name || "Param Adventures"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          <div className="lg:col-span-12 space-y-12">
            {blog.excerpt && (
              <p className="text-2xl md:text-3xl font-bold italic text-muted-foreground leading-relaxed border-l-8 border-[var(--accent)] pl-8 py-4 bg-[var(--border)]/10 rounded-r-[32px]">
                {blog.excerpt}
              </p>
            )}

            <BlogClientContent content={blog.content} />
          </div>
        </div>

        {/* Footer Author Card */}
        <footer className="max-w-4xl mx-auto px-6 mt-20 pt-10 border-t border-[var(--border)]">
          <div className="bg-[var(--card)]/50 backdrop-blur-xl rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-10 border border-[var(--border)]">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white font-black text-4xl italic shadow-2xl shadow-[var(--accent)]/20 shrink-0">
               {blog.author?.name?.[0] || 'P'}
            </div>
            <div className="space-y-4 text-center md:text-left">
               <h4 className="text-2xl font-black italic uppercase tracking-tighter">About {blog.author?.name || "the author"}</h4>
               <p className="text-muted-foreground font-medium leading-relaxed">
                 Passionate explorer and member of the Param Adventures community. Sharing stories from the edge of the world.
               </p>
               <div className="flex justify-center md:justify-start gap-4 pt-2">
                 <Link href="/blogs" className="text-sm font-black uppercase tracking-widest text-[var(--accent)] hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                   More stories <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                 </Link>
               </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
