export default function StyleGuidePage() {
  return (
    <div className="py-12 text-[var(--text)]">
      <h1 className="mb-8 text-4xl font-bold border-b border-accent/20 pb-4">Style Guide</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-accent">Colors</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded bg-background border border-accent/20"></div>
            <span className="mt-2 text-sm italic opacity-70">Background</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded bg-accent"></div>
            <span className="mt-2 text-sm italic opacity-70">Accent</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded bg-foreground opacity-10"></div>
            <span className="mt-2 text-sm italic opacity-70">Muted</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-accent">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Heading 1 (4xl)</h1>
          <h2 className="text-3xl font-bold">Heading 2 (3xl)</h2>
          <h3 className="text-2xl font-bold">Heading 3 (2xl)</h3>
          <p className="text-lg">Body Large (lg) - The quick brown fox jumps over the lazy dog.</p>
          <p className="text-base">Body Regular (base) - Experience the adventure of a lifetime.</p>
        </div>
      </section>

      <div className="mt-12 text-sm opacity-50 italic">
        * This guide is for internal reference during development.
      </div>
    </div>
  );
}
