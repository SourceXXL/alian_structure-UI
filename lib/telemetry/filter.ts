import type { TelemetryCapabilities } from './roles';
import type { TelemetryEvent, TelemetryFilters } from './types';

export function eventMatchesFilters(
  event: TelemetryEvent,
  filters: TelemetryFilters,
  caps: TelemetryCapabilities
): boolean {
  if (filters.agentRef && caps.canFilterByAgent) {
    if (event.agentRef !== filters.agentRef) return false;
  }
  if (filters.agentRef && !caps.canFilterByAgent) {
    // Viewers cannot narrow to one agent — ignore filter (UI should disable).
    return true;
  }

  if (filters.types.length > 0 && !filters.types.includes(event.type)) {
    return false;
  }
  if (filters.severities.length > 0 && !filters.severities.includes(event.severity)) {
    return false;
  }
  return true;
}

/** Strip error detail for viewers after sanitize. */
export function applyRoleVisibility(
  event: TelemetryEvent,
  caps: TelemetryCapabilities
): TelemetryEvent {
  if (caps.canViewErrorDetails) return event;
  if (event.type !== 'error' && event.severity !== 'critical' && event.severity !== 'error') {
    return event;
  }
  return {
    ...event,
    payload: {
      code: event.payload?.code,
      message: '[details restricted for your role]',
    },
  };
}
