import BlogsClient from "@/components/blogs/BlogsClient";

export default function BlogsPage() {
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
        </div>
      </section>

      {/* Blogs Client (Search & Grid) */}
      <section className="max-w-7xl mx-auto px-6">
        <BlogsClient />
      </section>
    </div>
  );
}
