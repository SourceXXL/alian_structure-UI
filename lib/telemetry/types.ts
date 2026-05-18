/** Agent telemetry streamed over WebSocket — no PII in public fields. */

export type TelemetryEventType =
  | 'heartbeat'
  | 'status'
  | 'error'
  | 'task_started'
  | 'task_completed';

export type TelemetrySeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/** Opaque agent identifier (never email, name, or wallet). */
export type AgentRef = string;

export interface TelemetryEventPayload {
  /** Stable correlation id for support (opaque). */
  correlationId?: string;
  /** Non-identifying task label, e.g. "indexing" — no user content. */
  taskKind?: string;
  /** Sanitized status machine value. */
  state?: string;
  /** Error code or category — not stack traces with paths. */
  code?: string;
  /** Human-safe message with PII stripped server-side. */
  message?: string;
}

export interface TelemetryEvent {
  id: string;
  ts: number;
  agentRef: AgentRef;
  type: TelemetryEventType;
  severity: TelemetrySeverity;
  payload?: TelemetryEventPayload;
}

export interface TelemetryFilters {
  agentRef: string | null;
  types: TelemetryEventType[];
  severities: TelemetrySeverity[];
}
