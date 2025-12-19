import BlogCard from "../../../components/blogs/BlogCard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

async function getBlogs() {
  // Temporary mock data for public blogs
  return [
    {
      id: "1",
      title: "Trekking the Western Ghats",
      excerpt: "An unforgettable journey through misty peaks.",
      slug: "trekking-the-western-ghats",
      author: "Param Adventures",
      publishedAt: "2025-01-12",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop&crop=faces",
    },
  ];
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  if (!blogs || blogs.length === 0) {
    return (
      <section className="space-y-8">
        <h1 className="text-3xl font-bold">Stories from the Trail</h1>
        <Card className="text-center py-16">
          <h3 className="text-lg font-semibold">No stories yet</h3>
          <p className="text-[var(--muted)] mt-2">
            Travel stories will appear here soon.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold">Stories from the Trail</h1>

      <div className="space-y-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
