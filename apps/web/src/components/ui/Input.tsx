type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  state?: "normal" | "error" | "disabled";
};

/**
 * Input - Form input component with validation.
 * @param {Object} props - Component props
 * @param {'text'|'email'|'password'|'number'} [props.type] - Input type
 * @param {string} [props.value] - Current value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.error] - Error message if any
 * @returns {React.ReactElement} Input element
 */
export function Input({ label, className, error = null, state = "normal", ...props }: Props) {
  const stateClasses =
    state === "error"
      ? "border-[var(--semantic-danger)]"
      : state === "disabled"
        ? "opacity-60 cursor-not-allowed"
        : "";

  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-[var(--muted)]">{label}</div> : null}
      <input
        {...props}
        disabled={state === "disabled" || props.disabled}
        className={`w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] ${stateClasses} ${className ?? ""} transition duration-[var(--motion-fast)] ease-[var(--motion-ease)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset-color)] focus-visible:outline-none`}
      />
      {error ? (
        <div className="mt-1.5 text-[13px] text-red-500">
          {error}
        </div>
      ) : null}
    </label>
  );
}

export default Input;
