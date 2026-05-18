export type MetricsRange = '15m' | '1h' | '6h' | '24h' | '7d';

export type MetricsSource = 'prometheus' | 'otel_prometheus' | 'mock';

export interface MetricsPanelDefinition {
  id: string;
  title: string;
  description?: string;
  group: 'system' | 'business';
  unit?: 'ms' | 's' | 'percent' | 'bytes' | 'count' | 'rate_per_s' | 'xlm';
  promqlRange: string;
  promqlInstant?: string;
}

export interface MetricsSeriesPoint {
  ts: number; // unix seconds
  value: number;
}

export interface MetricsSeries {
  seriesName: string;
  labels: Record<string, string>;
  points: MetricsSeriesPoint[];
}

export interface MetricsPanelResponse {
  panelId: string;
  source: MetricsSource;
  start: number;
  end: number;
  step: number;
  series: MetricsSeries[];
  generatedAt: string;
}

export interface MetricsPanelsResponse {
  source: MetricsSource;
  panels: MetricsPanelDefinition[];
}

