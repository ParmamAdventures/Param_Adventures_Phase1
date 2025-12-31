import BlogsClient from "@/components/blogs/BlogsClient";

export default function BlogsPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute top-0 left-1/2 -z-10 h-full w-full max-w-7xl -translate-x-1/2">
          <div className="absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-[var(--accent)]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl space-y-6 px-6 text-center">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic md:text-7xl">
            Stories from the <span className="text-[var(--accent)]">Trail</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed font-medium">
            Join the Param community. Discover raw accounts of wild expeditions, survival tips, and
            the gear that gets us there.
          </p>
        </div>
      </section>

      {/* Blogs Client (Search & Grid) */}
      <section className="mx-auto max-w-7xl px-6">
        <BlogsClient />
      </section>
    </div>
  );
}
