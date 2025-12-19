export default function BlogMeta({ blog }: { blog: any }) {
  return (
    <div className="text-sm opacity-50">
      {blog.author} · {blog.publishedAt}
    </div>
  );
}
