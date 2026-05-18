import { create } from 'zustand';
import {
  AffiliateStats,
  ReferralRecord,
  CommissionBreakdown,
  PayoutRequest,
  AffiliateProgram,
  EarningsHistory,
} from '../types';

interface AffiliateStore {
  // State
  stats: AffiliateStats | null;
  referrals: ReferralRecord[];
  commissionBreakdown: CommissionBreakdown[];
  payoutRequests: PayoutRequest[];
  program: AffiliateProgram | null;
  earningsHistory: EarningsHistory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAffiliateData: (walletAddress: string) => Promise<void>;
  requestPayout: (amount: string, walletAddress: string) => Promise<void>;
  generateReferralCode: () => Promise<string>;
  clearError: () => void;
}

const MOCK_STATS: AffiliateStats = {
  totalReferrals: 42,
  activeReferrals: 38,
  totalEarnings: '2450.75',
  pendingEarnings: '325.50',
  totalPayouts: '2125.25',
  conversionRate: 90.5,
};

const MOCK_REFERRALS: ReferralRecord[] = [
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
  {
    id: '3',
    referralCode: 'ASTR003',
    referredUserAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    status: 'inactive',
    commissionRate: 10,
    commissionAmount: '0.00',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

const MOCK_COMMISSION_BREAKDOWN: CommissionBreakdown[] = [
  {
    type: 'direct',
    amount: '2100.50',
    percentage: 85.7,
    count: 35,
  },
  {
    type: 'tier2',
    amount: '300.25',
    percentage: 12.2,
    count: 5,
  },
  {
    type: 'tier3',
    amount: '50.00',
    percentage: 2.1,
    count: 2,
  },
];

const MOCK_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: '1',
    amount: '500.00',
    status: 'completed',
    requestedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 29).toISOString(),
    walletAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    transactionHash: '0x1234567890abcdef',
  },
  {
    id: '2',
    amount: '750.00',
    status: 'completed',
    requestedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    walletAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    transactionHash: '0xfedcba0987654321',
  },
  {
    id: '3',
    amount: '325.50',
    status: 'pending',
    requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    walletAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  },
];

const MOCK_PROGRAM: AffiliateProgram = {
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

const MOCK_EARNINGS_HISTORY: EarningsHistory[] = [
  { date: '2024-04-18', amount: 45, source: 'direct' },
  { date: '2024-04-19', amount: 52, source: 'direct' },
  { date: '2024-04-20', amount: 48, source: 'tier2' },
  { date: '2024-04-21', amount: 70, source: 'direct' },
  { date: '2024-04-22', amount: 65, source: 'direct' },
  { date: '2024-04-23', amount: 90, source: 'direct' },
  { date: '2024-04-24', amount: 85, source: 'tier2' },
];

export const useAffiliateStore = create<AffiliateStore>((set) => ({
  stats: null,
  referrals: [],
  commissionBreakdown: [],
  payoutRequests: [],
  program: null,
  earningsHistory: [],
  isLoading: false,
  error: null,

  fetchAffiliateData: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!walletAddress) {
        throw new Error('Wallet address required');
      }

      set({
        stats: MOCK_STATS,
        referrals: MOCK_REFERRALS,
        commissionBreakdown: MOCK_COMMISSION_BREAKDOWN,
        payoutRequests: MOCK_PAYOUT_REQUESTS,
        program: MOCK_PROGRAM,
        earningsHistory: MOCK_EARNINGS_HISTORY,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch affiliate data',
        isLoading: false,
      });
    }
  },

  requestPayout: async (amount: string, walletAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid payout amount');
      }

      if (!walletAddress) {
        throw new Error('Wallet address required');
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newRequest: PayoutRequest = {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        walletAddress,
      };

      set((state) => ({
        payoutRequests: [newRequest, ...state.payoutRequests],
        stats: state.stats
          ? {
              ...state.stats,
              pendingEarnings: (
                parseFloat(state.stats.pendingEarnings) - amountNum
              ).toFixed(2),
            }
          : null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to request payout',
        isLoading: false,
      });
    }
  },

  generateReferralCode: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const code = `ASTR${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      set({ isLoading: false });
      return code;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate referral code',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
