export function ErrorBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ color: "var(--semantic-danger)", marginTop: 6, fontSize: 13 }}
    >
      {children}
    </div>
  );
}

export default ErrorBlock;
