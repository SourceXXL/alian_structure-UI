import * as React from 'react';
import { useEffect } from 'react';
import { BonusSummary } from './BonusSummary';
import { BonusBreakdown } from './BonusBreakdown';
import { BonusChart } from './BonusChart';
import { BonusNotifications } from './BonusNotifications';
import { useBonusStore } from '@/store/useBonusStore';

export const BonusDashboard: React.FC = () => {
  const { fetchBonuses, simulateRealTimeBonus } = useBonusStore();

  useEffect(() => {
    fetchBonuses();

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      simulateRealTimeBonus();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchBonuses, simulateRealTimeBonus]);

  return (
    <section className="mt-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold glow-text">Trading Bonuses</h2>
          <p className="text-gray-400">Real-time rewards for your cosmic activity</p>
        </div>
        <button 
          onClick={() => simulateRealTimeBonus()}
          className="px-4 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-sm hover:bg-cosmic-purple/40 transition-all"
        >
          Force Update (Demo)
        </button>
      </div>

      <BonusSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BonusChart />
        </div>
        <div>
          <BonusBreakdown />
        </div>
      </div>

      <BonusNotifications />
    </section>
  );
};
