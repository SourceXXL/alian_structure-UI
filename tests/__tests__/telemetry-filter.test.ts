import { applyRoleVisibility, eventMatchesFilters } from '@/lib/telemetry/filter';
import { getTelemetryCapabilities } from '@/lib/telemetry/roles';
import type { TelemetryEvent } from '@/lib/telemetry/types';

const base: TelemetryEvent = {
  id: 'e1',
  ts: 1,
  agentRef: 'agent_a',
  type: 'heartbeat',
  severity: 'info',
};

describe('telemetry filter', () => {
  it('filters by agent for operator', () => {
    const caps = getTelemetryCapabilities('operator');
    expect(
      eventMatchesFilters(base, { agentRef: 'agent_b', types: [], severities: [] }, caps)
    ).toBe(false);
    expect(
      eventMatchesFilters(base, { agentRef: 'agent_a', types: [], severities: [] }, caps)
    ).toBe(true);
  });

  it('ignores agent filter for viewer', () => {
    const caps = getTelemetryCapabilities('viewer');
    expect(
      eventMatchesFilters(base, { agentRef: 'agent_b', types: [], severities: [] }, caps)
    ).toBe(true);
  });

  it('masks error payload for viewer', () => {
    const caps = getTelemetryCapabilities('viewer');
    const err: TelemetryEvent = {
      ...base,
      type: 'error',
      severity: 'error',
      payload: { code: 'E1', message: 'detail' },
    };
    const v = applyRoleVisibility(err, caps);
    expect(v.payload?.message).toBe('[details restricted for your role]');
    expect(v.payload?.code).toBe('E1');
  });
});
