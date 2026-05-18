import type { MetricsPanelResponse } from './types';

function csvEscape(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function panelToCsv(panel: MetricsPanelResponse): string {
  const header = ['series', 'ts', 'value'];
  const rows: Array<[string, number, number]> = [];
  for (const s of panel.series) {
    for (const p of s.points) {
      rows.push([s.seriesName, p.ts, p.value]);
    }
  }
  return [header, ...rows].map((r) => r.map((v) => csvEscape(v)).join(',')).join('\n');
}

