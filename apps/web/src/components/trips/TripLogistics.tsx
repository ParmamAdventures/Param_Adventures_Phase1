export default function TripLogistics({ trip }: { trip: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <h3 className="font-bold text-lg">Trip Logistics</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {trip.startPoint && (
          <div className="flex items-start gap-3">
             <div className="mt-1 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
             <div>
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Start Point</p>
                <p className="font-medium text-foreground">{trip.startPoint}</p>
             </div>
          </div>
        )}
        
        {trip.endPoint && (
           <div className="flex items-start gap-3">
             <div className="mt-1 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
             </div>
             <div>
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">End Point</p>
                <p className="font-medium text-foreground">{trip.endPoint}</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
             {trip.altitude && (
                <div>
                     <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Max Altitude</p>
                     <p className="font-bold text-lg text-foreground">{trip.altitude}</p>
                </div>
             )}
             {trip.distance && (
                <div>
                     <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Trek Distance</p>
                     <p className="font-bold text-lg text-foreground">{trip.distance}</p>
                </div>
             )}
        </div>
      </div>
    </div>
  );
}
