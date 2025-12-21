"use client";

import { use, useEffect, useState } from "react";
import { BlogClientContent } from "@/components/blogs/BlogClientContent";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchBlog(slug: string) {
  const response = await fetch(`${baseUrl}/blogs/public/${slug}`, { 
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    fetchBlog(slug).then((data) => {
      setBlog(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Blog not found</h1>
        <p className="text-muted-foreground font-medium max-w-xs">The story you're looking for doesn't exist.</p>
        <Link href="/blogs" className="px-8 py-3 rounded-2xl bg-[var(--accent)] text-white font-bold shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-transform">
          Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pb-32">
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
              <img
                src={blog.coverImage.originalUrl}
                alt={blog.title}
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
