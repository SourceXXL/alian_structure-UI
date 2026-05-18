'use client';

import type { TelemetryCapabilities } from '@/lib/telemetry/roles';
import type { TelemetryEventType, TelemetryFilters as TF, TelemetrySeverity } from '@/lib/telemetry/types';

const ALL_TYPES: TelemetryEventType[] = [
  'heartbeat',
  'status',
  'error',
  'task_started',
  'task_completed',
];

const ALL_SEVERITIES: TelemetrySeverity[] = ['debug', 'info', 'warn', 'error', 'critical'];

interface Props {
  filters: TF;
  onChange: (next: TF) => void;
  caps: TelemetryCapabilities;
  knownAgents: string[];
}

export function TelemetryFilters({ filters, onChange, caps, knownAgents }: Props) {
  const severityOptions = caps.canUseDebugSeverity
    ? ALL_SEVERITIES
    : ALL_SEVERITIES.filter((s) => s !== 'debug');

  return (
    <div className="rounded-lg border border-cosmic-purple/30 bg-cosmic-darker/40 p-4 space-y-4">
      <h2 className="text-lg font-medium text-white">Filters</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Agent</label>
        <select
          className="w-full max-w-md rounded-md bg-cosmic-dark border border-cosmic-purple/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={!caps.canFilterByAgent}
          value={filters.agentRef ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              agentRef: e.target.value || null,
            })
          }
        >
          <option value="">All agents</option>
          {knownAgents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {!caps.canFilterByAgent && (
          <p className="text-xs text-amber-200/80 mt-1">Per-agent filter requires operator or admin.</p>
        )}
      </div>

      <div>
        <span className="block text-sm text-gray-400 mb-2">Event types</span>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((t) => (
            <label key={t} className="inline-flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-cosmic-purple/40"
                checked={filters.types.length === 0 || filters.types.includes(t)}
                onChange={() => {
                  if (filters.types.length === 0) {
                    onChange({ ...filters, types: ALL_TYPES.filter((x) => x !== t) });
                    return;
                  }
                  const next = filters.types.includes(t)
                    ? filters.types.filter((x) => x !== t)
                    : [...filters.types, t];
                  onChange({
                    ...filters,
                    types: next.length === ALL_TYPES.length ? [] : next,
                  });
                }}
              />
              {t.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">All types shown when none excluded (or all checked).</p>
      </div>

      <div>
        <span className="block text-sm text-gray-400 mb-2">Severity</span>
        <div className="flex flex-wrap gap-2">
          {severityOptions.map((s) => (
            <label key={s} className="inline-flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-cosmic-purple/40"
                checked={filters.severities.length === 0 || filters.severities.includes(s)}
                onChange={() => {
                  const pool = severityOptions;
                  if (filters.severities.length === 0) {
                    onChange({ ...filters, severities: pool.filter((x) => x !== s) });
                    return;
                  }
                  const next = filters.severities.includes(s)
                    ? filters.severities.filter((x) => x !== s)
                    : [...filters.severities, s];
                  onChange({
                    ...filters,
                    severities: next.length === pool.length ? [] : next,
                  });
                }}
              />
              {s}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
