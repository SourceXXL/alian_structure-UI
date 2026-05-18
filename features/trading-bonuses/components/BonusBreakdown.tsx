import * as React from 'react';
import { useBonusStore } from '@/store/useBonusStore';
import { BonusType } from '@/lib/types';

const TYPE_COLORS: Record<BonusType, string> = {
  [BonusType.REFERRAL]: 'text-cosmic-purple',
  [BonusType.TRADING_VOLUME]: 'text-cosmic-cyan',
  [BonusType.STAKING]: 'text-green-400',
  [BonusType.LOYALTY]: 'text-yellow-400',
  [BonusType.QUEST]: 'text-pink-400',
};

const TYPE_BG: Record<BonusType, string> = {
  [BonusType.REFERRAL]: 'bg-cosmic-purple/10 border-cosmic-purple/20',
  [BonusType.TRADING_VOLUME]: 'bg-cosmic-cyan/10 border-cosmic-cyan/20',
  [BonusType.STAKING]: 'bg-green-400/10 border-green-400/20',
  [BonusType.LOYALTY]: 'bg-yellow-400/10 border-yellow-400/20',
  [BonusType.QUEST]: 'bg-pink-400/10 border-pink-400/20',
};

export const BonusBreakdown: React.FC = () => {
  const { bonuses } = useBonusStore();

  const breakdown = bonuses.reduce((acc: Record<string, { amount: number; count: number }>, bonus: any) => {
    if (!acc[bonus.type]) {
      acc[bonus.type] = { amount: 0, count: 0 };
    }
    acc[bonus.type].amount += parseFloat(bonus.amount);
    acc[bonus.type].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-cosmic-purple rounded-full" />
        Bonus Breakdown
      </h3>
      
      <div className="space-y-4">
        {Object.entries(breakdown).map(([type, stats]: [string, any]) => (
          <div key={type} className={`p-4 rounded-lg border ${TYPE_BG[type as BonusType]} transition-all hover:scale-[1.02]`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-bold ${TYPE_COLORS[type as BonusType]}`}>{type}</p>
                <p className="text-xs text-gray-500">{stats.count} transactions</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{stats.amount.toFixed(2)} XLM</p>
                <p className="text-xs text-gray-400">Total Reward</p>
              </div>
            </div>
          </div>
        ))}
        
        {Object.keys(breakdown).length === 0 && (
          <p className="text-gray-500 text-center py-8">No bonuses recorded yet.</p>
        )}
      </div>
    </div>
  );
};
