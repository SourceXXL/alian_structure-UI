import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates/referrals?wallet=<address>
 * Fetch all referral records for an affiliate
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

    // TODO: Fetch from database
    // For now, return mock data
    const referrals = [
      {
        id: '1',
        referralCode: 'ASTR001',
        referredUserAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        referredUserName: 'User Alpha',
        status: 'converted',
        commissionRate: 10,
        commissionAmount: '150.00',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        convertedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      },
      {
        id: '2',
        referralCode: 'ASTR002',
        referredUserAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        referredUserName: 'User Beta',
        status: 'active',
        commissionRate: 10,
        commissionAmount: '0.00',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ];

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliates/referrals/generate
 * Generate a new referral code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate Stellar address format
    if (!/^G[A-Z2-7]{55}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }

    // TODO: Generate and store in database
    const code = `ASTR${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return NextResponse.json(
      { code, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
