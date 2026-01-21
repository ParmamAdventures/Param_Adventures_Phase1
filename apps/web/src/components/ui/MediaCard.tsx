import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  title: string;
  href: string;
  imageUrl?: string | null;
  imageAlt?: string;
  badges?: React.ReactNode;
  topRightActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  aspectRatio?: string;
}

export function MediaCard({
  title,
  href,
  imageUrl,
  imageAlt,
  badges,
  topRightActions,
  footer,
  className,
  children,
  aspectRatio = "aspect-[4/3]",
}: MediaCardProps) {
  return (
    <div
      className={cn(
        "group bg-card border-border relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <Link href={href} className="absolute inset-0 z-10">
        <span className="sr-only">View {title}</span>
      </Link>

      {/* Image Container */}
      <div className={cn("relative overflow-hidden", aspectRatio)}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground text-4xl font-bold opacity-20">PARAM</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {badges && (
          <div className="pointer-events-none absolute top-4 left-4 z-20 flex flex-wrap gap-2">
            {badges}
          </div>
        )}

        {topRightActions && (
          <div className="pointer-events-auto absolute top-4 right-4 z-20">{topRightActions}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="flex-1 space-y-1">{children}</div>

        {footer && <div className="relative z-20 pt-2">{footer}</div>}
      </div>
    </div>
  );
}
