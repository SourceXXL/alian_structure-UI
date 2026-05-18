import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates/payouts?wallet=<address>
 * Fetch payout history and pending requests
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
    const payouts = [
      {
        id: '1',
        amount: '500.00',
        status: 'completed',
        requestedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        processedAt: new Date(Date.now() - 86400000 * 29).toISOString(),
        walletAddress: wallet,
        transactionHash: '0x1234567890abcdef',
      },
      {
        id: '2',
        amount: '750.00',
        status: 'completed',
        requestedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        processedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        walletAddress: wallet,
        transactionHash: '0xfedcba0987654321',
      },
      {
        id: '3',
        amount: '325.50',
        status: 'pending',
        requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        walletAddress: wallet,
      },
    ];

    return NextResponse.json(payouts);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliates/payouts/request
 * Request a payout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount, destinationAddress } = body;

    // Validation
    if (!walletAddress || !amount || !destinationAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, amount, destinationAddress' },
        { status: 400 }
      );
    }

    // Validate Stellar addresses
    if (!/^G[A-Z2-7]{55}$/.test(walletAddress) || !/^G[A-Z2-7]{55}$/.test(destinationAddress)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check minimum payout (100 XLM)
    if (amountNum < 100) {
      return NextResponse.json(
        { error: 'Minimum payout is 100 XLM' },
        { status: 400 }
      );
    }

    // TODO: Validate pending earnings and create payout request in database
    // TODO: Initiate Stellar transaction

    const payoutRequest = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      walletAddress,
      destinationAddress,
    };

    return NextResponse.json(payoutRequest, { status: 201 });
  } catch (error) {
    console.error('Error requesting payout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
