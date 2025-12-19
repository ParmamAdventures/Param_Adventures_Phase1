export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const classes = [
    "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4",
    "transition-transform transition-shadow",
    "hover:-translate-y-1 hover:shadow-lg",
    "duration-[var(--motion-base)] ease-[var(--motion-ease)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export default Card;
