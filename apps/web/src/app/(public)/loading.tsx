export default function PublicLoading() {
  return (
    <div className="animate-fade-in-up flex min-h-[60vh] flex-col items-center justify-center space-y-6">
      <div className="relative h-20 w-20">
        <div className="border-accent/20 absolute inset-0 rounded-full border-4" />
        <div className="border-accent absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-accent animate-pulse text-[10px] font-black tracking-tighter uppercase">
            PARAM
          </span>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse text-sm font-black tracking-[0.3em] uppercase">
        Initializing Expedition...
      </p>
    </div>
  );
}
