import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates/stats?wallet=<address>
 * Fetch affiliate statistics for a wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate Stellar address format (56 characters, starts with G)
    if (!/^G[A-Z2-7]{55}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database
    // For now, return mock data
    const stats = {
      totalReferrals: 42,
      activeReferrals: 38,
      totalEarnings: '2450.75',
      pendingEarnings: '325.50',
      totalPayouts: '2125.25',
      conversionRate: 90.5,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
