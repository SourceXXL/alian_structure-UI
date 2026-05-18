import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates/validate?wallet=<address>
 * Validate affiliate eligibility
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

    // Validate Stellar address format
    if (!/^G[A-Z2-7]{55}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }

    // TODO: Check eligibility criteria:
    // - Account age (e.g., 30 days minimum)
    // - Minimum trading volume
    // - Account verification status
    // - No previous violations

    const eligible = true;
    const reason = eligible ? undefined : 'Account does not meet eligibility requirements';

    return NextResponse.json({
      eligible,
      reason,
      requirements: {
        minimumAccountAge: '30 days',
        minimumTradingVolume: '1000 XLM',
        verificationRequired: true,
      },
    });
  } catch (error) {
    console.error('Error validating eligibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
