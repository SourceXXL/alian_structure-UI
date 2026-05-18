"use client";

import React from "react";
import { SecurityScore } from "@/lib/security/types";
import { getScoreColor } from "@/lib/security/scoring";

interface ScoreRingProps {
  score: SecurityScore;
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.overall / 100) * circumference;

  const colorClass = getScoreColor(score.overall);
  const strokeColor =
    score.overall >= 85
      ? "#4ade80"
      : score.overall >= 70
        ? "#facc15"
        : score.overall >= 55
          ? "#fb923c"
          : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(139, 92, 246, 0.15)"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${colorClass}`}>
            {score.overall}
          </span>
          <span className="text-sm text-gray-400">/ 100</span>
          <span className={`text-lg font-semibold mt-1 ${colorClass}`}>
            {score.grade}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm w-full max-w-xs">
        {Object.entries(score.breakdown).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-400 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className={getScoreColor(value)}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
