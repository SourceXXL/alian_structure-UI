'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { PayoutRequest } from '../types';

interface PayoutHistoryProps {
  payouts: PayoutRequest[];
  isLoading: boolean;
  onRequestPayout: (amount: string) => void;
  pendingEarnings: string;
  minimumPayout: string;
}

export const PayoutHistory: React.FC<PayoutHistoryProps> = ({
  payouts,
  isLoading,
  onRequestPayout,
  pendingEarnings,
  minimumPayout,
}) => {
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    const minimum = parseFloat(minimumPayout);
    const pending = parseFloat(pendingEarnings);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount < minimum) {
      alert(`Minimum payout is ${minimum} XLM`);
      return;
    }

    if (amount > pending) {
      alert(`Insufficient pending earnings. Available: ${pending} XLM`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onRequestPayout(payoutAmount);
      setPayoutAmount('');
      setShowPayoutForm(false);
    } catch (error) {
      console.error('Payout request failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⟳';
      case 'pending':
        return '⏱';
      case 'failed':
        return '✕';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'pending':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10';
      case 'processing':
        return 'bg-yellow-500/10';
      case 'pending':
        return 'bg-blue-500/10';
      case 'failed':
        return 'bg-red-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-96 bg-cosmic-purple/20 rounded" />
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Payout Management</h3>
            <p className="text-sm text-cosmic-purple/60">
              Pending: <span className="text-cosmic-blue font-semibold">{pendingEarnings} XLM</span>
              {' | '}
              Minimum: <span className="text-cosmic-purple font-semibold">{minimumPayout} XLM</span>
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowPayoutForm(!showPayoutForm)}
            disabled={parseFloat(pendingEarnings) < parseFloat(minimumPayout)}
          >
            {showPayoutForm ? 'Cancel' : 'Request Payout'}
          </Button>
        </div>

        {/* Payout Form */}
        {showPayoutForm && (
          <div className="mb-6 p-4 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/30">
            <h4 className="font-semibold text-white mb-4">Request Payout</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-cosmic-purple/60 mb-2">Amount (XLM)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={`Min: ${minimumPayout}, Max: ${pendingEarnings}`}
                  className="w-full bg-cosmic-dark/50 border border-cosmic-purple/30 rounded px-4 py-2 text-white placeholder-cosmic-purple/40 focus:outline-none focus:border-cosmic-purple/60"
                  step="0.01"
                  min={minimumPayout}
                  max={pendingEarnings}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRequestPayout}
                  disabled={isSubmitting || !payoutAmount}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Payout'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setShowPayoutForm(false);
                    setPayoutAmount('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payout History */}
        {payouts && payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className={`p-4 rounded-lg border border-cosmic-purple/20 ${getStatusBg(
                  payout.status
                )} hover:border-cosmic-purple/40 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xl ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{payout.amount} XLM</p>
                        <p className="text-xs text-cosmic-purple/60">
                          {new Date(payout.requestedAt).toLocaleDateString()} at{' '}
                          {new Date(payout.requestedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBg(
                        payout.status
                      )} ${getStatusColor(payout.status)} capitalize`}
                    >
                      {payout.status}
                    </span>
                    {payout.transactionHash && (
                      <p className="text-xs text-cosmic-purple/40 mt-2 truncate">
                        {payout.transactionHash}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-cosmic-purple/60">
            No payout requests yet
          </div>
        )}
      </div>
    </Card>
  );
};

export default PayoutHistory;
