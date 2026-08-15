'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onRate, readonly = false }) {
    const [hoverRating, setHoverRating] = useState(0);

    const displayRating = readonly ? rating : (hoverRating || rating);

    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
                const fillPercentage = Math.max(0, Math.min(100, (displayRating - star + 1) * 100));

                return (
                    <div
                        key={star}
                        className={`relative cursor-${readonly ? 'default' : 'pointer'} transition-transform ${!readonly && 'hover:scale-110'}`}
                        onClick={() => !readonly && onRate && onRate(star)}
                        onMouseEnter={() => !readonly && setHoverRating(star)}
                    >
                        <Star className="w-6 h-6 text-gray-200" fill="currentColor" strokeWidth={0} />
                        <div
                            className="absolute inset-0 overflow-hidden text-yellow-400"
                            style={{ width: `${fillPercentage}%` }}
                        >
                            <Star className="w-6 h-6" fill="currentColor" strokeWidth={0} />
                        </div>
                    </div>
                );
            })}

            {readonly && (
                <span className="ml-2 text-sm font-semibold text-gray-700">
                    {Number(rating).toFixed(1)}
                </span>
            )}
        </div>
    );
}
