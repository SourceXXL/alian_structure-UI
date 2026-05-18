# Affiliate Dashboard - Quick Start Guide

Get the affiliate dashboard up and running in 5 minutes.

## Step 1: Add the Route

Create a new page for the affiliate dashboard:

```bash
# Create the affiliates page
touch app/affiliates/page.tsx
```

```tsx
// app/affiliates/page.tsx
'use client';

import AffiliateDashboardPage from '@/features/affiliate-dashboard/page';

export default function AffiliatesPage() {
  return <AffiliateDashboardPage />;
}
```

## Step 2: Update Navigation

Add a link to the affiliate dashboard in your navigation:

```tsx
// components/Navigation.tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* ... existing nav items ... */}
      <Link href="/affiliates" className="hover:text-cosmic-purple">
        Affiliate Program
      </Link>
    </nav>
  );
}
```

## Step 3: Connect Wallet Provider

Update the dashboard page to use the wallet context:

```tsx
// features/affiliate-dashboard/page.tsx
'use client';

import React, { useContext } from 'react';
import { StellarWalletProvider } from '@/components/context/StellarWalletProvider';
import { useAffiliateData } from './hooks/useAffiliateData';

// ... rest of component

export default function AffiliateDashboardPage() {
  // Get wallet from context - you'll need to wrap this in a context consumer
  // For now, use null and the component will show the connect wallet prompt
  const walletAddress = null; // TODO: Get from context

  const { /* ... */ } = useAffiliateData(walletAddress);

  // ... rest of component
}
```

## Step 4: Test the Dashboard

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/affiliates`

3. You should see the affiliate dashboard with:
   - Connect Wallet prompt (since no wallet is connected)
   - Program guidelines
   - All dashboard sections

## Step 5: Connect Backend (Optional for Development)

For development, the dashboard uses mock data. To connect real data:

1. Implement the backend API endpoints in `app/api/affiliates/`
2. Update `affiliateService.ts` to call your backend
3. Configure `NEXT_PUBLIC_API_URL` in `.env.local`

## File Structure

```
features/affiliate-dashboard/
├── components/              # UI components
├── hooks/                   # Custom hooks
├── services/                # API client
├── store/                   # State management
├── types/                   # TypeScript types
├── page.tsx                 # Main page
├── README.md                # Full documentation
├── INTEGRATION.md           # Backend integration
└── QUICKSTART.md            # This file
```

## Key Components

### AffiliateStats
Displays key metrics in card format:
- Total referrals
- Total earnings
- Pending earnings
- Total payouts
- Conversion rate
- Active status

### EarningsChart
Shows earnings trends with:
- Line chart for total earnings over time
- Bar chart for commission sources (direct, tier2, tier3)

### ReferralTable
Displays all referrals with:
- Sortable columns (date, commission, status)
- Filterable by status (all, active, converted, inactive)
- Commission amounts and dates

### CommissionBreakdown
Shows commission distribution with:
- Pie chart of commission sources
- Detailed breakdown with percentages
- Total commission summary

### PayoutHistory
Manages payouts with:
- Payout request form
- Payout history with status
- Transaction hash tracking

## Customization

### Change Commission Rates

Edit `features/affiliate-dashboard/store/useAffiliateStore.ts`:

```typescript
const MOCK_PROGRAM: AffiliateProgram = {
  // ...
  commissionStructure: {
    direct: 10,    // Change this
    tier2: 5,      // Change this
    tier3: 2,      // Change this
  },
  minimumPayout: '100.00',  // Change this
  // ...
};
```

### Change Theme Colors

The dashboard uses the cosmic theme from `app/globals.css`:
- `cosmic-purple`: Primary color
- `cosmic-blue`: Secondary color
- `cosmic-cyan`: Accent color
- `cosmic-nebula`: Highlight color

### Add More Referrals

Edit `MOCK_REFERRALS` in `useAffiliateStore.ts` to add test data.

## Troubleshooting

### Dashboard shows "Connect Wallet"
- This is expected if no wallet is connected
- The wallet context needs to be properly integrated
- See INTEGRATION.md for full wallet setup

### Charts not displaying
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data is being loaded

### API errors
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend API is running
- Check network tab in browser dev tools

### Styling issues
- Ensure Tailwind CSS is configured
- Check that cosmic theme colors are defined in `globals.css`
- Verify dark mode is enabled

## Next Steps

1. ✅ Add the route
2. ✅ Update navigation
3. ✅ Test the dashboard
4. 📋 Implement backend API endpoints
5. 📋 Connect wallet provider
6. 📋 Deploy to production

## API Endpoints

The dashboard expects these endpoints:

```
GET  /api/affiliates/stats?wallet=<address>
GET  /api/affiliates/referrals?wallet=<address>
POST /api/affiliates/referrals/generate
GET  /api/affiliates/payouts?wallet=<address>
POST /api/affiliates/payouts/request
GET  /api/affiliates/program
GET  /api/affiliates/validate?wallet=<address>
GET  /api/affiliates/earnings/history?wallet=<address>&days=<number>
```

See INTEGRATION.md for implementation details.

## Support

- 📖 Full documentation: README.md
- 🔧 Integration guide: INTEGRATION.md
- 📝 Implementation details: IMPLEMENTATION_SUMMARY.md
- 💬 Code comments: Throughout the codebase

## Performance Tips

- Use React Query for caching (already configured)
- Lazy load chart components
- Memoize expensive calculations
- Debounce search/filter operations
- Use virtualization for large tables

## Security Checklist

- ✅ Stellar address validation
- ✅ Amount validation
- ✅ Minimum payout enforcement
- ✅ Error handling
- ✅ Session persistence
- ✅ Multi-wallet support

## Ready to Go!

Your affiliate dashboard is ready to use. Start by adding the route and testing with mock data, then integrate your backend API.

For questions, refer to the full documentation in README.md and INTEGRATION.md.
