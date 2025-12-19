type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  state?: "normal" | "error" | "disabled";
};

export function Input({
  label,
  className,
  error = null,
  state = "normal",
  ...props
}: Props) {
  const stateClasses =
    state === "error"
      ? "border-[var(--semantic-danger)]"
      : state === "disabled"
        ? "opacity-60 cursor-not-allowed"
        : "";

  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm text-[var(--muted)]">{label}</div>
      ) : null}
      <input
        {...props}
        disabled={state === "disabled" || props.disabled}
        className={`w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] ${stateClasses} ${className ?? ""}`}
      />
      {error ? (
        <div
          style={{
            color: "var(--semantic-danger)",
            marginTop: 6,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}
    </label>
  );
}

export default Input;
