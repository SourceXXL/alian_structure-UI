'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '@/components/Card';
import { CommissionBreakdown as CommissionBreakdownType } from '../types';

interface CommissionBreakdownProps {
  data: CommissionBreakdownType[];
  isLoading: boolean;
}

const COLORS = {
  direct: 'rgb(59, 130, 246)',
  tier2: 'rgb(139, 92, 246)',
  tier3: 'rgb(6, 182, 212)',
};

export const CommissionBreakdown: React.FC<CommissionBreakdownProps> = ({ data, isLoading }) => {
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
        <p className="text-cosmic-purple/60">No commission data available</p>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: parseFloat(item.amount),
    percentage: item.percentage,
    count: item.count,
  }));

  const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-white">Commission Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8b5cf6"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 14, 39, 0.9)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(139, 92, 246)' }}
              formatter={(value) => `${value.toFixed(2)} XLM`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Breakdown Details */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-white">Breakdown Details</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="pb-4 border-b border-cosmic-purple/10 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[item.type as keyof typeof COLORS] }}
                  />
                  <span className="font-semibold text-white capitalize">{item.type} Commission</span>
                </div>
                <span className="text-cosmic-blue font-bold">{item.amount} XLM</span>
              </div>

              <div className="flex items-center justify-between text-sm text-cosmic-purple/60">
                <span>{item.count} referrals</span>
                <span>{item.percentage.toFixed(1)}% of total</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-2 bg-cosmic-purple/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: COLORS[item.type as keyof typeof COLORS],
                  }}
                />
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-4 border-t border-cosmic-purple/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Total Commissions</span>
              <span className="text-lg font-bold text-cosmic-nebula">{totalAmount.toFixed(2)} XLM</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommissionBreakdown;
