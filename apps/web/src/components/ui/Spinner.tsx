type SpinnerSize = "sm" | "md" | "lg" | number;

const sizeMap: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

export function Spinner({ size = 16, className = "" }: { size?: SpinnerSize; className?: string }) {
  const numericSize = typeof size === "number" ? size : sizeMap[size] || 16;

  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin duration-700 ${className}`}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Spinner;
