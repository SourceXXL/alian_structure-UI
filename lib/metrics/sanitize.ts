const SENSITIVE_LABEL_KEYS = new Set([
  // Common PII keys
  'email',
  'phone',
  'ssn',
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'userid',
  'user_id',
  'username',
  'name',
  'firstname',
  'lastname',
  // Infra keys that often embed IPs/hostnames (treated as sensitive for this UI)
  'ip',
  'ipaddress',
  'instance',
  'host',
  'hostname',
  'node',
  'pod',
  'container',
  // Wallet / keys
  'wallet',
  'address',
  'publickey',
  'privatekey',
  'account',
  'sourceaccount',
  'source_account',
]);

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const LONG_BASE64_RE = /\b[A-Za-z0-9+/]{40,}={0,2}\b/g;
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\b/g;
// Stellar public keys are typically G + 55 chars of base32 (A-Z2-7)
const STELLAR_G_ADDRESS_RE = /\bG[A-Z2-7]{55}\b/g;

function scrubString(s: string): string {
  return s
    .replace(EMAIL_RE, '[redacted]')
    .replace(IPV4_RE, '[redacted]')
    .replace(STELLAR_G_ADDRESS_RE, '[redacted]')
    .replace(LONG_BASE64_RE, '[redacted]');
}

export function sanitizeLabels(labels: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(labels)) {
    const key = k.toLowerCase();
    if (SENSITIVE_LABEL_KEYS.has(key)) continue;
    out[k] = scrubString(v);
  }
  return out;
}

export function labelsToSeriesName(labels: Record<string, string>): string {
  const entries = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6);
  if (entries.length === 0) return 'total';
  return entries.map(([k, v]) => `${k}=${v}`).join(', ');
}

