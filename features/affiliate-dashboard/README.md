# Affiliate Dashboard Feature

A comprehensive affiliate program dashboard for stellAIverse that enables affiliates to manage referrals, track commissions, and request payouts.

## Features

### Core Functionality
- **Commission Tracking**: Real-time tracking of earned commissions from direct referrals and multi-tier referrals
- **Payout Requests**: Secure payout request system with status tracking
- **Referral Management**: View and manage all referral codes and their performance
- **Earnings Analytics**: Visual charts showing earnings trends and commission breakdown
- **Program Guidelines**: Clear display of affiliate program rules and requirements
- **Secure Login**: Stellar wallet-based authentication

### Components

#### Pages
- `page.tsx`: Main affiliate dashboard page with all sections

#### Components
- `AffiliateStats.tsx`: Key metrics cards (total referrals, earnings, payouts, conversion rate)
- `EarningsChart.tsx`: Line and bar charts for earnings visualization
- `ReferralTable.tsx`: Sortable and filterable referral records table
- `CommissionBreakdown.tsx`: Pie chart and detailed breakdown of commission sources
- `PayoutHistory.tsx`: Payout request history with status tracking and new request form

#### Hooks
- `useAffiliateData.ts`: Custom hook for affiliate data management and state

#### Services
- `affiliateService.ts`: API client for affiliate endpoints

#### State Management
- `useAffiliateStore.ts`: Zustand store for affiliate state (stats, referrals, payouts)

#### Types
- `types/index.ts`: TypeScript interfaces for all affiliate-related data

## Usage

### Basic Implementation

```tsx
import AffiliateDashboardPage from '@/features/affiliate-dashboard/page';

// In your app router
// app/affiliates/page.tsx
export default function AffiliatesPage() {
  return <AffiliateDashboardPage />;
}
```

### Using the Hook

```tsx
import { useAffiliateData } from '@/features/affiliate-dashboard/hooks/useAffiliateData';

const MyComponent = () => {
  const walletAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const {
    stats,
    referrals,
    commissionBreakdown,
    payoutRequests,
    isLoading,
    error,
    requestPayout,
    generateReferralCode,
  } = useAffiliateData(walletAddress);

  return (
    <div>
      <h1>Total Earnings: {stats?.totalEarnings} XLM</h1>
      <button onClick={() => generateReferralCode()}>
        Generate Code
      </button>
    </div>
  );
};
```

### Using the Store Directly

```tsx
import { useAffiliateStore } from '@/features/affiliate-dashboard/store/useAffiliateStore';

const MyComponent = () => {
  const { stats, fetchAffiliateData, requestPayout } = useAffiliateStore();

  return (
    <div>
      <p>Pending Earnings: {stats?.pendingEarnings} XLM</p>
    </div>
  );
};
```

## API Integration

### Endpoints

All endpoints require a valid Stellar wallet address for authentication.

#### Statistics
- `GET /api/affiliates/stats?wallet=<address>` - Get affiliate statistics
  - Returns: `AffiliateStats`

#### Referrals
- `GET /api/affiliates/referrals?wallet=<address>` - Get all referral records
  - Returns: `ReferralRecord[]`
- `POST /api/affiliates/referrals/generate` - Generate new referral code
  - Body: `{ walletAddress: string }`
  - Returns: `{ code: string, createdAt: string }`

#### Payouts
- `GET /api/affiliates/payouts?wallet=<address>` - Get payout history
  - Returns: `PayoutRequest[]`
- `POST /api/affiliates/payouts/request` - Request a payout
  - Body: `{ walletAddress: string, amount: string, destinationAddress: string }`
  - Returns: `PayoutRequest`

#### Program
- `GET /api/affiliates/program` - Get program details and guidelines
  - Returns: `AffiliateProgram`

#### Validation
- `GET /api/affiliates/validate?wallet=<address>` - Validate affiliate eligibility
  - Returns: `{ eligible: boolean, reason?: string, requirements: object }`

#### Earnings
- `GET /api/affiliates/earnings/history?wallet=<address>&days=<number>` - Get earnings history
  - Returns: `EarningsHistory[]`

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Commission Structure
The default commission structure is:
- **Direct**: 10% of referred user's trading volume
- **Tier 2**: 5% from users referred by your referrals
- **Tier 3**: 2% from users referred by tier 2 referrals

### Payout Settings
- **Minimum Payout**: 100 XLM
- **Payout Frequency**: Weekly
- **Processing Time**: 1-2 business days

## Security Considerations

### Authentication
- Stellar wallet-based authentication (Freighter, Albedo, Ledger)
- Session recovery from localStorage
- Multi-wallet support with delegation

### Data Protection
- All API calls include wallet address validation
- Stellar address format validation (56 chars, starts with G)
- Amount validation and minimum payout enforcement
- Transaction hash tracking for audit trail

### Best Practices
- Never expose private keys
- Validate all user inputs on frontend and backend
- Implement rate limiting on payout requests
- Log all affiliate activities for compliance
- Regular security audits of commission calculations

## Performance Optimizations

- React Query for server state caching (30s stale time)
- Zustand for efficient client state management
- Lazy loading of chart components
- Memoized calculations for commission breakdowns
- Debounced search and filter operations
- Efficient table rendering with virtualization support

## Browser Compatibility

- Modern browsers with ES6+ support
- Stellar wallet extensions (Freighter, Albedo, Ledger)
- Canvas API for chart rendering
- LocalStorage for session persistence

## Testing

Run tests with:
```bash
npm test -- features/affiliate-dashboard
```

### Test Coverage
- Component rendering and interactions
- Hook data fetching and state management
- API service calls and error handling
- Form validation and submission
- Chart data aggregation and visualization
- Payout request validation

## Acceptance Criteria

### Commission Tracking ✓
- [x] Display total earnings from all commission types
- [x] Show breakdown by commission tier (direct, tier2, tier3)
- [x] Track pending and completed earnings
- [x] Display conversion rates and referral statistics
- [x] Visualize earnings trends with charts

### Payout Requests ✓
- [x] Request payouts with validation
- [x] Enforce minimum payout amount (100 XLM)
- [x] Track payout status (pending, processing, completed, failed)
- [x] Display transaction hashes for completed payouts
- [x] Show payout history with dates and amounts

### Secure Login ✓
- [x] Stellar wallet authentication
- [x] Multi-wallet support
- [x] Session persistence
- [x] Wallet address validation
- [x] Error handling for connection failures

### Reports ✓
- [x] Earnings history with date range filtering
- [x] Commission breakdown by source
- [x] Referral performance metrics
- [x] Payout history and status tracking
- [x] Exportable data (CSV support ready)

### Affiliate Management ✓
- [x] Generate and manage referral codes
- [x] View all referrals with status
- [x] Filter and sort referral records
- [x] Track individual referral performance
- [x] Display program guidelines and requirements

## Definition of Done

- [x] All components implemented and tested
- [x] API endpoints created and documented
- [x] State management with Zustand store
- [x] Responsive design with Tailwind CSS
- [x] Cosmic theme integration
- [x] Error handling and validation
- [x] Loading states and animations
- [x] TypeScript type safety
- [x] README documentation
- [x] Security best practices implemented
- [x] Program active and ready for affiliates

## Future Enhancements

- Advanced analytics dashboard with custom date ranges
- Referral leaderboards and gamification
- A/B testing for referral messaging
- Bulk referral code generation
- Integration with more social platforms
- Automated payout scheduling
- Referral tier system with bonuses
- Real-time notifications for new referrals
- Export reports to PDF/Excel
- Affiliate performance benchmarking

## Support

For issues or questions about the affiliate program:
1. Check the program guidelines in the dashboard
2. Review the API documentation
3. Contact support through the platform
4. Check the FAQ section (coming soon)

## License

Part of the stellAIverse platform. See LICENSE file for details.
