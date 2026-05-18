'use client';

import React from 'react';
import Card from '@/components/Card';
import { AffiliateStats as AffiliateStatsType } from '../types';

interface AffiliateStatsProps {
  stats: AffiliateStatsType | null;
  isLoading: boolean;
}

export const AffiliateStats: React.FC<AffiliateStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-20 bg-cosmic-purple/20 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="text-center py-8">
        <p className="text-cosmic-purple/60">No affiliate data available</p>
      </Card>
    );
  }

  const statItems = [
    {
      label: 'Total Referrals',
      value: stats.totalReferrals.toString(),
      subtext: `${stats.activeReferrals} active`,
      color: 'from-cosmic-blue to-cosmic-cyan',
    },
    {
      label: 'Total Earnings',
      value: `${stats.totalEarnings} XLM`,
      subtext: 'All time',
      color: 'from-cosmic-purple to-cosmic-nebula',
    },
    {
      label: 'Pending Earnings',
      value: `${stats.pendingEarnings} XLM`,
      subtext: 'Awaiting payout',
      color: 'from-cosmic-nebula to-cosmic-purple',
    },
    {
      label: 'Total Payouts',
      value: `${stats.totalPayouts} XLM`,
      subtext: 'Withdrawn',
      color: 'from-cosmic-cyan to-cosmic-blue',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      subtext: 'Referral to active',
      color: 'from-cosmic-purple to-cosmic-blue',
    },
    {
      label: 'Active Status',
      value: 'Active',
      subtext: 'Program enrolled',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
          <div className="relative z-10">
            <p className="text-sm text-cosmic-purple/60 mb-2">{item.label}</p>
            <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
            <p className="text-xs text-cosmic-purple/40">{item.subtext}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AffiliateStats;
