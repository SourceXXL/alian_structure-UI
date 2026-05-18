'use client';

import React from 'react';
import { useAffiliateData } from './hooks/useAffiliateData';
import AffiliateStats from './components/AffiliateStats';
import EarningsChart from './components/EarningsChart';
import CommissionBreakdown from './components/CommissionBreakdown';
import ReferralTable from './components/ReferralTable';
import PayoutHistory from './components/PayoutHistory';
import Card from '@/components/Card';
import Button from '@/components/Button';

/**
 * Affiliate Dashboard Page
 * Displays commission tracking, payout requests, and referral management
 */
export default function AffiliateDashboardPage() {
  // Get wallet context - in real implementation, use useContext
  const walletAddress = null; // TODO: Get from StellarWalletProvider context

  const {
    stats,
    referrals,
    commissionBreakdown,
    payoutRequests,
    program,
    earningsHistory,
    isLoading,
    error,
    requestPayout,
    generateReferralCode,
    clearError,
    isAuthenticated,
    hasActiveProgram,
  } = useAffiliateData(walletAddress);

  // Handle authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Affiliate Dashboard</h1>
          <p className="text-cosmic-purple/60 mb-6">
            Connect your Stellar wallet to access the affiliate program and start earning commissions.
          </p>
          <Button variant="primary" size="lg" className="w-full">
            Connect Wallet
          </Button>
        </Card>
      </div>
    );
  }

  if (!hasActiveProgram) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Program Not Active</h1>
          <p className="text-cosmic-purple/60 mb-6">
            Your affiliate program is not currently active. Please contact support or check back later.
          </p>
          <Button variant="outline" size="lg" className="w-full">
            Contact Support
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Affiliate Dashboard</h1>
          <p className="text-cosmic-purple/60">
            Manage your referrals, track commissions, and request payouts
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
            <div className="flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </Card>
        )}

        {/* Program Guidelines */}
        {program && (
          <Card className="mb-8 bg-cosmic-purple/5 border-cosmic-purple/30">
            <div className="flex items-start gap-4">
              <div className="text-2xl">📋</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">Program Guidelines</h3>
                <ul className="text-sm text-cosmic-purple/70 space-y-1">
                  {program.guidelines.map((guideline: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-cosmic-blue mt-1">•</span>
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Section */}
        <div className="mb-8">
          <AffiliateStats stats={stats} isLoading={isLoading} />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <EarningsChart data={earningsHistory} isLoading={isLoading} />
        </div>

        {/* Commission Breakdown */}
        <div className="mb-8">
          <CommissionBreakdown data={commissionBreakdown} isLoading={isLoading} />
        </div>

        {/* Payout Management */}
        <div className="mb-8">
          <PayoutHistory
            payouts={payoutRequests}
            isLoading={isLoading}
            onRequestPayout={requestPayout}
            pendingEarnings={stats?.pendingEarnings || '0.00'}
            minimumPayout={program?.minimumPayout || '100.00'}
          />
        </div>

        {/* Referral Management */}
        <div className="mb-8">
          <ReferralTable referrals={referrals} isLoading={isLoading} />
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => generateReferralCode()}
              className="w-full"
            >
              Generate New Referral Code
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
            >
              Share Referral Link
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
