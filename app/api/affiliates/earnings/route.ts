import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates/earnings/history?wallet=<address>&days=<number>
 * Fetch earnings history for charts
 */
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get('wallet');
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate Stellar address format
    if (!/^G[A-Z2-7]{55}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }

    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database
    // For now, return mock data
    const history = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const sources = ['direct', 'tier2', 'tier3'];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const amount = Math.floor(Math.random() * 100) + 10;

      history.push({
        date: dateStr,
        amount,
        source,
      });
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching earnings history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
