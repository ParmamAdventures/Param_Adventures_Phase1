type Props = {
  variant?: "primary" | "ghost" | "danger" | "subtle";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

import Spinner from "./Spinner";

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  ...props
}: Props) {
  const classes = [
    "relative items-center justify-center inline-flex rounded-xl px-6 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:pointer-events-none",
    variant === "primary" && "bg-accent text-white shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5",
    variant === "ghost" &&
      "bg-transparent text-foreground hover:bg-accent/10 hover:text-accent",
    variant === "danger" &&
      "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    variant === "subtle" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    loading && "opacity-70 cursor-not-allowed",
    "active:scale-[0.98] duration-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} disabled={loading || props.disabled} className={classes} suppressHydrationWarning>
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

export default Button;
