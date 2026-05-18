import { NextResponse } from 'next/server';
import { METRICS_PANELS } from '@/lib/metrics/panels';
import { getMetricsSource } from '@/lib/metrics/prometheus';

export async function GET() {
  return NextResponse.json({
    source: getMetricsSource(),
    panels: METRICS_PANELS,
  });
}

