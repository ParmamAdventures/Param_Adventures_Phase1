
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export default function StarRating({ 
  rating, 
  editable = false, 
  onRatingChange,
  size = 18 
}: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFull = i <= rating;
    const isHalf = !isFull && i - 0.5 <= rating;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!editable}
        onClick={() => editable && onRatingChange && onRatingChange(i)}
        onMouseEnter={() => editable && onRatingChange && onRatingChange(i)} // Optional hover effect logic could go here
        className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
      >
        {isFull ? (
          <Star size={size} className="fill-yellow-400 text-yellow-400" />
        ) : isHalf ? (
          <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />
        ) : (
          <Star size={size} className="text-gray-300 dark:text-gray-600" />
        )}
      </button>
    );
  }

  return <div className="flex items-center gap-1">{stars}</div>;
}
