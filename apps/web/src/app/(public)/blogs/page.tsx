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

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 px-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Stories from the <span className="text-[var(--accent)]">Trail</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Join the Param community. Discover raw accounts of wild expeditions, 
            survival tips, and the gear that gets us there.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <div className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {blogs.length} Stories Found
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-6">
        {(!blogs || blogs.length === 0) ? (
          <Card className="text-center py-32 border-dashed bg-[var(--surface)]/50 rounded-[40px]">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 1 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h3 className="text-2xl font-bold">The trail is quiet...</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">
              We haven't shared any stories yet. Check back soon for new adventures!
            </p>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog: any, index: number) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
