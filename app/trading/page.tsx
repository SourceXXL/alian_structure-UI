'use client';

import React, { useState, useMemo } from 'react';
import OptimizedTradingChart, { TradingDataPoint, IndicatorOptions } from '@/components/trading/OptimizedTradingChart';

// Generate sample trading data
const generateSampleData = (): TradingDataPoint[] => {
  const data: TradingDataPoint[] = [];
  let basePrice = 100;
  const now = Date.now();

  for (let i = 0; i < 200; i++) {
    const timestamp = now - (200 - i) * 60000; // 1-minute intervals
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility * basePrice;
    basePrice = Math.max(1, basePrice + change);

    const volume = Math.floor(Math.random() * 1000000) + 10000;
    const high = basePrice + Math.random() * 0.01 * basePrice;
    const low = basePrice - Math.random() * 0.01 * basePrice;
    const open = basePrice - Math.random() * 0.005 * basePrice;
    const close = basePrice + Math.random() * 0.005 * basePrice;

    data.push({
      timestamp,
      price: basePrice,
      volume,
      high,
      low,
      open,
      close,
    });
  }

  return data;
};

export default function TradingPage() {
  const [indicators, setIndicators] = useState<IndicatorOptions>({
    sma: { period: 20, enabled: true },
    ema: { period: 20, enabled: true },
    rsi: { period: 14, enabled: true },
    macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, enabled: true },
    bollingerBands: { period: 20, standardDeviations: 2, enabled: true },
    stochastic: { kPeriod: 14, dPeriod: 3, enabled: true },
    williamsR: { period: 14, enabled: true },
    cci: { period: 20, enabled: true },
  });

  const sampleData = useMemo(() => generateSampleData(), []);

  const toggleIndicator = (key: keyof IndicatorOptions) => {
    setIndicators(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key]?.enabled,
      },
    }));
  };

  const updateIndicatorPeriod = (key: keyof IndicatorOptions, periodKey: string, value: number) => {
    setIndicators(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [periodKey]: value,
      },
    }));
  };

  return (
    <main className="pt-20 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 glow-text">Advanced Trading Indicators</h1>
        <p className="text-gray-300 text-lg mb-8">
          Professional-grade technical analysis indicators for informed trading decisions
        </p>

        {/* Indicator Controls */}
        <div className="mb-8 p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-white">Indicator Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Indicators */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cosmic-cyan">Moving Averages</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.sma?.enabled || false}
                    onChange={() => toggleIndicator('sma')}
                    className="rounded"
                  />
                  <span>SMA</span>
                  <input
                    type="number"
                    value={indicators.sma?.period || 20}
                    onChange={(e) => updateIndicatorPeriod('sma', 'period', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 bg-cosmic-darker border border-white/20 rounded text-sm"
                    min="1"
                  />
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.ema?.enabled || false}
                    onChange={() => toggleIndicator('ema')}
                    className="rounded"
                  />
                  <span>EMA</span>
                  <input
                    type="number"
                    value={indicators.ema?.period || 20}
                    onChange={(e) => updateIndicatorPeriod('ema', 'period', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 bg-cosmic-darker border border-white/20 rounded text-sm"
                    min="1"
                  />
                </label>
              </div>
            </div>

            {/* Oscillators */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cosmic-cyan">Oscillators</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.rsi?.enabled || false}
                    onChange={() => toggleIndicator('rsi')}
                    className="rounded"
                  />
                  <span>RSI</span>
                  <input
                    type="number"
                    value={indicators.rsi?.period || 14}
                    onChange={(e) => updateIndicatorPeriod('rsi', 'period', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 bg-cosmic-darker border border-white/20 rounded text-sm"
                    min="1"
                  />
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.stochastic?.enabled || false}
                    onChange={() => toggleIndicator('stochastic')}
                    className="rounded"
                  />
                  <span>Stochastic</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.williamsR?.enabled || false}
                    onChange={() => toggleIndicator('williamsR')}
                    className="rounded"
                  />
                  <span>Williams %R</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.cci?.enabled || false}
                    onChange={() => toggleIndicator('cci')}
                    className="rounded"
                  />
                  <span>CCI</span>
                </label>
              </div>
            </div>

            {/* Advanced Indicators */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cosmic-cyan">Advanced</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.macd?.enabled || false}
                    onChange={() => toggleIndicator('macd')}
                    className="rounded"
                  />
                  <span>MACD</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={indicators.bollingerBands?.enabled || false}
                    onChange={() => toggleIndicator('bollingerBands')}
                    className="rounded"
                  />
                  <span>Bollinger Bands</span>
                </label>
              </div>
            </div>

            {/* Chart Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cosmic-cyan">Chart Options</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIndicators({
                    sma: { period: 20, enabled: true },
                    ema: { period: 20, enabled: true },
                    rsi: { period: 14, enabled: true },
                    macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, enabled: true },
                    bollingerBands: { period: 20, standardDeviations: 2, enabled: true },
                    stochastic: { kPeriod: 14, dPeriod: 3, enabled: true },
                    williamsR: { period: 14, enabled: true },
                    cci: { period: 20, enabled: true },
                  })}
                  className="w-full px-4 py-2 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-lg text-sm hover:bg-cosmic-purple/40 transition-all"
                >
                  Enable All
                </button>
                <button
                  onClick={() => setIndicators({})}
                  className="w-full px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm hover:bg-red-500/40 transition-all"
                >
                  Disable All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Chart */}
        <div className="p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-white">Price Chart with Advanced Indicators</h2>
          <OptimizedTradingChart
            data={sampleData}
            height={600}
            indicators={indicators}
            showVolume={true}
            enablePerformanceMonitoring={true}
          />
        </div>

        {/* Indicator Explanations */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cosmic-cyan">Stochastic Oscillator</h3>
            <p className="text-gray-300 text-sm">
              Momentum indicator comparing closing price to price range over a period.
              %K shows current momentum, %D is the signal line (SMA of %K).
              Values above 80 indicate overbought, below 20 indicate oversold.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cosmic-cyan">Williams %R</h3>
            <p className="text-gray-300 text-sm">
              Momentum indicator similar to Stochastic but uses different calculation.
              Ranges from -100 to 0. Values above -20 indicate overbought,
              below -80 indicate oversold conditions.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cosmic-cyan">Commodity Channel Index (CCI)</h3>
            <p className="text-gray-300 text-sm">
              Versatile indicator measuring deviation from mean price.
              Values above +100 indicate overbought, below -100 indicate oversold.
              Used for identifying cyclical trends and potential reversal points.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-cosmic-darker/30 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 text-cosmic-cyan">Performance Optimized</h3>
            <p className="text-gray-300 text-sm">
              All indicators are calculated efficiently with memoization and
              debounced updates. Large datasets are automatically downsampled
              for smooth rendering. Interactive tooltips provide detailed values
              for all active indicators.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}