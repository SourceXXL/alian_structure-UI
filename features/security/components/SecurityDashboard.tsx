"use client";

import React from "react";
import { SecurityReport } from "@/lib/security/types";
import ScoreRing from "./ScoreRing";
import SecurityBadges from "./SecurityBadges";
import VulnerabilityList from "./VulnerabilityList";
import CompliancePanel from "./CompliancePanel";
import OptimizationsPanel from "./OptimizationsPanel";
import AuditHistory from "./AuditHistory";

interface SecurityDashboardProps {
  report: SecurityReport;
  onExport: (format: "json" | "csv" | "markdown") => void;
}

export default function SecurityDashboard({
  report,
  onExport,
}: SecurityDashboardProps) {
  const criticalCount = report.vulnerabilities.filter(
    (v) => v.severity === "critical",
  ).length;
  const highCount = report.vulnerabilities.filter(
    (v) => v.severity === "high",
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg flex flex-col items-center">
          <h3 className="text-lg font-semibold glow-text mb-4">
            Security Score
          </h3>
          <ScoreRing score={report.score} />
        </div>

        <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
          <h3 className="text-lg font-semibold glow-text mb-4">Summary</h3>
          <p className="text-sm text-gray-300 mb-4">{report.summary}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-xs text-gray-400">Critical</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-2xl font-bold text-orange-400">{highCount}</p>
              <p className="text-xs text-gray-400">High</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {
                  report.vulnerabilities.filter((v) => v.severity === "medium")
                    .length
                }
              </p>
              <p className="text-xs text-gray-400">Medium</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {
                  report.vulnerabilities.filter((v) => v.severity === "low")
                    .length
                }
              </p>
              <p className="text-xs text-gray-400">Low</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
          <h3 className="text-lg font-semibold glow-text mb-4">
            Badges & Certifications
          </h3>
          <SecurityBadges badges={report.badges} />
          <div className="mt-4 pt-4 border-t border-cosmic-purple/20">
            <p className="text-xs text-gray-500 mb-2">Export Report</p>
            <div className="flex gap-2">
              {(["json", "csv", "markdown"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onExport(fmt)}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-smooth uppercase"
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
          <h3 className="text-lg font-semibold glow-text mb-4">
            Vulnerabilities ({report.vulnerabilities.length})
          </h3>
          <VulnerabilityList vulnerabilities={report.vulnerabilities} />
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
            <h3 className="text-lg font-semibold glow-text mb-4">
              Stellar Compliance
            </h3>
            <CompliancePanel results={report.compliance} />
          </div>

          {report.optimizations.length > 0 && (
            <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
              <h3 className="text-lg font-semibold glow-text mb-4">
                XLM Resource Optimizations ({report.optimizations.length})
              </h3>
              <OptimizationsPanel optimizations={report.optimizations} />
            </div>
          )}
        </div>
      </div>

      {report.auditHistory.length > 0 && (
        <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
          <h3 className="text-lg font-semibold glow-text mb-4">
            Audit History
          </h3>
          <AuditHistory audits={report.auditHistory} />
        </div>
      )}

      <div className="p-4 rounded-lg border border-cosmic-purple/10 bg-cosmic-purple/5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Report ID: {report.id}</span>
          <span>Contract: {report.contractId}</span>
          <span>Network: {report.network}</span>
          <span>
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
