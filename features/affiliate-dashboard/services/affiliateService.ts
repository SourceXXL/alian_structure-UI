import { apiClient } from '@/lib/api';
import {
  AffiliateStats,
  ReferralRecord,
  PayoutRequest,
  AffiliateProgram,
} from '../types';

const API_BASE = '/api/affiliates';

export const affiliateService = {
  /**
   * Fetch affiliate statistics for the authenticated user
   */
  getStats: async (walletAddress: string): Promise<AffiliateStats> => {
    return apiClient.get(`${API_BASE}/stats?wallet=${walletAddress}`);
  },

  /**
   * Fetch all referral records for the affiliate
   */
  getReferrals: async (walletAddress: string): Promise<ReferralRecord[]> => {
    return apiClient.get(`${API_BASE}/referrals?wallet=${walletAddress}`);
  },

  /**
   * Fetch payout history and pending requests
   */
  getPayoutRequests: async (walletAddress: string): Promise<PayoutRequest[]> => {
    return apiClient.get(`${API_BASE}/payouts?wallet=${walletAddress}`);
  },

  /**
   * Fetch affiliate program details
   */
  getProgram: async (): Promise<AffiliateProgram> => {
    return apiClient.get(`${API_BASE}/program`);
  },

  /**
   * Request a payout
   */
  requestPayout: async (
    walletAddress: string,
    amount: string,
    destinationAddress: string
  ): Promise<PayoutRequest> => {
    return apiClient.post(`${API_BASE}/payouts/request`, {
      walletAddress,
      amount,
      destinationAddress,
    });
  },

  /**
   * Generate a new referral code
   */
  generateReferralCode: async (walletAddress: string): Promise<{ code: string }> => {
    return apiClient.post(`${API_BASE}/referrals/generate`, {
      walletAddress,
    });
  },

  /**
   * Get referral link for sharing
   */
  getReferralLink: async (code: string): Promise<{ link: string }> => {
    return apiClient.get(`${API_BASE}/referrals/${code}/link`);
  },

  /**
   * Validate affiliate eligibility
   */
  validateEligibility: async (walletAddress: string): Promise<{ eligible: boolean; reason?: string }> => {
    return apiClient.get(`${API_BASE}/validate?wallet=${walletAddress}`);
  },

  /**
   * Get earnings history for charts
   */
  getEarningsHistory: async (
    walletAddress: string,
    days: number = 30
  ): Promise<Array<{ date: string; amount: number; source: string }>> => {
    return apiClient.get(`${API_BASE}/earnings/history?wallet=${walletAddress}&days=${days}`);
  },
};
