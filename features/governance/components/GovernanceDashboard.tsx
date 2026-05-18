'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStellarWallet } from '@/components/context/StellarWalletProvider';
import { formatXlmAmount } from '@/lib/stellar';
import {
  GovernanceConfig,
  Proposal,
  VoteChoice,
  TreasuryBalance,
  TreasuryTransaction,
} from '@/lib/governance/types';
import {
  getTreasuryBalance,
  getTreasuryHistory,
  isProposalApproved,
} from '@/lib/governance/stellar-governance';

interface GovernanceDashboardProps {
  config: GovernanceConfig;
  proposals: Proposal[];
  onCreateProposal: () => void;
  onVote: (proposal: Proposal, choice: VoteChoice) => void;
  onExecute: (proposal: Proposal) => void;
}

export function GovernanceDashboard({
  config,
  proposals,
  onCreateProposal,
  onVote,
  onExecute,
}: GovernanceDashboardProps) {
  const { wallet } = useStellarWallet();

  const { data: treasuryBalance } = useQuery<TreasuryBalance>({
    queryKey: ['treasury-balance', config.treasuryAccount, config.network],
    queryFn: () => getTreasuryBalance(config),
    refetchInterval: 15_000,
  });

  const { data: treasuryHistory } = useQuery<TreasuryTransaction[]>({
    queryKey: ['treasury-history', config.treasuryAccount, config.network],
    queryFn: () => getTreasuryHistory(config),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Agent Governance</h1>
          <p className="text-gray-300">
            Manage upgrades, parameters, and treasury for this agent via Stellar multisig
            and Soroban voting.
          </p>
        </div>
        <button
          onClick={onCreateProposal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-blue font-semibold hover:shadow-lg hover:shadow-cosmic-purple/40 transition-smooth disabled:opacity-50"
          disabled={!wallet}
        >
          Create Proposal
        </button>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-4 rounded-lg border border-cosmic-purple/40 nebula-bg">
          <h2 className="text-lg font-semibold glow-text mb-2">Treasury (XLM)</h2>
          <p className="text-3xl font-bold">
            {treasuryBalance ? formatXlmAmount(treasuryBalance.balanceXlm) : '...'}
          </p>
          <p className="text-xs text-gray-400 break-all mt-2">
            {config.treasuryAccount}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-cosmic-purple/40 nebula-bg">
          <h2 className="text-lg font-semibold glow-text mb-2">Quorum</h2>
          <p className="text-xl">
            {Math.round(config.minQuorumRatio * 100)}% required participation
          </p>
          <p className="text-sm text-gray-400">
            {Math.round(config.requiredApprovalRatio * 100)}% approvals to pass
          </p>
        </div>
        <div className="p-4 rounded-lg border border-cosmic-purple/40 nebula-bg">
          <h2 className="text-lg font-semibold glow-text mb-2">Network</h2>
          <p className="text-xl capitalize">{config.network}</p>
          <p className="text-sm text-gray-400">Multisig owner: {config.governanceAccount}</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold glow-text">Proposals</h2>
          </div>

          <div className="space-y-3">
            {proposals.length === 0 && (
              <p className="text-gray-400 text-sm">No proposals yet. Be the first to create one.</p>
            )}
            {proposals.map((proposal) => {
              const totalVotes =
                proposal.approvals + proposal.rejections + proposal.abstentions;
              const approvalRatio =
                totalVotes === 0 ? 0 : proposal.approvals / totalVotes;
              const approved = isProposalApproved(
                proposal,
                proposal.totalVotingPowerAtCreation,
                config
              );

              return (
                <div
                  key={proposal.id}
                  className="p-4 rounded-lg border border-cosmic-purple/40 hover:border-cosmic-purple/70 transition-smooth nebula-bg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold glow-text">
                        {proposal.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {proposal.type} • Created by {proposal.creator}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        proposal.status === 'executed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : proposal.status === 'active'
                          ? 'bg-blue-500/20 text-blue-300'
                          : proposal.status === 'failed'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}
                    >
                      {proposal.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-2">{proposal.description}</p>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Approvals</span>
                      <span>{Math.round(approvalRatio * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-cosmic-nebula transition-all"
                        style={{ width: `${approvalRatio * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 mt-1">
                      <span>✅ {proposal.approvals}</span>
                      <span>❌ {proposal.rejections}</span>
                      <span>⏸ {proposal.abstentions}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onVote(proposal, 'approve')}
                      disabled={!wallet || proposal.status !== 'active'}
                      className="px-3 py-1 rounded-md border border-emerald-500/60 text-emerald-300 text-xs hover:bg-emerald-500/10 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onVote(proposal, 'reject')}
                      disabled={!wallet || proposal.status !== 'active'}
                      className="px-3 py-1 rounded-md border border-red-500/60 text-red-300 text-xs hover:bg-red-500/10 disabled:opacity-40"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onVote(proposal, 'abstain')}
                      disabled={!wallet || proposal.status !== 'active'}
                      className="px-3 py-1 rounded-md border border-gray-500/60 text-gray-300 text-xs hover:bg-gray-500/10 disabled:opacity-40"
                    >
                      Abstain
                    </button>
                    {approved && proposal.status === 'active' && (
                      <button
                        onClick={() => onExecute(proposal)}
                        className="ml-auto px-3 py-1 rounded-md bg-gradient-to-r from-cosmic-nebula to-cosmic-purple text-xs font-semibold hover:shadow-md hover:shadow-cosmic-purple/40"
                      >
                        Execute On-Chain
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold glow-text">Treasury Activity</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {!treasuryHistory && (
              <p className="text-gray-400 text-sm">Loading treasury history...</p>
            )}
            {treasuryHistory &&
              treasuryHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg border border-cosmic-purple/30 text-xs nebula-bg"
                >
                  <div className="flex justify-between mb-1">
                    <span
                      className={
                        tx.type === 'incoming'
                          ? 'text-emerald-300'
                          : tx.type === 'outgoing'
                          ? 'text-red-300'
                          : 'text-gray-300'
                      }
                    >
                      {tx.type.toUpperCase()}
                    </span>
                    <span className="text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-200">
                    {tx.amountXlm} XLM
                  </div>
                  <div className="text-gray-400 mt-1">
                    <div>From: {tx.source}</div>
                    <div>To: {tx.destination}</div>
                  </div>
                  {tx.memo && (
                    <div className="text-gray-400 mt-1">Memo: {tx.memo}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

