# Affiliate Dashboard Integration Guide

This guide explains how to integrate the affiliate dashboard into your application and connect it to the wallet provider.

## Quick Start

### 1. Add Route to App Router

Create a new page for the affiliate dashboard:

```tsx
// app/affiliates/page.tsx
'use client';

import AffiliateDashboardPage from '@/features/affiliate-dashboard/page';

export default function AffiliatesPage() {
  return <AffiliateDashboardPage />;
}
```

### 2. Update Navigation

Add a link to the affiliate dashboard in your navigation:

```tsx
// components/Navigation.tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* ... other nav items ... */}
      <Link href="/affiliates">Affiliate Program</Link>
    </nav>
  );
}
```

### 3. Connect Wallet Provider

The dashboard uses the `StellarWalletProvider` context. Update the main dashboard page to use it:

```tsx
// features/affiliate-dashboard/page.tsx
'use client';

import React, { useContext } from 'react';
import { WalletContext } from '@/lib/types';
import { useAffiliateData } from './hooks/useAffiliateData';

export default function AffiliateDashboardPage() {
  // Get wallet from context
  const walletContext = useContext(WalletContext);
  const walletAddress = walletContext?.wallet?.publicKey || null;

  const {
    stats,
    referrals,
    // ... rest of the hook
  } = useAffiliateData(walletAddress);

  // ... rest of component
}
```

## Backend Integration

### 1. Database Schema

Create tables for affiliate data:

```sql
-- Affiliates table
CREATE TABLE affiliates (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(56) UNIQUE NOT NULL,
  program_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (program_id) REFERENCES affiliate_programs(id)
);

-- Referral codes table
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY,
  affiliate_id UUID NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referral_code_id UUID NOT NULL,
  referred_user_address VARCHAR(56) NOT NULL,
  referred_user_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  commission_rate DECIMAL(5, 2),
  commission_amount DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP,
  FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id)
);

-- Payout requests table
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY,
  affiliate_id UUID NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  destination_address VARCHAR(56) NOT NULL,
  transaction_hash VARCHAR(255),
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
);

-- Earnings history table
CREATE TABLE earnings_history (
  id UUID PRIMARY KEY,
  affiliate_id UUID NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  source VARCHAR(20), -- 'direct', 'tier2', 'tier3'
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
);

-- Affiliate programs table
CREATE TABLE affiliate_programs (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  commission_direct DECIMAL(5, 2),
  commission_tier2 DECIMAL(5, 2),
  commission_tier3 DECIMAL(5, 2),
  minimum_payout DECIMAL(18, 8),
  payout_frequency VARCHAR(20),
  guidelines TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Implementation

Implement the backend endpoints:

```typescript
// Example: Node.js/Express implementation

// GET /api/affiliates/stats
app.get('/api/affiliates/stats', async (req, res) => {
  const { wallet } = req.query;

  // Validate wallet address
  if (!wallet || !/^G[A-Z2-7]{55}$/.test(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Get affiliate
    const affiliate = await db.query(
      'SELECT * FROM affiliates WHERE wallet_address = $1',
      [wallet]
    );

    if (!affiliate.rows.length) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    const affiliateId = affiliate.rows[0].id;

    // Get stats
    const stats = await db.query(`
      SELECT
        COUNT(DISTINCT r.id) as total_referrals,
        COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as active_referrals,
        COALESCE(SUM(r.commission_amount), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN r.status = 'active' THEN r.commission_amount ELSE 0 END), 0) as pending_earnings,
        COALESCE(SUM(CASE WHEN r.status = 'converted' THEN r.commission_amount ELSE 0 END), 0) as total_payouts,
        ROUND(COUNT(DISTINCT CASE WHEN r.status = 'converted' THEN r.id END)::numeric / 
              NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as conversion_rate
      FROM referrals r
      JOIN referral_codes rc ON r.referral_code_id = rc.id
      WHERE rc.affiliate_id = $1
    `, [affiliateId]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/affiliates/payouts/request
app.post('/api/affiliates/payouts/request', async (req, res) => {
  const { walletAddress, amount, destinationAddress } = req.body;

  // Validation
  if (!walletAddress || !amount || !destinationAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^G[A-Z2-7]{55}$/.test(walletAddress) || !/^G[A-Z2-7]{55}$/.test(destinationAddress)) {
    return res.status(400).json({ error: 'Invalid Stellar address' });
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum < 100) {
    return res.status(400).json({ error: 'Minimum payout is 100 XLM' });
  }

  try {
    // Get affiliate
    const affiliate = await db.query(
      'SELECT * FROM affiliates WHERE wallet_address = $1',
      [walletAddress]
    );

    if (!affiliate.rows.length) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    // Check pending earnings
    const earnings = await db.query(`
      SELECT COALESCE(SUM(commission_amount), 0) as pending
      FROM referrals
      WHERE affiliate_id = $1 AND status = 'active'
    `, [affiliate.rows[0].id]);

    if (parseFloat(earnings.rows[0].pending) < amountNum) {
      return res.status(400).json({ error: 'Insufficient pending earnings' });
    }

    // Create payout request
    const payout = await db.query(`
      INSERT INTO payout_requests (affiliate_id, amount, destination_address, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `, [affiliate.rows[0].id, amount, destinationAddress]);

    // TODO: Initiate Stellar transaction
    // const tx = await initiateStellarPayout(destinationAddress, amount);

    res.status(201).json(payout.rows[0]);
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3. Stellar Integration

Implement Stellar transaction handling:

```typescript
// lib/stellar-payout.ts
import { Keypair, TransactionBuilder, Networks, Operation, Asset } from '@stellar/stellar-sdk';

export async function initiateStellarPayout(
  destinationAddress: string,
  amount: string,
  sourceKeypair: Keypair
) {
  const server = new Horizon.Server('https://horizon.stellar.org');

  try {
    // Get source account
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // Build transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: Networks.PUBLIC_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    // Sign transaction
    transaction.sign(sourceKeypair);

    // Submit transaction
    const result = await server.submitTransaction(transaction);

    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger,
    };
  } catch (error) {
    console.error('Stellar payout error:', error);
    throw error;
  }
}
```

## Environment Setup

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/stellaiverse
STELLAR_NETWORK=public
STELLAR_PAYOUT_ACCOUNT=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STELLAR_PAYOUT_SECRET=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Testing

### Unit Tests

```typescript
// features/affiliate-dashboard/__tests__/useAffiliateData.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAffiliateData } from '../hooks/useAffiliateData';

describe('useAffiliateData', () => {
  it('should fetch affiliate data when wallet address is provided', async () => {
    const walletAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

    const { result } = renderHook(() => useAffiliateData(walletAddress));

    // Wait for data to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.stats).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle payout requests', async () => {
    const walletAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const { result } = renderHook(() => useAffiliateData(walletAddress));

    await act(async () => {
      await result.current.requestPayout('150.00', walletAddress);
    });

    expect(result.current.payoutRequests.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// tests/affiliate-dashboard.integration.test.ts
describe('Affiliate Dashboard Integration', () => {
  it('should display affiliate stats after wallet connection', async () => {
    // 1. Connect wallet
    // 2. Navigate to affiliate dashboard
    // 3. Verify stats are displayed
    // 4. Verify referral table is populated
    // 5. Verify payout form is functional
  });
});
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Backend API endpoints implemented
- [ ] Stellar transaction handling configured
- [ ] Environment variables set
- [ ] Frontend routes added
- [ ] Navigation updated
- [ ] Wallet provider integrated
- [ ] Error handling tested
- [ ] Security audit completed
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] User testing completed

## Troubleshooting

### Wallet Connection Issues
- Ensure Stellar wallet extension is installed
- Check network selection (mainnet/testnet)
- Verify wallet address format

### API Errors
- Check API URL in environment variables
- Verify backend is running
- Check network connectivity
- Review API logs for errors

### Payout Failures
- Verify minimum payout amount (100 XLM)
- Check pending earnings balance
- Ensure destination address is valid
- Check Stellar network status

## Support

For integration support:
1. Review this guide and README
2. Check API documentation
3. Review example implementations
4. Contact development team

## Next Steps

1. Implement backend API endpoints
2. Set up database schema
3. Configure Stellar integration
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production
7. Monitor affiliate activity
8. Gather user feedback
9. Iterate and improve
