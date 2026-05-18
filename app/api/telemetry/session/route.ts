import { NextRequest, NextResponse } from 'next/server';
import { getTelemetryCapabilities, type TelemetryRole } from '@/lib/telemetry/roles';

const ROLES: TelemetryRole[] = ['viewer', 'operator', 'admin'];

function parseRole(value: string | null): TelemetryRole | null {
  if (!value) return null;
  return ROLES.includes(value as TelemetryRole) ? (value as TelemetryRole) : null;
}

/**
 * Returns capability matrix for a role. Production should validate JWT / session
 * and ignore client-supplied role claims.
 */
export function GET(req: NextRequest) {
  const role = parseRole(req.nextUrl.searchParams.get('role'));
  if (!role) {
    return NextResponse.json({ error: 'Invalid or missing role' }, { status: 400 });
  }
  return NextResponse.json({
    role,
    capabilities: getTelemetryCapabilities(role),
  });
}

export async function POST(req: NextRequest) {
  let roleParam: string | null = null;
  try {
    const body = (await req.json()) as { role?: unknown };
    roleParam = typeof body?.role === 'string' ? body.role : null;
  } catch {
    roleParam = null;
  }
  const role = parseRole(roleParam);
  if (!role) {
    return NextResponse.json({ error: 'Invalid or missing role' }, { status: 400 });
  }
  return NextResponse.json({
    role,
    capabilities: getTelemetryCapabilities(role),
  });
}
