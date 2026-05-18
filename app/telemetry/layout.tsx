import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent telemetry | Alian-Structure',
  description: 'Live agent telemetry with WebSocket streaming, filters, and role-based visibility.',
};

export default function TelemetryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
