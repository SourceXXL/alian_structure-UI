'use client';

import type { MetricsSeries } from '@/lib/metrics/types';

function lastValue(series: MetricsSeries): number | null {
  const p = series.points[series.points.length - 1];
  return p ? p.value : null;
}

export default function MetricSeriesTable({ series }: { series: MetricsSeries[] }) {
  if (series.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-cosmic-purple/30">
      <table className="min-w-full text-sm">
        <thead className="bg-cosmic-dark/60">
          <tr>
            <th className="text-left px-4 py-3 text-gray-200 font-semibold">Series</th>
            <th className="text-right px-4 py-3 text-gray-200 font-semibold">Latest</th>
          </tr>
        </thead>
        <tbody>
          {series.slice(0, 20).map((s) => (
            <tr key={s.seriesName} className="border-t border-cosmic-purple/20">
              <td className="px-4 py-3 text-gray-200">{s.seriesName}</td>
              <td className="px-4 py-3 text-right text-cosmic-cyan font-semibold">
                {lastValue(s) === null ? '—' : lastValue(s)!.toLocaleString()}
              </td>
            </tr>
          ))}
          {series.length > 20 ? (
            <tr className="border-t border-cosmic-purple/20">
              <td className="px-4 py-3 text-gray-400" colSpan={2}>
                Showing first 20 series.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

