"use client";

import React from "react";
import { ResourceOptimization } from "@/lib/security/types";

interface OptimizationsPanelProps {
  optimizations: ResourceOptimization[];
}

const CATEGORY_ICONS: Record<string, string> = {
  cpu: "⚡",
  memory: "🧠",
  storage: "💾",
  cost: "💰",
};

export default function OptimizationsPanel({
  optimizations,
}: OptimizationsPanelProps) {
  if (optimizations.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg border border-cosmic-purple/20 nebula-bg">
        <p className="text-gray-400 text-sm">
          No resource optimizations suggested. Your contract is efficient.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {optimizations.map((opt, i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-cosmic-purple/20 nebula-bg hover:border-cosmic-purple/40 transition-smooth"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">
              {CATEGORY_ICONS[opt.category] || "📊"}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-white text-sm">{opt.title}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded capitalize ${
                    opt.priority === "high" || opt.priority === "critical"
                      ? "bg-orange-500/20 text-orange-400"
                      : opt.priority === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {opt.priority}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{opt.description}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Current</span>
                  <p className="text-red-400 font-mono">{opt.currentValue}</p>
                </div>
                <div>
                  <span className="text-gray-500">Suggested</span>
                  <p className="text-green-400 font-mono">
                    {opt.suggestedValue}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Savings</span>
                  <p className="text-cosmic-cyan font-mono">
                    {opt.estimatedSavings}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
