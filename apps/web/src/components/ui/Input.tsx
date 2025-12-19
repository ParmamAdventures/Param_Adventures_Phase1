type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm text-[var(--muted)]">{label}</div>
      ) : null}
      <input
        {...props}
        className={`w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] ${className ?? ""}`}
      />
    </label>
  );
}

export default Input;
