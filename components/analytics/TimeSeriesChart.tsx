import React from 'react';
import Card from '@/components/Card';
import { AnalyticsDataset } from '@/lib/analytics/types';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TimeSeriesChart = React.memo(({ dataset }: { dataset: AnalyticsDataset }) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold glow-text mb-4">Historical Metrics</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataset.timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
            <XAxis dataKey="date" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#05070f',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="contractInvocations" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="xlmRevenue" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="successRate" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

TimeSeriesChart.displayName = 'TimeSeriesChart';

export default TimeSeriesChart;
