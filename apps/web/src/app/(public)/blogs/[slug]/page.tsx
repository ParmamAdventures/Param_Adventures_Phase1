import { BlogClientContent } from "@/components/blogs/BlogClientContent";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchBlog(slug: string) {
  const response = await fetch(`${baseUrl}/blogs/public/${slug}`, { 
    cache: "no-store", // Or use revalidate for production
  });
  if (!response.ok) return null;
  return response.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | Param Adventures`,
    description: blog.excerpt || `Read about ${blog.title} on Param Adventures.`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage.originalUrl] : [],
      type: "article",
      publishedTime: blog.createdAt,
      authors: [blog.author?.name || "Param Adventures"],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage.originalUrl] : [],
    }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Blog not found</h1>
        <p className="text-muted-foreground">The story you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-12 px-6 space-y-8 animate-in fade-in duration-700">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{blog.title}</h1>
        <div className="flex items-center justify-center gap-3 text-muted-foreground font-medium">
          <span>By {blog.author?.name || "Param Adventures"}</span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </header>

      {blog.coverImage && (
        <div className="aspect-[21/9] relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={blog.coverImage.originalUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {blog.excerpt && (
        <p className="text-xl text-muted-foreground italic border-l-4 border-accent pl-6 py-4 bg-muted/20 rounded-r-lg">
          {blog.excerpt}
        </p>
      )}

      <BlogClientContent content={blog.content} />
    </article>
  );
}
