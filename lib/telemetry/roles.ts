export type TelemetryRole = 'viewer' | 'operator' | 'admin';

export interface TelemetryCapabilities {
  /** See live stream at all. */
  canConnect: boolean;
  /** Filter by specific agent ref. */
  canFilterByAgent: boolean;
  /** See error/critical details (codes, sanitized messages). */
  canViewErrorDetails: boolean;
  /** Export recent events (still sanitized). */
  canExport: boolean;
  /** Adjust severity filter below info. */
  canUseDebugSeverity: boolean;
}

const CAPS: Record<TelemetryRole, TelemetryCapabilities> = {
  viewer: {
    canConnect: true,
    canFilterByAgent: false,
    canViewErrorDetails: false,
    canExport: false,
    canUseDebugSeverity: false,
  },
  operator: {
    canConnect: true,
    canFilterByAgent: true,
    canViewErrorDetails: true,
    canExport: false,
    canUseDebugSeverity: true,
  },
  admin: {
    canConnect: true,
    canFilterByAgent: true,
    canViewErrorDetails: true,
    canExport: true,
    canUseDebugSeverity: true,
  },
};

export function getTelemetryCapabilities(role: TelemetryRole): TelemetryCapabilities {
  return CAPS[role];
}

/** Server-side mirror for API / WS gateway (keep in sync with CAPS). */
export function roleAllowsAgentFilter(role: TelemetryRole): boolean {
  return CAPS[role].canFilterByAgent;
}

export function roleAllowsErrorDetails(role: TelemetryRole): boolean {
  return CAPS[role].canViewErrorDetails;
}
