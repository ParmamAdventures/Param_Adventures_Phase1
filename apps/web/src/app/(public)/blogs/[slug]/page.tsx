import { BlogDetailView } from "@/components/blogs/BlogDetailView";
import { constructMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const apiV1 = `${baseUrl}/api/v1`;

async function fetchBlog(slug: string) {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    console.log(`[BlogDetail] Fetching: ${apiV1}/blogs/public/${slug}`);
    const response = await fetch(`${apiV1}/blogs/public/${slug}`, {
      cache: "no-store",
      headers: {
        Cookie: cookie || "",
      },
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
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 px-6 text-center text-[var(--foreground)]">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--accent)]/5 text-[var(--accent)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Blog not found</h1>
        <p className="text-muted-foreground max-w-xs font-medium">
          The story you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/blogs"
          className="rounded-2xl bg-[var(--accent)] px-8 py-3 font-bold text-white shadow-[var(--accent)]/20 shadow-lg transition-transform hover:scale-105"
        >
          Back to Stories
        </Link>
      </div>
    );
  }

  return <BlogDetailView blog={blog} />;
}
