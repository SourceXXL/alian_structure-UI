"use client";

import React from "react";
import { ComplianceResult } from "@/lib/security/types";
import { getComplianceSummary } from "@/lib/security/compliance";

interface CompliancePanelProps {
  results: ComplianceResult[];
}

export default function CompliancePanel({ results }: CompliancePanelProps) {
  const summary = getComplianceSummary(results);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-cosmic-purple/20 nebula-bg text-center">
          <p className="text-2xl font-bold text-white">{summary.total}</p>
          <p className="text-xs text-gray-400">Total Rules</p>
        </div>
        <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-center">
          <p className="text-2xl font-bold text-green-400">{summary.passed}</p>
          <p className="text-xs text-gray-400">Passed</p>
        </div>
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-2xl font-bold text-red-400">{summary.failed}</p>
          <p className="text-xs text-gray-400">Failed</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700"
          style={{ width: `${summary.passRate}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-400">
        {summary.passRate}% compliance rate
      </p>

      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.ruleId}
            className={`p-3 rounded-lg border transition-smooth ${
              result.passed
                ? "border-green-500/20 bg-green-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{result.passed ? "✅" : "❌"}</span>
                <span className="font-mono text-xs text-gray-500">
                  {result.ruleId}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded capitalize ${
                  result.severity === "critical"
                    ? "bg-red-500/20 text-red-400"
                    : result.severity === "high"
                      ? "bg-orange-500/20 text-orange-400"
                      : result.severity === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {result.severity}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">{result.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
