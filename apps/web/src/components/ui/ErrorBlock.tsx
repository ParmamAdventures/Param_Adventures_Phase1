/**
 * ErrorBlock - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function ErrorBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1.5 text-[13px] text-red-500">{children}</div>
  );
}

export default ErrorBlock;
