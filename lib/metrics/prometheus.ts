import type { MetricsPanelDefinition, MetricsPanelResponse, MetricsSeries } from './types';
import { labelsToSeriesName, sanitizeLabels } from './sanitize';

type PromMatrixValue = [number | string, string];

interface PromQueryRangeResponse {
  status: 'success' | 'error';
  errorType?: string;
  error?: string;
  data?: {
    resultType: 'matrix';
    result: Array<{
      metric: Record<string, string>;
      values: PromMatrixValue[];
    }>;
  };
}

function parseFloatSafe(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toUnixSeconds(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function getBaseUrl(): { url: string | null; source: 'prometheus' | 'otel_prometheus' | 'mock' } {
  const otel = process.env.METRICS_OTEL_PROMETHEUS_BASE_URL?.trim();
  if (otel) return { url: otel, source: 'otel_prometheus' };
  const prom = process.env.METRICS_PROMETHEUS_BASE_URL?.trim();
  if (prom) return { url: prom, source: 'prometheus' };
  return { url: null, source: 'mock' };
}

export function getMetricsSource() {
  return getBaseUrl().source;
}

export async function queryRangePanel(args: {
  panel: MetricsPanelDefinition;
  start: number;
  end: number;
  step: number;
  signal?: AbortSignal;
}): Promise<Omit<MetricsPanelResponse, 'panelId'>> {
  const { panel, start, end, step, signal } = args;
  const { url, source } = getBaseUrl();
  if (!url) {
    return {
      source,
      start,
      end,
      step,
      series: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const u = new URL('/api/v1/query_range', url);
  u.searchParams.set('query', panel.promqlRange);
  u.searchParams.set('start', String(start));
  u.searchParams.set('end', String(end));
  u.searchParams.set('step', String(step));

  const res = await fetch(u.toString(), { signal, headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Prometheus query_range failed (${res.status})`);
  }
  const json = (await res.json()) as PromQueryRangeResponse;
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.error || 'Prometheus error');
  }

  const series: MetricsSeries[] = json.data.result.map((r) => {
    const labels = sanitizeLabels(r.metric || {});
    return {
      labels,
      seriesName: labelsToSeriesName(labels),
      points: (r.values || []).map(([ts, v]) => ({
        ts: toUnixSeconds(ts),
        value: parseFloatSafe(v),
      })),
    };
  });

  return {
    source,
    start,
    end,
    step,
    series,
    generatedAt: new Date().toISOString(),
  };
}

