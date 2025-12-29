import { BlogDetailView } from "@/components/blogs/BlogDetailView";
import { constructMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchBlog(slug: string) {
  try {
    const response = await fetch(`${baseUrl}/blogs/public/${slug}`, { 
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Fetch blog error:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    return constructMetadata({
      title: "Blog Not Found",
      description: "The requested blog story could not be found.",
    });
  }

  return constructMetadata({
    title: blog.title,
    description: blog.excerpt || undefined,
    image: blog.coverImage?.originalUrl || "/og-image.jpg",
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 px-6 text-center text-[var(--foreground)]">
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

  return <BlogDetailView blog={blog} />;
}
