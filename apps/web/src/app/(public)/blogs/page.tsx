import BlogCard from "@/components/blogs/BlogCard";
import Card from "@/components/ui/Card";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getBlogs() {
  const response = await fetch(`${baseUrl}/blogs/public`, { cache: "no-store" });
  if (!response.ok) return [];
  return response.json();
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  if (!blogs || blogs.length === 0) {
    return (
      <section className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-4xl font-extrabold tracking-tight">Stories from the Trail</h1>
        <Card className="text-center py-24 border-dashed bg-muted/10">
          <h3 className="text-xl font-semibold">The trail is quiet...</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            We haven't shared any stories yet. Check back soon for new adventures!
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight relative inline-block">
          Stories from the <span className="text-accent">Trail</span>
          <div className="absolute -bottom-2 left-0 w-24 h-1 bg-accent rounded-full" />
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl pt-2">
          Join us as we recount our most memorable journeys, share expert tips, and explore the beauty of the wild.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog: any) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
