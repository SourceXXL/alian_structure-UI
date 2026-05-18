'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { applyRoleVisibility, eventMatchesFilters } from '@/lib/telemetry/filter';
import { getTelemetryCapabilities, type TelemetryRole } from '@/lib/telemetry/roles';
import type { TelemetryFilters as TF } from '@/lib/telemetry/types';
import { TelemetryEventList } from './components/TelemetryEventList';
import { TelemetryFilters } from './components/TelemetryFilters';
import { TelemetryRoleBar } from './components/TelemetryRoleBar';
import { useTelemetryWebSocket } from './hooks/useTelemetryWebSocket';

const ROLE_STORAGE_KEY = 'telemetry_dashboard_role';

function readStoredRole(): TelemetryRole {
  if (typeof window === 'undefined') return 'viewer';
  const v = sessionStorage.getItem(ROLE_STORAGE_KEY);
  if (v === 'operator' || v === 'admin' || v === 'viewer') return v;
  return 'viewer';
}

const DEFAULT_FILTERS: TF = {
  agentRef: null,
  types: [],
  severities: [],
};

export default function AgentTelemetryDashboardPage() {
  const [role, setRole] = useState<TelemetryRole>('viewer');
  const [filters, setFilters] = useState<TF>(DEFAULT_FILTERS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRole(readStoredRole());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  }, [role, hydrated]);

  const caps = useMemo(() => getTelemetryCapabilities(role), [role]);
  const { events, status, lastError, reconnect, clearEvents, usingMock } = useTelemetryWebSocket(role);

  useEffect(() => {
    if (!caps.canFilterByAgent && filters.agentRef) {
      setFilters((f) => ({ ...f, agentRef: null }));
    }
    if (!caps.canUseDebugSeverity && filters.severities.includes('debug')) {
      setFilters((f) => ({
        ...f,
        severities: f.severities.filter((s) => s !== 'debug'),
      }));
    }
  }, [caps.canFilterByAgent, caps.canUseDebugSeverity, filters.agentRef, filters.severities]);

  const knownAgents = useMemo(() => {
    const fromStream = [...new Set(events.map((e) => e.agentRef))];
    const defaults = ['agent_a7f3', 'agent_b2c9', 'agent_m1k4'];
    return [...new Set([...defaults, ...fromStream])].sort();
  }, [events]);

  const visible = useMemo(() => {
    return events
      .filter((e) => eventMatchesFilters(e, filters, caps))
      .map((e) => applyRoleVisibility(e, caps));
  }, [events, filters, caps]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(visible, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [visible]);

  if (!hydrated) {
    return (
      <main className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold glow-text">Agent telemetry</h1>
          <p className="text-gray-300 text-lg mt-2 max-w-3xl">
            Live heartbeats, status, tasks, and errors — filtered by role. Telemetry uses opaque agent
            references only; payloads are scrubbed before display.
          </p>
        </div>

        <TelemetryRoleBar role={role} onRoleChange={setRole} />

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                  status === 'open'
                    ? 'border-emerald-500/40 text-emerald-200'
                    : status === 'connecting'
                      ? 'border-amber-500/40 text-amber-200'
                      : 'border-gray-600 text-gray-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" aria-hidden />
                {status === 'open' ? 'Live' : status}
              </span>
              {usingMock && (
                <span className="text-xs text-gray-500 border border-cosmic-purple/20 rounded px-2 py-1">
                  Mock stream (set NEXT_PUBLIC_TELEMETRY_WS_URL for real WebSocket)
                </span>
              )}
              {lastError && <span className="text-xs text-red-300">Last issue: {lastError}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={reconnect}>
                Reconnect
              </Button>
              {(role === 'operator' || role === 'admin') && (
                <Button type="button" variant="outline" size="sm" onClick={clearEvents}>
                  Clear buffer
                </Button>
              )}
              {caps.canExport && (
                <Button type="button" size="sm" onClick={exportJson}>
                  Export JSON
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <TelemetryFilters
            filters={filters}
            onChange={setFilters}
            caps={caps}
            knownAgents={knownAgents}
          />
          <Card>
            <h2 className="text-lg font-medium text-white mb-4">Event stream ({visible.length})</h2>
            <TelemetryEventList events={visible} />
          </Card>
        </div>
      </div>
    </main>
  );
}
