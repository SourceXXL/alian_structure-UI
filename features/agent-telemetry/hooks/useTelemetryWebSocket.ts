'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TelemetryEvent, TelemetryEventType, TelemetrySeverity } from '@/lib/telemetry/types';
import { sanitizeTelemetryEvent } from '@/lib/telemetry/sanitize';
import type { TelemetryRole } from '@/lib/telemetry/roles';

const MAX_BUFFER = 500;

function isTelemetryEvent(raw: unknown): raw is TelemetryEvent {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.ts === 'number' &&
    typeof o.agentRef === 'string' &&
    typeof o.type === 'string' &&
    typeof o.severity === 'string'
  );
}

function getWsBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL?.trim();
  return base || null;
}

function buildWsUrl(role: TelemetryRole): string | null {
  const base = getWsBaseUrl();
  if (!base) return null;
  try {
    const u = new URL(base);
    u.searchParams.set('role', role);
    return u.toString();
  } catch {
    return null;
  }
}

export interface UseTelemetryWebSocketResult {
  events: TelemetryEvent[];
  status: 'idle' | 'connecting' | 'open' | 'closed' | 'error';
  lastError: string | null;
  reconnect: () => void;
  clearEvents: () => void;
  usingMock: boolean;
}

export function useTelemetryWebSocket(role: TelemetryRole): UseTelemetryWebSocketResult {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [status, setStatus] = useState<UseTelemetryWebSocketResult['status']>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seqRef = useRef(0);
  const roleRef = useRef(role);
  roleRef.current = role;
  const usingMock = !getWsBaseUrl();

  const pushEvent = useCallback((ev: TelemetryEvent) => {
    setEvents((prev) => {
      const next = [sanitizeTelemetryEvent(ev), ...prev];
      return next.slice(0, MAX_BUFFER);
    });
  }, []);

  const stopMock = useCallback(() => {
    if (mockRef.current) {
      clearInterval(mockRef.current);
      mockRef.current = null;
    }
  }, []);

  const stopWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const startMock = useCallback(() => {
    stopWs();
    stopMock();
    setStatus('open');
    setLastError(null);

    const types: TelemetryEventType[] = [
      'heartbeat',
      'status',
      'error',
      'task_started',
      'task_completed',
    ];
    const severities: TelemetrySeverity[] = ['debug', 'info', 'warn', 'error', 'critical'];
    const agents = ['agent_a7f3', 'agent_b2c9', 'agent_m1k4'];

    mockRef.current = setInterval(() => {
      seqRef.current += 1;
      const r = roleRef.current;
      const type = types[seqRef.current % types.length];
      const severity = severities[seqRef.current % severities.length];
      const agentRef = agents[seqRef.current % agents.length];

      const base: TelemetryEvent = {
        id: `mock-${Date.now()}-${seqRef.current}`,
        ts: Date.now(),
        agentRef,
        type,
        severity,
        payload: {
          correlationId: `corr_${(seqRef.current % 1000).toString(36)}`,
          taskKind: 'embedding_batch',
          state: type === 'status' ? 'running' : 'ok',
          code: type === 'error' ? 'E_RATE_LIMIT' : undefined,
          message:
            type === 'error' && r === 'viewer'
              ? undefined
              : type === 'error'
                ? 'Upstream provider throttled (retry scheduled)'
                : 'tick',
        },
      };

      pushEvent(base);
    }, 1800);
  }, [pushEvent, stopMock, stopWs]);

  const connect = useCallback(() => {
    const url = buildWsUrl(roleRef.current);

    stopMock();
    stopWs();

    if (!url) {
      startMock();
      return;
    }

    setStatus('connecting');
    setLastError(null);

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch (e) {
      setStatus('error');
      setLastError(e instanceof Error ? e.message : 'WebSocket construct failed');
      startMock();
      return;
    }

    wsRef.current = socket;

    socket.onopen = () => {
      setStatus('open');
      setLastError(null);
    };

    socket.onmessage = (evt) => {
      try {
        const raw = JSON.parse(String(evt.data)) as Record<string, unknown>;
        if (raw?.type === 'telemetry_welcome') return;
        if (!isTelemetryEvent(raw)) return;
        pushEvent(raw);
      } catch {
        setLastError('Invalid telemetry frame');
      }
    };

    socket.onerror = () => {
      setLastError('WebSocket error');
    };

    socket.onclose = () => {
      wsRef.current = null;
      setStatus('closed');
    };
  }, [pushEvent, startMock, stopMock, stopWs, role]);

  useEffect(() => {
    roleRef.current = role;
    connect();
    return () => {
      stopWs();
      stopMock();
    };
  }, [connect, role, stopMock, stopWs]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return {
    events,
    status,
    lastError,
    reconnect: connect,
    clearEvents,
    usingMock,
  };
}
