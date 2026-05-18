import { NextRequest, NextResponse } from 'next/server';
import { getPanel } from '@/lib/metrics/panels';
import { buildMockPanelResponse } from '@/lib/metrics/mock';
import { getMetricsSource, queryRangePanel } from '@/lib/metrics/prometheus';

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseRangeSeconds(range: string): number {
  switch (range) {
    case '15m':
      return 15 * 60;
    case '1h':
      return 60 * 60;
    case '6h':
      return 6 * 60 * 60;
    case '24h':
      return 24 * 60 * 60;
    case '7d':
      return 7 * 24 * 60 * 60;
    default:
      return 60 * 60;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const panelId = String(searchParams.get('panelId') || '');
    const panel = getPanel(panelId);
    if (!panel) {
      return NextResponse.json({ message: 'Unknown panelId' }, { status: 400 });
    }

    const range = String(searchParams.get('range') || '1h');
    const stepRaw = Number(searchParams.get('step') || 30);
    const step = clampInt(stepRaw, 5, 300);

    const now = Math.floor(Date.now() / 1000);
    const end = now;
    const start = now - parseRangeSeconds(range);

    const source = getMetricsSource();
    if (source === 'mock') {
      return NextResponse.json(buildMockPanelResponse({ panel, start, end, step }));
    }

    const result = await queryRangePanel({ panel, start, end, step, signal: request.signal });
    return NextResponse.json({
      panelId: panel.id,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to fetch metrics panel',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

