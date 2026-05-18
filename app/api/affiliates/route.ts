import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/affiliates
 * List all affiliate endpoints (documentation)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Affiliate API endpoints',
    endpoints: {
      stats: 'GET /api/affiliates/stats?wallet=<address>',
      referrals: 'GET /api/affiliates/referrals?wallet=<address>',
      payouts: 'GET /api/affiliates/payouts?wallet=<address>',
      program: 'GET /api/affiliates/program',
      'request-payout': 'POST /api/affiliates/payouts/request',
      'generate-code': 'POST /api/affiliates/referrals/generate',
      'validate': 'GET /api/affiliates/validate?wallet=<address>',
    },
  });
}
