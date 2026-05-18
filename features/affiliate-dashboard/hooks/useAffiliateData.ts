import { useEffect } from 'react';
import { useAffiliateStore } from '../store/useAffiliateStore';

/**
 * Custom hook to manage affiliate data fetching and state
 * Handles wallet authentication and data synchronization
 */
export const useAffiliateData = (walletAddress: string | null) => {
  const {
    stats,
    referrals,
    commissionBreakdown,
    payoutRequests,
    program,
    earningsHistory,
    isLoading,
    error,
    fetchAffiliateData,
    requestPayout,
    generateReferralCode,
    clearError,
  } = useAffiliateStore();

  // Fetch data when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchAffiliateData(walletAddress);
    }
  }, [walletAddress, fetchAffiliateData]);

  return {
    // State
    stats,
    referrals,
    commissionBreakdown,
    payoutRequests,
    program,
    earningsHistory,
    isLoading,
    error,

    // Actions
    requestPayout,
    generateReferralCode,
    clearError,

    // Computed
    isAuthenticated: !!walletAddress,
    hasActiveProgram: program?.status === 'active',
    pendingPayouts: payoutRequests.filter((p) => p.status === 'pending'),
    completedPayouts: payoutRequests.filter((p) => p.status === 'completed'),
  };
};
