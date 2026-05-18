"use client";

import React from "react";
import { SecurityBadgeInfo } from "@/lib/security/types";

const BADGE_STYLES: Record<
  SecurityBadgeInfo["type"],
  { icon: string; gradient: string }
> = {
  verified: {
    icon: "🛡️",
    gradient: "from-green-500/20 to-green-700/20 border-green-500/40",
  },
  audited: {
    icon: "🔍",
    gradient: "from-blue-500/20 to-blue-700/20 border-blue-500/40",
  },
  compliant: {
    icon: "✅",
    gradient: "from-purple-500/20 to-purple-700/20 border-purple-500/40",
  },
  certified: {
    icon: "🏆",
    gradient: "from-yellow-500/20 to-yellow-700/20 border-yellow-500/40",
  },
};

interface SecurityBadgesProps {
  badges: SecurityBadgeInfo[];
}

export default function SecurityBadges({ badges }: SecurityBadgesProps) {
  if (badges.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-gray-700/40 bg-gray-800/20 text-center">
        <p className="text-gray-500 text-sm">
          No badges earned yet. Improve your security score to earn badges.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {badges.map((badge, i) => {
        const style = BADGE_STYLES[badge.type];
        return (
          <div
            key={`${badge.type}-${i}`}
            className={`p-4 rounded-lg border bg-gradient-to-br ${style.gradient} transition-smooth hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">
                  {badge.label}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                  by {badge.issuer}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(badge.issuedAt).toLocaleDateString()}
                  {badge.score !== undefined && ` · Score: ${badge.score}`}
                </p>
              </div>
            </div>
            {badge.txHash && (
              <p className="text-xs text-gray-500 mt-2 truncate font-mono">
                tx: {badge.txHash}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
