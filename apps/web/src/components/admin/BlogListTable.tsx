"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import Spinner from "../ui/Spinner";

type Blog = {
  id: string;
  title: string;
  slug: string;
  author?: {
    name?: string | null;
    email: string;
  };
  excerpt?: string | null;
  status: string;
  createdAt: string;
};

type Props = {
  blogs: Blog[];
  loading: boolean;
  onAction: (id: string, action: "submit" | "approve" | "reject" | "publish" | "archive") => void;
  onRefresh: () => void;
};

/**
 * BlogListTable - List/Gallery display component.
 * @param {Object} props - Component props
 * @param {Array} [props.items] - Items to display
 * @param {Function} [props.renderItem] - Item render function
 * @param {boolean} [props.isLoading] - Loading state
 * @param {string} [props.emptyMessage] - Message when no items
 * @returns {React.ReactElement} List component
 */
export default function BlogListTable({ blogs, loading, onAction, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 p-12 text-center">
        <Spinner size={32} />
        <p className="animate-pulse tracking-wide italic">Fetching stories...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="bg-muted/5 hover:bg-muted/10 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center transition-all">
        <div className="bg-muted/20 mb-2 flex h-16 w-16 items-center justify-center rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/50"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
        </div>
        <p className="text-muted-foreground text-lg font-medium">
          All clear! No blogs pending review.
        </p>
        <Button variant="subtle" onClick={onRefresh} className="rounded-full px-8">
          Refresh Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {blogs.map((blog) => (
        <div
          key={blog.id}
          className="group bg-card hover:shadow-accent/5 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          {/* Futuristic subtle gradient background on hover */}
          <div className="from-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            {/* Main Content */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={blog.status} />
                <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  {new Date(blog.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div>
                <h2 className="text-foreground group-hover:text-accent text-xl leading-tight font-bold transition-colors">
                  {blog.title}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <div className="bg-accent/20 text-accent flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                    {(blog.author?.name || blog.author?.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    by{" "}
                    <span className="text-foreground font-medium">
                      {blog.author?.name || blog.author?.email}
                    </span>
                  </span>
                </div>
              </div>

              {blog.excerpt && (
                <p className="text-muted-foreground line-clamp-2 max-w-3xl text-sm leading-relaxed">
                  {blog.excerpt}
                </p>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-3 border-t pt-4 md:border-t-0 md:pt-0">
              {blog.status === "DRAFT" && (
                <Button
                  variant="primary"
                  onClick={() => onAction(blog.id, "submit")}
                  className="flex-1 rounded-full bg-indigo-500 px-6 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 md:flex-none"
                >
                  Submit
                </Button>
              )}

              {blog.status === "PENDING_REVIEW" && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => onAction(blog.id, "approve")}
                    className="flex-1 rounded-full bg-emerald-500 px-6 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 md:flex-none"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onAction(blog.id, "reject")}
                    className="flex-1 rounded-full px-6 md:flex-none"
                  >
                    Reject
                  </Button>
                </>
              )}

              {blog.status === "APPROVED" && (
                <Button
                  variant="primary"
                  onClick={() => onAction(blog.id, "publish")}
                  className="flex-1 rounded-full bg-blue-600 px-6 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 md:flex-none"
                >
                  Publish
                </Button>
              )}

              {blog.status === "PUBLISHED" && (
                <Button
                  variant="subtle"
                  onClick={() => onAction(blog.id, "archive")}
                  className="flex-1 rounded-full border-amber-200 bg-amber-50 px-6 text-amber-600 hover:bg-amber-100 hover:text-amber-700 md:flex-none"
                >
                  Archive
                </Button>
              )}

              <Link href={`/blogs/${blog.slug || blog.id}`} target="_blank" className="ml-0 md:ml-4">
                <Button
                  variant="outline"
                  className="flex h-10 items-center justify-center rounded-full px-4 text-xs font-bold uppercase tracking-wider"
                  title="Full Preview"
                >
                  Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
