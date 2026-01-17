"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/ToastProvider";

interface HeartButtonProps {
  tripId: string;
  initialSaved?: boolean;
  className?: string;
  onToggle?: (isSaved: boolean) => void;
  checkStatus?: boolean;
  size?: number;
}

export default function HeartButton({
  tripId,
  initialSaved = false,
  className,
  onToggle,
  checkStatus = false,
  size = 20,
}: HeartButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop if provided
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  // Check stats on mount if requested and user is logged in
  useEffect(() => {
    if (checkStatus && user) {
      // We'd need a specific endpoint to check ONE trip, or fetch all.
      // For now, let's just fetch all (cached) or assume the list is lightweight.
      // A better API would be GET /wishlist/check?tripId=...
      // For now, let's skip complex API changes and assume we can tolerate the "Toggle" quirck
      // OR implementing a quick check.
      // Let's implement /wishlist/check endpoint later if needed.
      // Actually, fetching all wishlist IDs is cheap.
      apiFetch("/wishlist")
        .then((res) => res.json())
        .then((data: any[]) => {
          const saved = data.some((t) => t.id === tripId);
          setIsSaved(saved);
        })
        .catch(() => {});
    }
  }, [checkStatus, user, tripId]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please login to save trips", "error");
      return;
    }

    if (isLoading) return;

    // Optimistic Update
    const newState = !isSaved;
    setIsSaved(newState);
    setIsLoading(true);

    try {
      const res = await apiFetch("/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) {
        throw new Error("Failed to update wishlist");
      }

      if (onToggle) {
        onToggle(newState);
      }

      showToast(newState ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch (error) {
      // Revert on error
      setIsSaved(!newState);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      suppressHydrationWarning
      className={cn(
        "focus:ring-accent/50 rounded-full p-2 transition-all duration-200 focus:ring-2 focus:outline-none active:scale-90",
        isSaved
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          : "bg-black/20 text-white backdrop-blur-sm hover:bg-black/40",
        className,
      )}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={size} className={cn("transition-all duration-300", isSaved && "fill-current")} />
    </button>
  );
}

