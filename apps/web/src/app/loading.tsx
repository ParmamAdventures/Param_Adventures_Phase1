export default function RootLoading() {
  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center space-y-6">
      <div className="relative h-24 w-24">
        <div className="border-accent/10 absolute inset-0 rounded-[32px] border-[6px]" />
        <div className="border-accent absolute inset-0 animate-spin rounded-[32px] border-[6px] border-t-transparent border-r-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-accent text-xl font-black tracking-tighter italic">P</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-foreground text-sm font-black tracking-[0.4em] uppercase">
          PARAM ADVENTURES
        </h2>
        <div className="bg-border relative h-0.5 w-32 overflow-hidden rounded-full">
          <div className="bg-accent animate-progress absolute inset-0 w-1/3" />
        </div>
      </div>
    </div>
  );
}
