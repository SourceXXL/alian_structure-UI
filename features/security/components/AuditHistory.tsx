"use client";

import React from "react";
import { AuditRecord } from "@/lib/security/types";
import { getScoreColor } from "@/lib/security/scoring";

interface AuditHistoryProps {
  audits: AuditRecord[];
}

export default function AuditHistory({ audits }: AuditHistoryProps) {
  if (audits.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg border border-cosmic-purple/20 nebula-bg">
        <p className="text-gray-500 text-sm">
          No audit history available for this contract.
        </p>
      </div>
    );
  }

  const sorted = [...audits].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-3">
      {sorted.map((audit) => (
        <div
          key={audit.id}
          className="p-4 rounded-lg border border-cosmic-purple/20 nebula-bg hover:border-cosmic-purple/40 transition-smooth"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {audit.auditor}
              </span>
              <span className="text-xs text-gray-500">v{audit.version}</span>
            </div>
            <span
              className={`text-lg font-bold ${getScoreColor(audit.score.overall)}`}
            >
              {audit.score.overall}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{new Date(audit.timestamp).toLocaleDateString()}</span>
            <span>{audit.vulnerabilities.length} issues</span>
            <span className="capitalize">{audit.network}</span>
            {audit.txHash && (
              <span className="font-mono truncate max-w-[120px]">
                tx: {audit.txHash}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
