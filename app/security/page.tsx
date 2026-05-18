"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import ScanForm from "@/features/security/components/ScanForm";
import SecurityDashboard from "@/features/security/components/SecurityDashboard";
import { SecurityReport, ScanRequest } from "@/lib/security/types";
import {
  exportReportAsJson,
  exportReportAsCsv,
  exportReportAsMarkdown,
} from "@/lib/security/report";

export default function SecurityPage() {
  const [report, setReport] = useState<SecurityReport | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (data: ScanRequest) => {
      const response = await axios.post("/api/security", {
        action: "scan",
        ...data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setReport(data.report);
      }
    },
  });

  const handleExport = (format: "json" | "csv" | "markdown") => {
    if (!report) return;

    let content: string;
    let mimeType: string;
    let ext: string;

    switch (format) {
      case "json":
        content = exportReportAsJson(report);
        mimeType = "application/json";
        ext = "json";
        break;
      case "csv":
        content = exportReportAsCsv(report);
        mimeType = "text/csv";
        ext = "csv";
        break;
      case "markdown":
        content = exportReportAsMarkdown(report);
        mimeType = "text/markdown";
        ext = "md";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `security-report-${report.contractId.slice(0, 8)}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="pt-24 pb-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">
            Security & Audit
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Scan your Soroban agent contracts for vulnerabilities, check Stellar
            ecosystem compliance, and get XLM resource optimization
            recommendations.
          </p>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg">
                <h2 className="text-lg font-semibold glow-text mb-4">
                  Contract Scanner
                </h2>
                <ScanForm
                  onScan={(data) => scanMutation.mutate(data)}
                  isLoading={scanMutation.isLoading}
                />
              </div>

              {scanMutation.isError && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {(scanMutation.error as any)?.message ||
                    "Scan failed. Please try again."}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {report ? (
              <SecurityDashboard report={report} onExport={handleExport} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-16 text-center rounded-2xl border-2 border-dashed border-cosmic-purple/20 bg-cosmic-purple/5 min-h-[500px]">
                <div className="w-20 h-20 mb-6 rounded-full bg-cosmic-purple/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-cosmic-purple"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">
                  No Scan Results
                </h3>
                <p className="text-gray-400 max-w-md">
                  Enter a Soroban contract ID and run a security scan to see
                  vulnerability analysis, compliance checks, security scoring,
                  and resource optimization suggestions.
                </p>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { icon: "🔍", label: "Vulnerability Scanning" },
                    { icon: "📊", label: "Security Scoring" },
                    { icon: "✅", label: "Compliance Checks" },
                    { icon: "💰", label: "Cost Optimization" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-lg bg-cosmic-purple/10"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
