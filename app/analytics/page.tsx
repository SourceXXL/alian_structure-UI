"use client";

import { useQuery } from "@tanstack/react-query";
import MetricsOverview from "@/components/analytics/MetricsOverview";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import { AnalyticsDataset } from "@/lib/analytics/types";
import { useState } from "react";
import Button from "@/components/Button";
import { analyticsToCsv } from "@/lib/analytics/csv";

export default function AnalyticsDashboard() {
  const [range, setRange] = useState("7d");

  const { data, isLoading, isError } = useQuery<AnalyticsDataset>(
    ["analytics", range],
    async () => {
      const response = await fetch(
        `/api/analytics?range=${range}&ownedAgentIds=GABC123,GDEF456&marketplaceAgentIds=GHI789`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    },
    {
      staleTime: 30_000,
    }
  );

  const handleExport = () => {
    if (data) {
      const csv = analyticsToCsv(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${range}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <main className="pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-5xl font-bold glow-text">Analytics Dashboard</h1>
        <p className="text-gray-300 text-lg">
          View real-time and historical performance metrics for your agents.
        </p>

        <div className="flex gap-4">
          {(["7d", "30d", "90d", "1y"] as const).map((r) => (
            <Button
              key={r}
              variant={range === r ? "primary" : "outline"}
              onClick={() => setRange(r)}
            >
              {r.toUpperCase()}
            </Button>
          ))}
          <Button onClick={handleExport} variant="secondary">
            Export CSV
          </Button>
        </div>

        {isLoading && <p>Loading...</p>}
        {isError && <p>Failed to load analytics data.</p>}
        {data && (
          <>
            <MetricsOverview dataset={data} />
            <TimeSeriesChart dataset={data} />
          </>
        )}
      </div>
    </main>
  );
}