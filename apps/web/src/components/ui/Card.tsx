export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const classes = [
    "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export default Card;
