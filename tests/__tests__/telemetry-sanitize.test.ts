import { sanitizePayload, sanitizeTelemetryEvent } from '@/lib/telemetry/sanitize';

describe('telemetry sanitize', () => {
  it('drops sensitive keys', () => {
    expect(
      sanitizePayload({
        message: 'ok',
        email: 'x@y.com',
        token: 'secret',
      } as Record<string, string>)
    ).toEqual({ message: 'ok' });
  });

  it('redacts emails in message', () => {
    expect(
      sanitizePayload({
        message: 'contact leak@example.com please',
      })
    ).toEqual({ message: 'contact [redacted] please' });
  });

  it('sanitizes full event', () => {
    const ev = sanitizeTelemetryEvent({
      id: '1',
      ts: 1,
      agentRef: 'agent_x',
      type: 'error',
      severity: 'error',
      payload: { message: 'a@b.co failed' },
    });
    expect(ev.payload?.message).toBe('[redacted] failed');
  });
});
