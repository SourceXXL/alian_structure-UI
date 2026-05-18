import { NextRequest, NextResponse } from 'next/server';
import { aggregateAnalytics } from '@/lib/analytics/aggregation';
import { AnalyticsRange } from '@/lib/analytics/types';
import { StellarNetwork } from '@/lib/types';

const ALLOWED_RANGES: AnalyticsRange[] = ['7d', '30d', '90d', '1y'];
const ALLOWED_NETWORKS: StellarNetwork[] = ['mainnet', 'testnet', 'futurenet'];

function parseAgents(raw: string | null, fallbackPrefix: string) {
  if (!raw) {
    return [] as Array<{ agentId: string; agentName: string }>;
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((agentId, index) => ({
      agentId,
      agentName: `${fallbackPrefix} ${index + 1}`,
    }));
}

function parseMarketplaceAgents(raw: string | null) {
  const agents = parseAgents(raw, 'Marketplace Agent');
  return agents.slice(0, 20);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') as AnalyticsRange | null;
    const networkParam = searchParams.get('network') as StellarNetwork | null;
    const ownedAgentsParam = searchParams.get('ownedAgentIds');
    const marketplaceAgentsParam = searchParams.get('marketplaceAgentIds');

    const range = ALLOWED_RANGES.includes(rangeParam || '7d') ? (rangeParam as AnalyticsRange) : '7d';
    const network = ALLOWED_NETWORKS.includes(networkParam || 'mainnet')
      ? (networkParam as StellarNetwork)
      : 'mainnet';

    const ownedAgents = parseAgents(ownedAgentsParam, 'Owned Agent');
    const marketplaceAgents = parseMarketplaceAgents(marketplaceAgentsParam);

    const dataset = await aggregateAnalytics({
      network,
      range,
      ownedAgents,
      marketplaceAgents: marketplaceAgents.length > 0 ? marketplaceAgents : ownedAgents,
    });

    return NextResponse.json(dataset);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to aggregate analytics',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
