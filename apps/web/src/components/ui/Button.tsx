type Props = {
  variant?: "primary" | "ghost" | "danger" | "subtle";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  ...props
}: Props) {
  const classes = [
    "rounded-md px-4 py-2 text-sm font-medium transition",
    variant === "primary" && "bg-[var(--accent)] text-white hover:opacity-90",
    variant === "ghost" &&
      "bg-transparent text-[var(--text)] hover:bg-[var(--surface)]",
    variant === "danger" &&
      "bg-[var(--semantic-danger)] text-white hover:opacity-90",
    variant === "subtle" && "bg-[var(--surface)] text-[var(--text)]",
    loading && "opacity-70 cursor-not-allowed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} disabled={loading || props.disabled} className={classes}>
      {loading ? "Processing…" : children}
    </button>
  );
}

export default Button;
