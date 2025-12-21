import Link from "next/link";
import BlogMeta from "./BlogMeta";

export default function BlogCard({ blog }: { blog: any }) {
  const imageUrl = blog.coverImage?.mediumUrl || blog.image;
  
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
      {/* Image Container - Aspect Video (16:9) */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-accent/5 text-accent/20">
            <span className="text-4xl font-bold opacity-20">Aa</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex flex-1 flex-col p-5 space-y-4">
        <div className="space-y-2 flex-1">
          <Link href={`/blogs/${blog.slug}`} className="block group/title">
            <h2 className="text-xl font-bold leading-tight line-clamp-2 text-foreground group-hover:text-accent transition-colors">
              <span className="absolute inset-0" />
              {blog.title}
            </h2>
          </Link>

          {blog.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-border/50">
          <BlogMeta blog={blog} />
        </div>
      </div>
    </div>
  );
}
