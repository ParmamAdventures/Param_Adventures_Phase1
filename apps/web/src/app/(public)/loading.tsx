export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-fade-in-up">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-tighter text-accent animate-pulse">
            PARAM
          </span>
        </div>
      </div>
      <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
        Initializing Expedition...
      </p>
    </div>
  );
}
