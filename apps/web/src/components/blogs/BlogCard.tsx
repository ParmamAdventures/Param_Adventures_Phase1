import Card from "../ui/Card";
import Link from "next/link";
import BlogMeta from "./BlogMeta";

export default function BlogCard({ blog }: { blog: any }) {
  return (
    <Card className="space-y-2 hover:opacity-90 transition">
      {blog.image && (
        <div className="overflow-hidden rounded-md">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <Link href={`/blogs/${blog.slug}`}>
        <h2 className="text-xl font-semibold">{blog.title}</h2>
      </Link>

      <p className="opacity-70">{blog.excerpt}</p>

      <BlogMeta blog={blog} />
    </Card>
  );
}
