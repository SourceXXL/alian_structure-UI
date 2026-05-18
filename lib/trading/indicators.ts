/**
 * Technical Analysis Indicators for Trading Charts
 * Performance-optimized calculations for common trading indicators
 */

export interface IndicatorData {
  sma?: number;
  ema?: number;
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic?: {
    k: number;
    d: number;
  };
  williamsR?: number;
  cci?: number;
}

export interface TradingDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const result: number[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }

  return result;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(firstSMA);

  // Calculate subsequent EMAs
  for (let i = period; i < data.length; i++) {
    const ema = (data[i] - result[result.length - 1]) * multiplier + result[result.length - 1];
    result.push(ema);
  }

  return result;
}

/**
 * Calculate Relative Strength Index
 */
export function calculateRSI(data: number[], period: number = 14): number[] {
  if (data.length < period + 1) return [];

  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  const result: number[] = [];

  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  if (data.length < slowPeriod) return { macd: [], signal: [], histogram: [] };

  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // MACD line = Fast EMA - Slow EMA
  const macd: number[] = [];
  for (let i = 0; i < slowEMA.length; i++) {
    macd.push(fastEMA[i + (slowPeriod - fastPeriod)] - slowEMA[i]);
  }

  // Signal line = EMA of MACD
  const signal = calculateEMA(macd, signalPeriod);

  // Histogram = MACD - Signal
  const histogram: number[] = [];
  for (let i = 0; i < signal.length; i++) {
    histogram.push(macd[i + (signalPeriod - 1)] - signal[i]);
  }

  return { macd: macd.slice(signalPeriod - 1), signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  standardDeviations: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  if (data.length < period) return { upper: [], middle: [], lower: [] };

  const sma = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    const variance = slice.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    upper.push(mean + (standardDeviations * stdDev));
    lower.push(mean - (standardDeviations * stdDev));
  }

  return { upper, middle: sma, lower };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  if (highs.length < kPeriod || lows.length < kPeriod || closes.length < kPeriod) {
    return { k: [], d: [] };
  }

  const kValues: number[] = [];

  for (let i = kPeriod - 1; i < closes.length; i++) {
    const highMax = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
    const lowMin = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
    const currentClose = closes[i];

    const k = ((currentClose - lowMin) / (highMax - lowMin)) * 100;
    kValues.push(k);
  }

  // Calculate D (SMA of K)
  const dValues = calculateSMA(kValues, dPeriod);

  return { k: kValues, d: dValues };
}

/**
 * Calculate Williams %R
 */
export function calculateWilliamsR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number[] {
  if (highs.length < period || lows.length < period || closes.length < period) {
    return [];
  }

  const result: number[] = [];

  for (let i = period - 1; i < closes.length; i++) {
    const highMax = Math.max(...highs.slice(i - period + 1, i + 1));
    const lowMin = Math.min(...lows.slice(i - period + 1, i + 1));
    const currentClose = closes[i];

    const williamsR = ((highMax - currentClose) / (highMax - lowMin)) * -100;
    result.push(williamsR);
  }

  return result;
}

/**
 * Calculate Commodity Channel Index (CCI)
 */
export function calculateCCI(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 20
): number[] {
  if (highs.length < period || lows.length < period || closes.length < period) {
    return [];
  }

  const result: number[] = [];
  const typicalPrices: number[] = [];

  // Calculate Typical Price for each period
  for (let i = 0; i < closes.length; i++) {
    typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
  }

  for (let i = period - 1; i < typicalPrices.length; i++) {
    const slice = typicalPrices.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const meanDeviation = slice.reduce((sum, value) => sum + Math.abs(value - sma), 0) / period;

    if (meanDeviation === 0) {
      result.push(0);
    } else {
      const cci = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
      result.push(cci);
    }
  }

  return result;
}

/**
 * Calculate all indicators for trading data
 */
export function calculateIndicators(
  data: TradingDataPoint[],
  options: {
    sma?: { period: number; enabled: boolean };
    ema?: { period: number; enabled: boolean };
    rsi?: { period: number; enabled: boolean };
    macd?: { fastPeriod: number; slowPeriod: number; signalPeriod: number; enabled: boolean };
    bollingerBands?: { period: number; standardDeviations: number; enabled: boolean };
    stochastic?: { kPeriod: number; dPeriod: number; enabled: boolean };
    williamsR?: { period: number; enabled: boolean };
    cci?: { period: number; enabled: boolean };
  } = {}
): (TradingDataPoint & IndicatorData)[] {
  if (!data || data.length === 0) return [];

  const prices = data.map(d => d.close);

  const result: (TradingDataPoint & IndicatorData)[] = data.map(d => ({ ...d }));

  // SMA
  if (options.sma?.enabled) {
    const smaValues = calculateSMA(prices, options.sma.period);
    smaValues.forEach((value, index) => {
      const dataIndex = index + options.sma!.period - 1;
      if (result[dataIndex]) {
        result[dataIndex].sma = value;
      }
    });
  }

  // EMA
  if (options.ema?.enabled) {
    const emaValues = calculateEMA(prices, options.ema.period);
    emaValues.forEach((value, index) => {
      const dataIndex = index + options.ema.period - 1;
      if (result[dataIndex]) {
        result[dataIndex].ema = value;
      }
    });
  }

  // RSI
  if (options.rsi?.enabled) {
    const rsiValues = calculateRSI(prices, options.rsi.period);
    rsiValues.forEach((value, index) => {
      const dataIndex = index + options.rsi.period;
      if (result[dataIndex]) {
        result[dataIndex].rsi = value;
      }
    });
  }

  // MACD
  if (options.macd?.enabled) {
    const macdData = calculateMACD(prices, options.macd.fastPeriod, options.macd.slowPeriod, options.macd.signalPeriod);
    macdData.macd.forEach((value, index) => {
      const dataIndex = index + options.macd.slowPeriod + options.macd.signalPeriod - 2;
      if (result[dataIndex]) {
        result[dataIndex].macd = {
          macd: value,
          signal: macdData.signal[index],
          histogram: macdData.histogram[index]
        };
      }
    });
  }

  // Bollinger Bands
  if (options.bollingerBands?.enabled) {
    const bbData = calculateBollingerBands(prices, options.bollingerBands.period, options.bollingerBands.standardDeviations);
    bbData.upper.forEach((value, index) => {
      const dataIndex = index + options.bollingerBands.period - 1;
      if (result[dataIndex]) {
        result[dataIndex].bollingerBands = {
          upper: value,
          middle: bbData.middle[index],
          lower: bbData.lower[index]
        };
      }
    });
  }

  // Stochastic Oscillator
  if (options.stochastic?.enabled) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const stochasticData = calculateStochastic(highs, lows, prices, options.stochastic.kPeriod, options.stochastic.dPeriod);
    stochasticData.k.forEach((value, index) => {
      const dataIndex = index + options.stochastic.kPeriod - 1;
      if (result[dataIndex]) {
        result[dataIndex].stochastic = {
          k: value,
          d: stochasticData.d[index]
        };
      }
    });
  }

  // Williams %R
  if (options.williamsR?.enabled) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const williamsRValues = calculateWilliamsR(highs, lows, prices, options.williamsR.period);
    williamsRValues.forEach((value, index) => {
      const dataIndex = index + options.williamsR.period - 1;
      if (result[dataIndex]) {
        result[dataIndex].williamsR = value;
      }
    });
  }

  // Commodity Channel Index
  if (options.cci?.enabled) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const cciValues = calculateCCI(highs, lows, prices, options.cci.period);
    cciValues.forEach((value, index) => {
      const dataIndex = index + options.cci.period - 1;
      if (result[dataIndex]) {
        result[dataIndex].cci = value;
      }
    });
  }

  return result;
}