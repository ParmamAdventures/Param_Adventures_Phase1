export default function BlogMeta({ blog }: { blog: any }) {
  const authorName = blog.author?.name || blog.author?.email || blog.author || "Param Adventures";
  const dateStr = blog.createdAt || blog.publishedAt;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : "";

  return (
    <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
      <span className="text-foreground">{authorName}</span>
      <span>•</span>
      <span>{formattedDate}</span>
    </div>
  );
}
