'use client';

import React from 'react';
import type { TelemetryEvent } from '@/lib/telemetry/types';
import clsx from 'clsx';

function severityClass(s: TelemetryEvent['severity']): string {
  switch (s) {
    case 'critical':
    case 'error':
      return 'text-red-300 border-red-500/30 bg-red-950/20';
    case 'warn':
      return 'text-amber-200 border-amber-500/30 bg-amber-950/20';
    case 'info':
      return 'text-cyan-200 border-cosmic-cyan/30 bg-cyan-950/10';
    default:
      return 'text-gray-400 border-gray-600/30 bg-gray-900/30';
  }
}

interface Props {
  events: TelemetryEvent[];
}

export const TelemetryEventList = React.memo(({ events }: Props) => {
  if (events.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-cosmic-purple/20 rounded-lg">
        No events match the current filters. Adjust filters or wait for live telemetry.
      </p>
    );
  }

  return (
    <ul className="space-y-2 max-h-[min(70vh,640px)] overflow-y-auto pr-1">
      {events.map((ev) => (
        <li
          key={ev.id}
          className={clsx(
            'rounded-lg border px-3 py-2 text-sm grid gap-1 sm:grid-cols-[auto_1fr_auto] sm:items-center',
            severityClass(ev.severity)
          )}
        >
          <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
            {new Date(ev.ts).toLocaleTimeString()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 items-baseline">
              <span className="font-medium text-white">{ev.type.replace(/_/g, ' ')}</span>
              <span className="text-xs text-gray-400">{ev.agentRef}</span>
            </div>
            {ev.payload && (
              <p className="text-xs text-gray-300 mt-1 break-words">
                {[ev.payload.code, ev.payload.message, ev.payload.state, ev.payload.taskKind]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <span className="text-xs uppercase tracking-wide justify-self-start sm:justify-self-end">
            {ev.severity}
          </span>
        </li>
      ))}
    </ul>
  );
});

TelemetryEventList.displayName = 'TelemetryEventList';
