/**
 * Represents the deployment status of a Soroban contract version on the Stellar ledger.
 */
export type VersionStatus = 'stable' | 'beta' | 'deprecated';

/**
 * Represents the data schema of the contract. 
 * Used to compare versions side-by-side and detect state schema changes.
 */
export interface ContractStateSchema {
  fields: Record<string, string>; // e.g., { "userBalance": "i128", "admin": "address" }
}

/**
 * Core metadata for a specific agent contract version stored on-chain.
 */
export interface VersionMetadata {
  version: string;             // Semantic versioning (e.g., "1.0.2")
  contractId: string;          // The actual Soroban contract ID on the network
  timestamp: number;           // Unix timestamp of deployment
  author: string;              // Stellar public key (address) of the deployer
  changelog: string;           // On-chain changelog entries
  status: VersionStatus;       // Marker for stable/beta/deprecated
  stateSchema: ContractStateSchema; 
}

/**
 * Represents a community voting proposal for scheduling an upgrade.
 */
export interface UpgradeProposal {
  proposalId: string;
  targetVersion: string;       // The version being proposed
  newContractId: string;       // The Soroban contract ID for the upgrade
  scheduledExecutionTime: number; // When the upgrade should happen if passed
  votesFor: number;
  votesAgainst: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
}