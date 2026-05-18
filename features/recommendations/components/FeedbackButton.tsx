'use client';

import React, { useState } from 'react';
import { recommendationService } from '../services/recommendationService';

interface FeedbackButtonProps {
  agentId: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ agentId }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleRating = async (value: number) => {
    setRating(value);
    await recommendationService.sendFeedback({
      agentId,
      rating: value,
      usageType: 'rated',
    });
    setHasSubmitted(true);
    setTimeout(() => {
        setHasSubmitted(false);
        setRating(null);
    }, 3000);
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-xs text-gray-400 capitalize">Was this helpful?</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className={`text-xl transition-smooth hover:scale-125 focus:outline-none ${
              rating && star <= rating ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-gray-600 grayscale hover:grayscale-0'
            }`}
          >
            ⭐
          </button>
        ))}
      </div>
      {hasSubmitted && (
        <span className="text-xs text-cosmic-cyan animate-pulse ml-2 px-2 py-1 bg-cosmic-cyan/10 rounded-full">
          Feedback sent!
        </span>
      )}
    </div>
  );
};
