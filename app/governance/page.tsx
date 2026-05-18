'use client';

import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useStellarWallet } from '@/components/context/StellarWalletProvider';
import { GovernanceDashboard } from '@/features/governance/components/GovernanceDashboard';
import { PolicyManager } from '@/features/governance/components/PolicyManager';
import {
  GovernanceConfig,
  Proposal,
  ProposalAction,
  VoteChoice,
} from '@/lib/governance/types';
import {
  buildSorobanProposalTx,
  buildSorobanVoteTx,
  buildExecuteProposalTx,
  isProposalApproved,
} from '@/lib/governance/stellar-governance';
import { signTransactionWithFreighter, submitTransaction } from '@/lib/stellar';
import { DEFAULT_NETWORK } from '@/lib/stellar-constants';

const MOCK_CONFIG: GovernanceConfig = {
  network: DEFAULT_NETWORK,
  governanceAccount: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  treasuryAccount: 'GYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
  governanceToken: {
    code: 'GOV',
    issuer: 'GZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  },
  sorobanContractId: 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  requiredApprovalRatio: 0.6,
  minQuorumRatio: 0.2,
  timelockSeconds: 3600,
};

export default function GovernancePage() {
  const { wallet } = useStellarWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const createProposalMutation = useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      action: ProposalAction;
    }) => {
      if (!wallet) throw new Error('Wallet not connected');
      const proposalId = `${Date.now()}`;
      const tx = buildSorobanProposalTx({
        config: MOCK_CONFIG,
        creator: wallet.publicKey,
        proposalId,
        title: input.title,
        description: input.description,
        action: input.action,
      });
      const signed = await signTransactionWithFreighter(tx, wallet.network);
      if (!signed.success) throw new Error(signed.error || 'Failed to sign');
      const submitResult = await submitTransaction(
        tx.toEnvelope().toXDR('base64'),
        wallet.network
      );
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Failed to submit');
      }
      const now = new Date();
      const start = now.toISOString();
      const end = new Date(now.getTime() + MOCK_CONFIG.timelockSeconds * 1000).toISOString();
      const votingPowerAtCreation = 0;
      const proposal: Proposal = {
        id: proposalId,
        title: input.title,
        description: input.description,
        type: input.action.type,
        creator: wallet.publicKey,
        createdAt: now.toISOString(),
        startTime: start,
        endTime: end,
        status: 'active',
        action: input.action,
        approvals: 0,
        rejections: 0,
        abstentions: 0,
        totalVotingPowerAtCreation: votingPowerAtCreation,
      };
      setProposals((prev) => [proposal, ...prev]);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (params: { proposal: Proposal; choice: VoteChoice }) => {
      if (!wallet) throw new Error('Wallet not connected');
      const tx = buildSorobanVoteTx({
        config: MOCK_CONFIG,
        voter: wallet.publicKey,
        proposalId: params.proposal.id,
        choice: params.choice,
      });
      const signed = await signTransactionWithFreighter(tx, wallet.network);
      if (!signed.success) throw new Error(signed.error || 'Failed to sign');
      const submitResult = await submitTransaction(
        tx.toEnvelope().toXDR('base64'),
        wallet.network
      );
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Failed to submit');
      }
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== params.proposal.id) return p;
          return {
            ...p,
            approvals:
              params.choice === 'approve' ? p.approvals + 1 : p.approvals,
            rejections:
              params.choice === 'reject' ? p.rejections + 1 : p.rejections,
            abstentions:
              params.choice === 'abstain' ? p.abstentions + 1 : p.abstentions,
          };
        })
      );
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (proposal: Proposal) => {
      if (!wallet) throw new Error('Wallet not connected');
      const totalVotingPower =
        proposal.totalVotingPowerAtCreation || proposal.approvals + proposal.rejections + proposal.abstentions;
      const approved = isProposalApproved(
        proposal,
        totalVotingPower,
        MOCK_CONFIG
      );
      if (!approved) throw new Error('Proposal not approved by governance rules');
      const tx = buildExecuteProposalTx({
        config: MOCK_CONFIG,
        executor: wallet.publicKey,
        proposalId: proposal.id,
      });
      const signed = await signTransactionWithFreighter(tx, wallet.network);
      if (!signed.success) throw new Error(signed.error || 'Failed to sign');
      const submitResult = await submitTransaction(
        tx.toEnvelope().toXDR('base64'),
        wallet.network
      );
      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Failed to submit');
      }
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id ? { ...p, status: 'executed' } : p
        )
      );
    },
  });

  const handleCreateProposal = () => {
    if (!wallet) return;
    const title = prompt('Proposal title') || 'Untitled proposal';
    const description = prompt('Proposal description') || '';
    const action: ProposalAction = {
      type: 'update_params',
      params: {
        example_param: 'value',
      },
    };
    createProposalMutation.mutate({ title, description, action });
  };

  const handleVote = (proposal: Proposal, choice: VoteChoice) => {
    voteMutation.mutate({ proposal, choice });
  };

  const handleExecute = (proposal: Proposal) => {
    executeMutation.mutate(proposal);
  };

  return (
    <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto space-y-8">
      <GovernanceDashboard
        config={MOCK_CONFIG}
        proposals={proposals}
        onCreateProposal={handleCreateProposal}
        onVote={handleVote}
        onExecute={handleExecute}
      />

      <div className="pt-20 border-t border-white/5">
         <PolicyManager />
      </div>
    </main>
  );
}

