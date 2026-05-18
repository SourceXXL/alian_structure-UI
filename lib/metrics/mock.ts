import type { MetricsPanelDefinition, MetricsPanelResponse, MetricsSeries } from './types';
import { sanitizeLabels, labelsToSeriesName } from './sanitize';

function genSineSeries(panel: MetricsPanelDefinition, start: number, end: number, step: number): MetricsSeries[] {
  const labels = sanitizeLabels({ job: 'mock', env: 'dev' });
  const points = [];
  const span = Math.max(1, end - start);
  const base = panel.group === 'business' ? 50 : 20;
  for (let t = start; t <= end; t += step) {
    const x = (t - start) / span;
    const noise = Math.sin(x * Math.PI * 6) * 0.15 + Math.sin(x * Math.PI * 2) * 0.1;
    const trend = panel.id.includes('error') ? 0.02 : 0.08;
    const raw = base * (1 + noise) + base * trend * x;
    const value =
      panel.unit === 'percent' ? Math.max(0, Math.min(100, raw)) : Math.max(0, raw);
    points.push({ ts: t, value: Number(value.toFixed(4)) });
  }
  return [
    {
      seriesName: labelsToSeriesName(labels),
      labels,
      points,
    },
  ];
}

export function buildMockPanelResponse(args: {
  panel: MetricsPanelDefinition;
  start: number;
  end: number;
  step: number;
}): MetricsPanelResponse {
  const { panel, start, end, step } = args;
  return {
    panelId: panel.id,
    source: 'mock',
    start,
    end,
    step,
    series: genSineSeries(panel, start, end, step),
    generatedAt: new Date().toISOString(),
  };
}

