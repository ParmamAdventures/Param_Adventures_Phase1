import { Blog } from "@/types/blog";

/**
 * BlogMeta - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function BlogMeta({ blog }: { blog: Blog }) {
  const authorName = blog.author?.name || blog.author?.email || blog.author || "Param Adventures";
  const dateStr = blog.createdAt || blog.publishedAt;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : "";

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
      <span className="text-foreground">{authorName}</span>
      <span>•</span>
      <span>{formattedDate}</span>
    </div>
  );
}
