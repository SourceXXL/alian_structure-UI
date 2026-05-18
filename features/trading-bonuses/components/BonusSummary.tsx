import * as React from 'react';
import { useBonusStore } from '@/store/useBonusStore';

export const BonusSummary: React.FC = () => {
  const { totalEarned, totalPending, totalProjected } = useBonusStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="p-6 rounded-xl border border-cosmic-purple/30 bg-cosmic-darker/50 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Total Earned</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold glow-text">{totalEarned}</h3>
          <span className="text-cosmic-purple font-semibold">XLM</span>
        </div>
        <div className="mt-4 h-1 w-full bg-cosmic-purple/10 rounded-full overflow-hidden">
          <div className="h-full bg-cosmic-purple animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>

      <div className="p-6 rounded-xl border border-cosmic-cyan/30 bg-cosmic-darker/50 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Pending Rewards</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold text-cosmic-cyan">{totalPending}</h3>
          <span className="text-cosmic-cyan/70 font-semibold">XLM</span>
        </div>
        <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
          <span className="w-2 h-2 bg-cosmic-cyan rounded-full animate-ping" />
          Processing next cycle
        </p>
      </div>

      <div className="p-6 rounded-xl border border-cosmic-blue/30 bg-cosmic-darker/50 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Projected (EOY)</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold text-cosmic-blue">{totalProjected}</h3>
          <span className="text-cosmic-blue/70 font-semibold">XLM</span>
        </div>
        <p className="text-xs text-gray-500 mt-4 italic">Based on current trading velocity</p>
      </div>
    </div>
  );
};
