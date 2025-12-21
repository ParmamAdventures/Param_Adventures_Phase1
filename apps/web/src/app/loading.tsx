export default function RootLoading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center space-y-6 z-50">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-[6px] border-accent/10 rounded-[32px]" />
        <div className="absolute inset-0 border-[6px] border-accent border-t-transparent border-r-transparent rounded-[32px] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-xl font-black italic text-accent tracking-tighter">P</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-foreground">PARAM ADVENTURES</h2>
        <div className="h-0.5 w-32 bg-border relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-accent w-1/3 animate-[loading_1.5s_infinite_ease-in-out]" />
        </div>
      </div>
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
