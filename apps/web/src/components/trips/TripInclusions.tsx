export default function TripInclusions({ 
    inclusions = [], 
    exclusions = [], 
    thingsToPack = [] 
}: { 
    inclusions?: string[], 
    exclusions?: string[], 
    thingsToPack?: string[] 
}) {
  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inclusions */}
        {inclusions.length > 0 && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
                <h3 className="font-bold text-xl mb-6 text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Inclusions
                </h3>
                <ul className="space-y-3">
                    {inclusions.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-emerald-900 dark:text-emerald-100/80">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Exclusions */}
        {exclusions.length > 0 && (
            <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
                <h3 className="font-bold text-xl mb-6 text-red-800 dark:text-red-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    Exclusions
                </h3>
                <ul className="space-y-3">
                    {exclusions.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-red-900 dark:text-red-100/80">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {thingsToPack.length > 0 && (
        <div className="border border-border rounded-xl p-8 bg-card">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                Things to Pack
            </h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                {thingsToPack.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                        {item}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
