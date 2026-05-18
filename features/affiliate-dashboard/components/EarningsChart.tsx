'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '@/components/Card';
import { EarningsHistory } from '../types';

interface EarningsChartProps {
  data: EarningsHistory[];
  isLoading: boolean;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-80 bg-cosmic-purple/20 rounded" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-cosmic-purple/60">No earnings data available</p>
      </Card>
    );
  }

  // Aggregate data by date and source
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    direct: item.source === 'direct' ? item.amount : 0,
    tier2: item.source === 'tier2' ? item.amount : 0,
    tier3: item.source === 'tier3' ? item.amount : 0,
    total: item.amount,
  }));

  // Merge by date
  const mergedData = chartData.reduce(
    (acc, curr) => {
      const existing = acc.find((item) => item.date === curr.date);
      if (existing) {
        return acc.map((item) =>
          item.date === curr.date
            ? {
                ...item,
                direct: item.direct + curr.direct,
                tier2: item.tier2 + curr.tier2,
                tier3: item.tier3 + curr.tier3,
                total: item.total + curr.total,
              }
            : item
        );
      }
      return [...acc, curr];
    },
    [] as typeof chartData
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart - Total Earnings Trend */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-white">Earnings Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
            <XAxis dataKey="date" stroke="rgba(139, 92, 246, 0.6)" />
            <YAxis stroke="rgba(139, 92, 246, 0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 14, 39, 0.9)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(139, 92, 246)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="rgb(139, 92, 246)"
              strokeWidth={2}
              dot={{ fill: 'rgb(139, 92, 246)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Earnings"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar Chart - Commission Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-white">Commission Sources</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
            <XAxis dataKey="date" stroke="rgba(139, 92, 246, 0.6)" />
            <YAxis stroke="rgba(139, 92, 246, 0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 14, 39, 0.9)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(139, 92, 246)' }}
            />
            <Legend />
            <Bar dataKey="direct" stackId="a" fill="rgb(59, 130, 246)" name="Direct" />
            <Bar dataKey="tier2" stackId="a" fill="rgb(139, 92, 246)" name="Tier 2" />
            <Bar dataKey="tier3" stackId="a" fill="rgb(6, 182, 212)" name="Tier 3" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default EarningsChart;
