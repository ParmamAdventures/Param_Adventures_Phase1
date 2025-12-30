import Link from "next/link";
import { Button } from "../ui/Button";
import { Users, Calendar, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react"; // Added useState import
import { FileText } from "lucide-react"; // Added FileText import
import AssignCrewModal from "./AssignCrewModal"; // Assuming this import exists
import ReviewDocsModal from "./ReviewDocsModal"; // Assuming this import exists

interface ManagerTripCardProps {
    trip: any;
    onUpdate: () => void; // Changed from onAssignGuide to onUpdate
}

export default function ManagerTripCard({ trip, onUpdate }: ManagerTripCardProps) {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false); // Added isReviewOpen state
    const isPublished = trip.status === 'PUBLISHED';
    const isDraft = trip.status === 'DRAFT';
    
    // Status color
    const statusColor = isPublished ? "text-green-500 bg-green-500/10" : isDraft ? "text-orange-500 bg-orange-500/10" : "text-gray-500 bg-gray-500/10";

    return (
        <div className="flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Image Thumbnail */}
            <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0">
                <Image
                    src={trip.coverImage?.mediumUrl || trip.coverImageLegacy || "/placeholder-trip.jpg"}
                    alt={trip.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between gap-4">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor} mb-2 inline-block`}>
                                {trip.status}
                            </span>
                            <h3 className="font-bold text-lg text-foreground leading-tight">{trip.title}</h3>
                        </div>
                         {/* Bookings Count */}
                         <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-accent/5 px-2 py-1 rounded-lg">
                            <Users size={14} />
                            <span>{trip._count?.bookings || 0} / {trip.capacity || '∞'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{trip.location}</span>
                        </div>
                    </div>
                </div>

                {/* Footer: Guides & Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                     {/* Assigned Guides */}
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guides:</span>
                        {trip.guides && trip.guides.length > 0 ? (
                            <div className="flex -space-x-2">
                                {trip.guides.map((g: any) => (
                                    <div key={g.guide.id} title={g.guide.name} className="w-6 h-6 rounded-full border border-background bg-accent text-white flex items-center justify-center text-[10px] overflow-hidden relative">
                                        {g.guide.avatarImage?.mediumUrl ? (
                                            <Image src={g.guide.avatarImage.mediumUrl} fill alt={g.guide.name} className="object-cover" />
                                        ) : (
                                            g.guide.name[0]
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs text-orange-500 flex items-center gap-1">
                                <AlertCircle size={10} /> None
                            </span>
                        )}
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2">
                         <Button 
                            variant="subtle" 
                            size="sm" 
                            onClick={() => setIsAssignModalOpen(true)} // Changed to open modal
                            className="h-8 text-xs font-medium"
                         >
                            Manage Crew
                         </Button>
                         <Button variant="primary" size="sm" className="h-8 text-xs gap-2 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90" onClick={() => setIsReviewOpen(true)}>
                            <FileText size={14} /> Review Docs
                         </Button>
                         <Link href={`/dashboard/manager/trip/${trip.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs">Details</Button>
                         </Link>
                     </div>
                </div>
            </div>

            <AssignCrewModal 
                isOpen={isAssignModalOpen} 
                onClose={() => setIsAssignModalOpen(false)} 
                tripId={trip.id}
                currentGuides={trip.guides}
                onSuccess={onUpdate}
            />

            <ReviewDocsModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                trip={trip}
                onSuccess={onUpdate}
            />
        </div>
    );
}
