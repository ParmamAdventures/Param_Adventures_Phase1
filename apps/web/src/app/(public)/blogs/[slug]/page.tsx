import BlogMeta from "../../../../components/blogs/BlogMeta";

async function getBlog(slug: string) {
  // Temporary mock content
  return {
    title: "Trekking the Western Ghats",
    content: `
      The Western Ghats offer one of the most breathtaking trekking
      experiences in India. From dense forests to open ridges...
    `,
    author: "Param Adventures",
    publishedAt: "2025-01-12",
  };
}

export default async function BlogDetailPage({ params }: any) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const blog = await getBlog(slug);

  return (
    <article className="max-w-3xl mx-auto space-y-6">
      {blog.image && (
        <div className="overflow-hidden rounded-md">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold">{blog.title}</h1>
      <BlogMeta blog={blog} />

      <div className="prose dark:prose-invert max-w-none">{blog.content}</div>
    </article>
  );
}
