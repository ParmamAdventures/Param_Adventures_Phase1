"use client";

import { BlogClientContent } from "@/components/blogs/BlogClientContent";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface BlogDetailViewProps {
  blog: any;
}

/**
 * BlogDetailView - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function BlogDetailView({ blog }: BlogDetailViewProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="relative pb-32 text-[var(--foreground)]">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 right-0 left-0 z-50 h-1 origin-left bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
        style={{ scaleX }}
      />

      <article className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Hero Header */}
        <header className="relative flex h-[60vh] min-h-[500px] w-full items-end overflow-hidden pb-20">
          {blog.coverImage ? (
            <div className="absolute inset-0 -z-10">
              <Image
                src={
                  blog.coverImage.originalUrl.startsWith("/uploads")
                    ? `${baseUrl}${blog.coverImage.originalUrl}`
                    : blog.coverImage.originalUrl
                }
                alt={blog.title}
                fill
                priority
                className="h-full w-full scale-105 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg)]" />
          )}

          <div className="mx-auto w-full max-w-4xl space-y-8 px-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-[var(--accent)]/20 shadow-lg">
                Adventure
              </span>
              <span className="text-muted-foreground rounded-full border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-1.5 text-sm font-bold tracking-widest uppercase backdrop-blur-md">
                {new Date(blog.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-5xl leading-[0.9] font-black tracking-tighter uppercase italic md:text-7xl">
              {blog.title}
            </h1>

            <div className="flex w-fit items-center gap-4 border-t border-[var(--border)] pt-4 pr-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-black text-white italic shadow-[var(--accent)]/20 shadow-lg">
                {blog.author?.name?.[0] || "P"}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black tracking-[0.2em] text-[var(--accent)] uppercase">
                  Written By
                </p>
                <p className="text-lg font-bold">{blog.author?.name || "Param Adventures"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-12 px-6 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-12">
            {blog.excerpt && (
              <p className="text-muted-foreground rounded-r-[32px] border-l-8 border-[var(--accent)] bg-[var(--border)]/10 py-4 pl-8 text-2xl leading-relaxed font-bold italic md:text-3xl">
                {blog.excerpt}
              </p>
            )}

            <BlogClientContent content={blog.content} />
          </div>
        </div>

        {/* Footer Author Card */}
        <footer className="mx-auto mt-20 max-w-4xl border-t border-[var(--border)] px-6 pt-10">
          <div className="flex flex-col items-center gap-10 rounded-[40px] border border-[var(--border)] bg-[var(--card)]/50 p-10 backdrop-blur-xl md:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[32px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 text-4xl font-black text-white italic shadow-[var(--accent)]/20 shadow-2xl">
              {blog.author?.name?.[0] || "P"}
            </div>
            <div className="space-y-4 text-center md:text-left">
              <h4 className="text-2xl font-black tracking-tighter uppercase italic">
                About {blog.author?.name || "the author"}
              </h4>
              <p className="text-muted-foreground leading-relaxed font-medium">
                Passionate explorer and member of the Param Adventures community. Sharing stories
                from the edge of the world.
              </p>
              <div className="flex justify-center gap-4 pt-2 md:justify-start">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 text-sm font-black tracking-widest text-[var(--accent)] uppercase transition-transform hover:translate-x-1"
                >
                  More stories{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
