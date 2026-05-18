'use client';

import React, { useEffect, useState } from 'react';
import { quotaService, QuotaData } from '../services/quotaService';

export const QuotaVisualization: React.FC<{ userId: string }> = ({ userId }) => {
  const [data, setData] = useState<QuotaData | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    // Initial fetch
    quotaService.getQuotaData(userId).then(setData);

    // Live updates
    const unsubscribe = quotaService.subscribeToLiveUpdates((update) => {
      setData((prev) => (prev ? { ...prev, ...update } : null));
      setHistory((prev) => [...prev.slice(-19), update.currentRate ?? 0]);
    });

    return unsubscribe;
  }, [userId]);

  if (!data) return <div className="animate-pulse h-32 bg-white/5 rounded-xl border border-white/10" />;

  const usagePercent = (data.currentUsage / data.totalLimit) * 100;
  const ratePercent = (data.currentRate / data.rateLimit) * 100;

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      {/* Daily Quota Card */}
      <div className="p-6 rounded-2xl border border-cosmic-purple/20 bg-gradient-to-br from-[#0d122b] to-[#1a1c3d] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cosmic-purple/10 blur-3xl -z-10 group-hover:bg-cosmic-purple/20 transition-colors" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Daily API Quota</h3>
          <span className="text-xs px-2 py-1 bg-cosmic-purple/20 text-cosmic-purple rounded-md font-mono">
            {data.currentUsage.toLocaleString()} / {data.totalLimit.toLocaleString()}
          </span>
        </div>

        <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cosmic-purple to-cosmic-blue transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500">
          <span>{usagePercent.toFixed(1)}% CONSUMED</span>
          <span className="text-cosmic-cyan">{(100 - usagePercent).toFixed(1)}% REMAINING</span>
        </div>
      </div>

      {/* Real-time Rate Limit Card */}
      <div className="p-6 rounded-2xl border border-cosmic-cyan/20 bg-gradient-to-br from-[#0d122b] to-[#102a3d] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cosmic-cyan/10 blur-3xl -z-10 group-hover:bg-cosmic-cyan/20 transition-colors" />

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 font-mono">Real-time Rate</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
             <span className="text-xs text-white font-mono">{data.currentRate} req/s</span>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="flex items-end gap-1 h-12 mb-4">
          {history.length > 0 ? history.map((val, i) => (
             <div 
               key={i} 
               className="flex-1 rounded-t-sm transition-all duration-500 bg-cosmic-cyan/50 hover:bg-cosmic-cyan"
               style={{ height: `${(val / data.rateLimit) * 100}%` }}
             />
          )) : (
              <div className="w-full h-px bg-white/10 self-center" />
          )}
        </div>

        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
          <span>Limit: {data.rateLimit} req/s</span>
          <span className={ratePercent > 80 ? 'text-red-400 animate-pulse' : 'text-gray-400'}>
            Status: {ratePercent > 80 ? 'CRITICAL' : 'OPTIMAL'}
          </span>
        </div>
      </div>
    </div>
  );
};
