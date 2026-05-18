"use client";

import React from "react";

interface QualityScoreProps {
  score: number;
}

export const QualityScore: React.FC<QualityScoreProps> = ({ score }) => {
  const getGrade = (s: number) => {
    if (s >= 90)
      return {
        label: "A",
        color: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/50",
      };
    if (s >= 80)
      return {
        label: "B",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        border: "border-blue-500/50",
      };
    if (s >= 70)
      return {
        label: "C",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        border: "border-yellow-500/50",
      };
    if (s >= 60)
      return {
        label: "D",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        border: "border-orange-500/50",
      };
    return {
      label: "F",
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/50",
    };
  };

  const grade = getGrade(score);

  return (
    <div
      className={`p-6 rounded-2xl border ${grade.border} ${grade.bg} flex flex-col items-center justify-center space-y-2 w-32 h-32 backdrop-blur-md`}
    >
      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
        Quality
      </span>
      <span className={`text-5xl font-black ${grade.color} drop-shadow-glow`}>
        {grade.label}
      </span>
      <span className="text-gray-400 text-xs">{score}/100</span>
    </div>
  );
};

export default QualityScore;
