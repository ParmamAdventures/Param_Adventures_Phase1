/**
 * Card - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
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
