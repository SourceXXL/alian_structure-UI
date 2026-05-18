import { sanitizeLabels } from '@/lib/metrics/sanitize';

describe('metrics sanitize', () => {
  it('drops sensitive label keys', () => {
    expect(
      sanitizeLabels({
        job: 'api',
        email: 'x@y.com',
        user_id: '123',
        instance: '10.0.0.1:8080',
      })
    ).toEqual({ job: 'api' });
  });

  it('redacts sensitive values even on non-sensitive keys', () => {
    const out = sanitizeLabels({
      route: '/users/alice@example.com/profile',
      peer: '10.12.1.9',
      walletRef: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    expect(out.route).toContain('[redacted]');
    expect(out.peer).toBe('[redacted]');
    expect(out.walletRef).toBe('[redacted]');
  });
});

