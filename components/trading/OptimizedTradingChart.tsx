"use client";

import React, { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ComposedChart,
  Bar,
} from "recharts";

export type IndicatorOptions = { enabled?: boolean; period?: number } & Record<string, any>;
type IndicatorConfig = IndicatorOptions;

export type TradingDataPoint = {
  timestamp?: number;
  time?: string | number;
  date?: string | number;
  price?: number;
  open?: number;
  close?: number;
  high?: number;
  low?: number;
  volume?: number;
  [key: string]: any;
};

interface Props {
  data?: TradingDataPoint[];
  width?: number | string;
  height?: number | string;
  showVolume?: boolean;
  showCandlestick?: boolean;
  indicators?: Record<string, IndicatorConfig>;
  chartColors?: Record<string, string>;
  enablePerformanceMonitoring?: boolean;
  onPerformanceUpdate?: (...args: any[]) => void;
  maxDataPoints?: number;
  debounceMs?: number;
}

const defaultColors = {
  price: "#60a5fa",
  volume: "#93c5fd",
  positive: "#10b981",
  negative: "#ef4444",
  grid: "#374151",
  text: "#e5e7eb",
};

const OptimizedTradingChart = React.memo(function OptimizedTradingChart({
  data = [],
  width = "100%",
  height = 300,
  showVolume = false,
  showCandlestick = false,
  indicators = {},
  chartColors = defaultColors,
}: Props) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((d) => ({ ...d, time: d.timestamp ?? d.time ?? d.date }));
  }, [data]);

  const ChartComponents = useMemo(() => {
    const components: React.ReactNode[] = [];

    components.push(
      <Line
        key="price"
        type="monotone"
        dataKey="price"
        stroke={chartColors.price}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
        name="Price"
      />
    );

    if (showVolume) {
      components.push(
        <Bar
          key="volume"
          dataKey="volume"
          fill={chartColors.volume}
          opacity={0.3}
          isAnimationActive={false}
          name="Volume"
        />
      );
    }

    // Simple indicator support (only SMA/EMA/basics) to avoid heavy typing here
    if ((indicators.sma as IndicatorConfig)?.enabled) {
      components.push(
        <Line
          key="sma"
          type="monotone"
          dataKey="sma"
          stroke="#fbbf24"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name={`SMA(${(indicators.sma as any).period ?? "n"})`}
        />
      );
    }

    return components;
  }, [showVolume, indicators, chartColors]);

  if (!chartData || chartData.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: chartColors.text,
          fontSize: "14px",
        }}
      >
        No trading data available
      </div>
    );
  }


  return (
    <div style={{ position: "relative" }}>
      <div style={{ width, height }}>
        <ResponsiveContainer>
          {showCandlestick ? (
            <ComposedChart data={chartData} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="time" tick={{ fill: chartColors.text, fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis yAxisId="price" orientation="right" tick={{ fill: chartColors.text, fontSize: 11 }} />
              {showVolume && <YAxis yAxisId="volume" orientation="left" tick={{ fill: chartColors.text, fontSize: 11 }} hide />}
              <Tooltip />
              <Legend />
              {ChartComponents.map((component) =>
                React.isValidElement(component)
                  ? React.cloneElement(component, {
                      yAxisId: (component.props as any).dataKey === "volume" ? "volume" : "price",
                    })
                  : component
              )}
            </ComposedChart>
          ) : (
            <LineChart data={chartData} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="time" tick={{ fill: chartColors.text, fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {ChartComponents}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
});

OptimizedTradingChart.displayName = "OptimizedTradingChart";

export default OptimizedTradingChart;
