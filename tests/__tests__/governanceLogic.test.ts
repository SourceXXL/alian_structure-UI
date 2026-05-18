import { isProposalApproved } from '@/lib/governance/stellar-governance';
import type { GovernanceConfig, Proposal } from '@/lib/governance/types';

const baseConfig: GovernanceConfig = {
  network: 'testnet',
  governanceAccount: 'GOV',
  treasuryAccount: 'TREASURY',
  governanceToken: {
    code: 'GOV',
    issuer: 'ISSUER',
  },
  sorobanContractId: 'CONTRACT',
  requiredApprovalRatio: 0.6,
  minQuorumRatio: 0.2,
  timelockSeconds: 3600,
};

function makeProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: '1',
    title: 'Test',
    description: 'desc',
    type: 'update_params',
    creator: 'CREATOR',
    createdAt: new Date().toISOString(),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: 'active',
    action: {
      type: 'update_params',
      params: { a: 1 },
    },
    approvals: 0,
    rejections: 0,
    abstentions: 0,
    totalVotingPowerAtCreation: 100,
    ...overrides,
  };
}

describe('isProposalApproved', () => {
  it('fails when quorum not reached', () => {
    const proposal = makeProposal({
      approvals: 5,
      rejections: 0,
      abstentions: 0,
      totalVotingPowerAtCreation: 100,
    });
    const approved = isProposalApproved(proposal, 100, baseConfig);
    expect(approved).toBe(false);
  });

  it('fails when approval ratio below threshold', () => {
    const proposal = makeProposal({
      approvals: 30,
      rejections: 30,
      abstentions: 0,
      totalVotingPowerAtCreation: 100,
    });
    const approved = isProposalApproved(proposal, 100, baseConfig);
    expect(approved).toBe(false);
  });

  it('passes when quorum and approval threshold met', () => {
    const proposal = makeProposal({
      approvals: 70,
      rejections: 10,
      abstentions: 0,
      totalVotingPowerAtCreation: 100,
    });
    const approved = isProposalApproved(proposal, 100, baseConfig);
    expect(approved).toBe(true);
  });
});

