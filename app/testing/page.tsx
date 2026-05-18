"use client";

import React, { useState } from "react";
import TestCaseBuilder from "@/features/agent-testing/components/TestCaseBuilder";
import BenchmarkDashboard from "@/features/agent-testing/components/BenchmarkDashboard";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function TestingPage() {
  const [executionResult, setExecutionResult] = useState<any>(null);

  const runTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await axios.post("/api/tests", {
        action: "run",
        ...testData,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setExecutionResult(data);
    },
  });

  const handleExport = () => {
    if (!executionResult) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(executionResult, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `test_result_${executionResult.id}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <main className="pt-24 pb-20 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">
            Agent Testing Suite
          </h1>
          <p className="text-gray-300 text-lg">
            Benchmark your Soroban agent contracts for efficiency, cost, and
            reliability.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border-r border-cosmic-purple/10 pr-0 lg:pr-8">
            <TestCaseBuilder
              onRun={(data) => runTestMutation.mutate(data)}
              isLoading={runTestMutation.isLoading}
            />

            {runTestMutation.isError && (
              <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                Error:{" "}
                {(runTestMutation.error as any)?.message || "Simulation failed"}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {executionResult ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-white">
                    Performance Results
                  </h3>
                  <button
                    onClick={handleExport}
                    className="text-cosmic-cyan hover:text-white text-sm font-medium transition-smooth border border-cosmic-cyan/30 px-4 py-1.5 rounded-full hover:bg-cosmic-cyan/10"
                  >
                    Export JSON
                  </button>
                </div>

                {executionResult.status === "completed" ? (
                  <BenchmarkDashboard
                    metrics={executionResult.metrics}
                    score={executionResult.qualityScore}
                    status={executionResult.status}
                  />
                ) : (
                  <div className="p-12 text-center rounded-xl border border-dashed border-gray-700 bg-gray-900/20">
                    <p className="text-gray-400">
                      Execution in progress or failed.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-cosmic-purple/20 bg-cosmic-purple/5">
                <div className="w-16 h-16 mb-6 rounded-full bg-cosmic-purple/10 flex items-center justify-center text-cosmic-purple">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  No Active Benchmarks
                </h3>
                <p className="text-gray-400 max-w-sm">
                  Configure a test case on the left and run simulation to see
                  resource usage, costs, and quality scoring.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
