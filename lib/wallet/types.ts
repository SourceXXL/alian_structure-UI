import { StellarNetwork } from "../types";

export interface LinkedWallet {
  publicKey: string;
  name: string;
  type: "freighter" | "albedo" | "ledger";
  network: StellarNetwork;
  isLinked: boolean;
  linkedAt: string;
}

export type DelegationStatus = "pending" | "granted" | "revoked";

export interface Delegation {
  id: string;
  granter: string;
  grantee: string;
  label: string;
  permissions: string[];
  status: DelegationStatus;
  createdAt: string;
}

export interface DelegationAuditLog {
  id: string;
  delegationId: string;
  action: "grant" | "revoke" | "use";
  actor: string;
  timestamp: string;
  details?: any;
}

export interface SessionRecoveryState {
  lastActiveAt: string;
  linkedWallets: LinkedWallet[];
  backupsEnabled: boolean;
}
