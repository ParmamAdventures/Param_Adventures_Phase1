"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import Spinner from "../ui/Spinner";

type Blog = {
  id: string;
  title: string;
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

export default function BlogListTable({ blogs, loading, onAction, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="animate-pulse tracking-wide italic">Fetching stories...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="p-16 text-center border-2 border-dashed rounded-3xl bg-muted/5 flex flex-col items-center gap-4 transition-all hover:bg-muted/10">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
        </div>
        <p className="text-muted-foreground font-medium text-lg">All clear! No blogs pending review.</p>
        <Button variant="subtle" onClick={onRefresh} className="rounded-full px-8">Refresh Queue</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {blogs.map((blog) => (
        <div 
          key={blog.id} 
          className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1"
        >
          {/* Futuristic subtle gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row gap-6 md:items-center">
            {/* Main Content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={blog.status} />
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                  {blog.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                    {(blog.author?.name || blog.author?.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    by <span className="text-foreground font-medium">{blog.author?.name || blog.author?.email}</span>
                  </span>
                </div>
              </div>

              {blog.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
                  {blog.excerpt}
                </p>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
              {blog.status === "DRAFT" && (
                <Button
                  variant="primary"
                  onClick={() => onAction(blog.id, "submit")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 rounded-full px-6 flex-1 md:flex-none"
                >
                  Submit
                </Button>
              )}

              {blog.status === "PENDING_REVIEW" && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => onAction(blog.id, "approve")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-full px-6 flex-1 md:flex-none"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onAction(blog.id, "reject")}
                    className="rounded-full px-6 flex-1 md:flex-none"
                  >
                    Reject
                  </Button>
                </>
              )}

              {blog.status === "APPROVED" && (
                <Button
                  variant="primary"
                  onClick={() => onAction(blog.id, "publish")}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-full px-6 flex-1 md:flex-none"
                >
                  Publish
                </Button>
              )}

              {blog.status === "PUBLISHED" && (
                <Button
                  variant="subtle"
                  onClick={() => onAction(blog.id, "archive")}
                  className="text-amber-600 hover:text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-full px-6 flex-1 md:flex-none"
                >
                  Archive
                </Button>
              )}

              <Link href={`/admin/blogs/${blog.id}`} className="ml-0 md:ml-4">
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 flex items-center justify-center" title="Full Preview">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
