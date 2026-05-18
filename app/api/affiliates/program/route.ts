import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates/program
 * Fetch affiliate program details and guidelines
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database
    // For now, return mock data
    const program = {
      id: 'prog-001',
      name: 'stellAIverse Affiliate Program',
      status: 'active',
      commissionStructure: {
        direct: 10,
        tier2: 5,
        tier3: 2,
      },
      minimumPayout: '100.00',
      payoutFrequency: 'weekly',
      guidelines: [
        'No misleading marketing claims',
        'Respect user privacy and data',
        'Follow all applicable regulations',
        'Maintain professional communication',
        'Report accurate referral data',
      ],
      joinedAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    };

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
