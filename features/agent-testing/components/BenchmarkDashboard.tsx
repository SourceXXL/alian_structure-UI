"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ResourceMetrics } from "@/lib/db/types";
import QualityScore from "./QualityScore";

interface BenchmarkDashboardProps {
  metrics: ResourceMetrics;
  score: number;
  status: string;
  history?: any[];
}

export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({
  metrics,
  score,
  status,
}) => {
  const chartData = [
    { name: "CPU Inst.", value: metrics.cpuInstructions, color: "#9333ea" },
    { name: "RAM (KB)", value: metrics.ramBytes / 1024, color: "#3b82f6" },
    {
      name: "Ledger Read",
      value: metrics.ledgerReadBytes / 1024,
      color: "#06b6d4",
    },
    {
      name: "Ledger Write",
      value: metrics.ledgerWriteBytes / 1024,
      color: "#10b981",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 flex justify-center items-center">
          <QualityScore score={score} />
        </div>

        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-cosmic-purple/5 border border-cosmic-purple/20">
            <p className="text-gray-400 text-xs uppercase mb-1">Status</p>
            <p
              className={`text-xl font-bold ${status === "completed" ? "text-green-400" : "text-yellow-400"}`}
            >
              {status.toUpperCase()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-cosmic-blue/5 border border-cosmic-blue/20">
            <p className="text-gray-400 text-xs uppercase mb-1">
              Estimated Cost
            </p>
            <p className="text-xl font-bold text-cosmic-cyan">
              {metrics.costXlm} XLM
            </p>
          </div>
          <div className="p-4 rounded-xl bg-cosmic-cyan/5 border border-cosmic-cyan/20">
            <p className="text-gray-400 text-xs uppercase mb-1">
              CPU Instructions
            </p>
            <p className="text-xl font-bold text-white">
              {metrics.cpuInstructions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-cosmic-purple/30 nebula-bg shadow-xl">
        <h3 className="text-xl font-semibold mb-6 text-white">
          Resource Consumption Analysis
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1b4b",
                  border: "1px solid #4c1d95",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-cosmic-purple/30 bg-black/40">
          <h4 className="text-sm font-semibold uppercase text-gray-500 mb-4 tracking-widest">
            Efficiency Breakdown
          </h4>
          <ul className="space-y-3">
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Memory Usage</span>
              <span className="text-white">
                {(metrics.ramBytes / 1024).toFixed(2)} KB
              </span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Ledger Reads</span>
              <span className="text-white">
                {metrics.readCount} ({metrics.ledgerReadBytes} bytes)
              </span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Ledger Writes</span>
              <span className="text-white">
                {metrics.writeCount} ({metrics.ledgerWriteBytes} bytes)
              </span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl border border-cosmic-purple/30 bg-black/40">
          <h4 className="text-sm font-semibold uppercase text-gray-500 mb-4 tracking-widest">
            Performance Insights
          </h4>
          <div className="prose prose-sm prose-invert">
            {metrics.cpuInstructions > 1000000 ? (
              <p className="text-yellow-400/80">
                ⚠️ High CPU usage detected. Consider optimizing loop logic or
                heavy computations.
              </p>
            ) : (
              <p className="text-green-400/80">
                ✅ CPU efficiency is within optimal range for agent
                transactions.
              </p>
            )}
            {metrics.ramBytes > 500000 ? (
              <p className="text-yellow-400/80">
                ⚠️ RAM footprint is slightly elevated. Monitor for potential
                scale issues.
              </p>
            ) : (
              <p className="text-green-400/80">
                ✅ Memory footprint is lean and efficient.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkDashboard;
