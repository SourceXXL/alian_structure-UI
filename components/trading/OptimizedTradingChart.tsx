'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from 'recharts';
import { useDebounce } from 'use-debounce';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { calculateIndicators, IndicatorData } from '@/lib/trading/indicators';

export interface TradingDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface IndicatorOptions {
  sma?: { period: number; enabled: boolean };
  ema?: { period: number; enabled: boolean };
  rsi?: { period: number; enabled: boolean };
  macd?: { fastPeriod: number; slowPeriod: number; signalPeriod: number; enabled: boolean };
  bollingerBands?: { period: number; standardDeviations: number; enabled: boolean };
  stochastic?: { kPeriod: number; dPeriod: number; enabled: boolean };
  williamsR?: { period: number; enabled: boolean };
  cci?: { period: number; enabled: boolean };
}

export interface TradingChartProps {
  data: TradingDataPoint[];
  height?: number;
  width?: number;
  showVolume?: boolean;
  showCandlestick?: boolean;
  debounceMs?: number;
  maxDataPoints?: number;
  enablePerformanceMonitoring?: boolean;
  indicators?: IndicatorOptions;
  onPerformanceUpdate?: (metrics: { fps: number; renderTime: number; memoryUsage?: number }) => void;
}

interface ChartDataPoint extends TradingDataPoint, IndicatorData {
  time: string;
}

// Memoized formatters to prevent unnecessary recalculations
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(price);
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toFixed(0);
};

// Memoized color palette
const chartColors = {
  price: '#8b5cf6',
  volume: '#06b6d4',
  grid: 'rgba(139, 92, 246, 0.15)',
  text: '#cbd5e1',
  background: 'rgba(2, 6, 23, 0.9)',
  border: 'rgba(139, 92, 246, 0.35)',
  positive: '#22c55e',
  negative: '#ef4444',
};

// Optimized data transformation with memoization
const transformChartData = (data: TradingDataPoint[], maxPoints?: number, indicators?: IndicatorOptions): ChartDataPoint[] => {
  if (!data || data.length === 0) return [];

  let processedData = data;
  
  // Downsample data if too many points
  if (maxPoints && data.length > maxPoints) {
    const step = Math.ceil(data.length / maxPoints);
    processedData = data.filter((_, index) => index % step === 0);
  }

  // Calculate indicators if enabled
  const dataWithIndicators = indicators ? calculateIndicators(processedData, indicators) : processedData;

  return dataWithIndicators.map(point => ({
    time: formatTimestamp(point.timestamp),
    price: point.price,
    volume: point.volume,
    high: point.high,
    low: point.low,
    open: point.open,
    close: point.close,
    sma: point.sma,
    ema: point.ema,
    rsi: point.rsi,
    macd: point.macd,
    bollingerBands: point.bollingerBands,
    stochastic: point.stochastic,
    williamsR: point.williamsR,
    cci: point.cci,
  }));
};

// Custom tooltip component with memoization
const CustomTooltip = React.memo(({ active, payload, label, indicators }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: chartColors.background,
        border: `1px solid ${chartColors.border}`,
        borderRadius: '8px',
        padding: '12px',
        color: '#fff',
        fontSize: '12px',
        maxWidth: '250px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</div>
      {payload.map((entry: any, index: number) => {
        // Handle nested indicator data
        let displayValue = entry.value;
        let displayName = entry.name;

        if (entry.dataKey === 'bollingerBands.upper' && entry.payload.bollingerBands) {
          displayValue = entry.payload.bollingerBands.upper;
          displayName = 'BB Upper';
        } else if (entry.dataKey === 'bollingerBands.middle' && entry.payload.bollingerBands) {
          displayValue = entry.payload.bollingerBands.middle;
          displayName = 'BB Middle';
        } else if (entry.dataKey === 'bollingerBands.lower' && entry.payload.bollingerBands) {
          displayValue = entry.payload.bollingerBands.lower;
          displayName = 'BB Lower';
        } else if (entry.dataKey === 'macd.macd' && entry.payload.macd) {
          displayValue = entry.payload.macd.macd;
          displayName = 'MACD';
        } else if (entry.dataKey === 'macd.signal' && entry.payload.macd) {
          displayValue = entry.payload.macd.signal;
          displayName = 'MACD Signal';
        } else if (entry.dataKey === 'macd.histogram' && entry.payload.macd) {
          displayValue = entry.payload.macd.histogram;
          displayName = 'MACD Histogram';
        } else if (entry.dataKey === 'stochastic.k' && entry.payload.stochastic) {
          displayValue = entry.payload.stochastic.k;
          displayName = 'Stochastic %K';
        } else if (entry.dataKey === 'stochastic.d' && entry.payload.stochastic) {
          displayValue = entry.payload.stochastic.d;
          displayName = 'Stochastic %D';
        } else if (entry.dataKey === 'williamsR') {
          displayValue = entry.payload.williamsR;
          displayName = 'Williams %R';
        } else if (entry.dataKey === 'cci') {
          displayValue = entry.payload.cci;
          displayName = 'CCI';
        }

        // Format values based on type
        let formattedValue = displayValue;
        if (typeof displayValue === 'number') {
          if (displayName.includes('Volume')) {
            formattedValue = formatVolume(displayValue);
          } else if (displayName.includes('RSI') || displayName.includes('MACD') || displayName.includes('Stochastic') || displayName.includes('Williams') || displayName.includes('CCI')) {
            formattedValue = displayValue.toFixed(2);
          } else if (!displayName.includes('Volume') && !displayName.includes('RSI') && !displayName.includes('MACD') && !displayName.includes('Stochastic') && !displayName.includes('Williams') && !displayName.includes('CCI')) {
            formattedValue = formatPrice(displayValue);
          } else {
            formattedValue = displayValue.toFixed(4);
          }
        }

        return (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
            <span style={{ color: entry.color }}>{displayName}:</span>
            <span style={{ fontWeight: 'bold' }}>{formattedValue}</span>
          </div>
        );
      })}
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

const OptimizedTradingChart: React.FC<TradingChartProps> = React.memo(({
  data,
  height = 400,
  width = '100%',
  showVolume = true,
  showCandlestick = false,
  debounceMs = 300,
  maxDataPoints = 1000,
  enablePerformanceMonitoring = false,
  indicators = {},
  onPerformanceUpdate,
}) => {
  const [debouncedData] = useDebounce(data, debounceMs);
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    const startTime = performance.now();
    const result = transformChartData(debouncedData, maxDataPoints, indicators);
    const endTime = performance.now();
    
    // Track render performance
    renderCountRef.current++;
    if (renderCountRef.current % 10 === 0) {
      const avgRenderTime = (endTime - lastRenderTimeRef.current) / 10;
      lastRenderTimeRef.current = endTime;
      console.log(`Chart render #${renderCountRef.current}: ${(endTime - startTime).toFixed(2)}ms (avg: ${avgRenderTime.toFixed(2)}ms)`);
    }
    
    return result;
  }, [debouncedData, maxDataPoints, indicators, transformChartData]);

  // Early return for empty data
  if (!chartData || chartData.length === 0) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: chartColors.text,
          fontSize: '14px'
        }}
      >
        No trading data available
      </div>
    );
  }

  // Memoized chart components
  const ChartComponents = useMemo(() => {
    const components = [];

    // Price line
    components.push(
      <Line
        key="price"
        type="monotone"
        dataKey="price"
        stroke={chartColors.price}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
        name="Price"
      />
    );

    // Volume bars (if enabled)
    if (showVolume) {
      components.push(
        <Bar
          key="volume"
          dataKey="volume"
          fill={chartColors.volume}
          opacity={0.3}
          isAnimationActive={false}
          name="Volume"
        />
      );
    }

    // Candlestick representation (if enabled)
    if (showCandlestick) {
      components.push(
        <Line
          key="high"
          type="monotone"
          dataKey="high"
          stroke={chartColors.positive}
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name="High"
        />,
        <Line
          key="low"
          type="monotone"
          dataKey="low"
          stroke={chartColors.negative}
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name="Low"
        />
      );
    }

    // Technical Indicators
    if (indicators.sma?.enabled) {
      components.push(
        <Line
          key="sma"
          type="monotone"
          dataKey="sma"
          stroke="#fbbf24"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
          name={`SMA(${indicators.sma.period})`}
        />
      );
    }

    if (indicators.ema?.enabled) {
      components.push(
        <Line
          key="ema"
          type="monotone"
          dataKey="ema"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="10 5"
          dot={false}
          isAnimationActive={false}
          name={`EMA(${indicators.ema.period})`}
        />
      );
    }

    if (indicators.bollingerBands?.enabled) {
      components.push(
        <Line
          key="bb-upper"
          type="monotone"
          dataKey="bollingerBands.upper"
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="2 2"
          dot={false}
          isAnimationActive={false}
          name="BB Upper"
        />,
        <Line
          key="bb-middle"
          type="monotone"
          dataKey="bollingerBands.middle"
          stroke="#10b981"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name="BB Middle"
        />,
        <Line
          key="bb-lower"
          type="monotone"
          dataKey="bollingerBands.lower"
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="2 2"
          dot={false}
          isAnimationActive={false}
          name="BB Lower"
        />
      );
    }

    if (indicators.rsi?.enabled) {
      components.push(
        <Line
          key="rsi"
          type="monotone"
          dataKey="rsi"
          stroke="#ef4444"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name={`RSI(${indicators.rsi.period})`}
          yAxisId="rsi"
        />
      );
    }

    if (indicators.macd?.enabled) {
      components.push(
        <Line
          key="macd"
          type="monotone"
          dataKey="macd.macd"
          stroke="#8b5cf6"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name="MACD"
          yAxisId="macd"
        />,
        <Line
          key="macd-signal"
          type="monotone"
          dataKey="macd.signal"
          stroke="#f59e0b"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name="MACD Signal"
          yAxisId="macd"
        />
      );
    }

    if (indicators.stochastic?.enabled) {
      components.push(
        <Line
          key="stochastic-k"
          type="monotone"
          dataKey="stochastic.k"
          stroke="#06b6d4"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name={`Stochastic %K(${indicators.stochastic.kPeriod})`}
          yAxisId="stochastic"
        />,
        <Line
          key="stochastic-d"
          type="monotone"
          dataKey="stochastic.d"
          stroke="#0891b2"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
          name={`Stochastic %D(${indicators.stochastic.dPeriod})`}
          yAxisId="stochastic"
        />
      );
    }

    if (indicators.williamsR?.enabled) {
      components.push(
        <Line
          key="williams-r"
          type="monotone"
          dataKey="williamsR"
          stroke="#dc2626"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name={`Williams %R(${indicators.williamsR.period})`}
          yAxisId="williams"
        />
      );
    }

    if (indicators.cci?.enabled) {
      components.push(
        <Line
          key="cci"
          type="monotone"
          dataKey="cci"
          stroke="#7c3aed"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          name={`CCI(${indicators.cci.period})`}
          yAxisId="cci"
        />
      );
    }

    return components;
  }, [showVolume, showCandlestick, indicators]);

  return (
    <div style={{ position: 'relative' }}>
      {enablePerformanceMonitoring && (
        <PerformanceMonitor 
          onPerformanceUpdate={onPerformanceUpdate}
          targetFPS={60}
        />
      )}
      
      <div style={{ width, height }}>
        <ResponsiveContainer>
          {showCandlestick ? (
            <ComposedChart
              data={chartData}
              margin={{ left: 6, right: 6, top: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: chartColors.text, fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="price"
                orientation="right"
                tick={{ fill: chartColors.text, fontSize: 11 }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              {showVolume && (
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  hide
                />
              )}
              {indicators.rsi?.enabled && (
                <YAxis 
                  yAxisId="rsi"
                  orientation="right"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  domain={[0, 100]}
                  hide
                />
              )}
              {indicators.macd?.enabled && (
                <YAxis 
                  yAxisId="macd"
                  orientation="right"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  hide
                />
              )}
              {indicators.stochastic?.enabled && (
                <YAxis 
                  yAxisId="stochastic"
                  orientation="right"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  domain={[0, 100]}
                  hide
                />
              )}
              {indicators.williamsR?.enabled && (
                <YAxis 
                  yAxisId="williams"
                  orientation="right"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  domain={[-100, 0]}
                  hide
                />
              )}
              {indicators.cci?.enabled && (
                <YAxis 
                  yAxisId="cci"
                  orientation="right"
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  domain={[-200, 200]}
                  hide
                />
              )}
              <Tooltip content={<CustomTooltip indicators={indicators} />} />
              <Legend />
              {ChartComponents.map((component, index) => 
                React.cloneElement(component, {
                  yAxisId: component.props.dataKey === 'volume' ? 'volume' : 'price'
                })
              )}
            </ComposedChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ left: 6, right: 6, top: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: chartColors.text, fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fill: chartColors.text, fontSize: 11 }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              <Tooltip content={<CustomTooltip indicators={indicators} />} />
              <Legend />
              {ChartComponents}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
});

OptimizedTradingChart.displayName = 'OptimizedTradingChart';

export default OptimizedTradingChart;
