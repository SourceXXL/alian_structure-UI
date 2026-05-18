'use client';

import React from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { MetricsSeries } from '@/lib/metrics/types';

const formatTs = (tsSeconds: number) => {
  const d = new Date(tsSeconds * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const colorForIndex = (i: number) => {
  const palette = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];
  return palette[i % palette.length];
};

type ChartPoint = {
  ts: number;
  label: string;
  [key: string]: number | string | null;
};

function buildChartData(series: MetricsSeries[]): { data: ChartPoint[]; keys: string[] } {
  const keys = series.map((s) => s.seriesName);
  const byTs = new Map<number, ChartPoint>();
  for (const s of series) {
    for (const p of s.points) {
      const existing: ChartPoint = byTs.get(p.ts) || { ts: p.ts, label: formatTs(p.ts) };
      existing[s.seriesName] = p.value;
      byTs.set(p.ts, existing);
    }
  }
  const data = Array.from(byTs.values()).sort((a, b) => a.ts - b.ts);
  return { data, keys };
}

const MetricLineChart = React.memo(({
  series,
  height = 280,
}: {
  series: MetricsSeries[];
  height?: number;
}) => {
  const { data, keys } = buildChartData(series);

  if (series.length === 0) {
    return <div className="text-gray-400">No data.</div>;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(139,92,246,0.15)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(2,6,23,0.9)',
              border: '1px solid rgba(139,92,246,0.35)',
              color: '#fff',
            }}
          />
          {keys.length <= 6 ? <Legend /> : null}
          {keys.map((k, idx) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              dot={false}
              strokeWidth={2}
              stroke={colorForIndex(idx)}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MetricLineChart.displayName = 'MetricLineChart';

export default MetricLineChart;

