/* Type definitions for the application */
import { LinkedWallet, Delegation } from "./wallet/types";

export interface Agent {
  id: string;
  name: string;
  description: string;
  author: string;
  rating: number;
  users: number;
  behavior: string;
  capabilities: string[];
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  behavior: string;
  capabilities: string[];
}

export interface Portfolio {
  agentId: string;
  performance: number;
  interactions: number;
  lastUpdated: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  content: string;
  videoUrl?: string;
}

// Stellar Wallet Types
export type StellarNetwork = "mainnet" | "testnet" | "futurenet";

export interface StellarNetworkConfig {
  name: StellarNetwork;
  displayName: string;
  horizonUrl: string;
  rpcUrl?: string;
  networkPassphrase: string;
  color: string;
  badge: string;
}

export interface WalletBalance {
  asset: string;
  balance: string;
  assetCode?: string;
  assetIssuer?: string;
}

export interface StellarWallet {
  publicKey: string;
  name: string;
  type: "freighter" | "albedo" | "ledger";
  isConnected: boolean;
  balances: WalletBalance[];
  network: StellarNetwork;
}

export interface WalletContextType {
  wallet: StellarWallet | null;
  network: StellarNetwork;
  isConnecting: boolean;
  error: string | null;
  connectWallet: (
    walletType: "freighter" | "albedo" | "ledger",
  ) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: StellarNetwork) => Promise<void>;
  getBalance: () => Promise<WalletBalance[]>;
  clearError: () => void;
  // Multi-wallet & Delegation extensions
  linkedWallets: LinkedWallet[];
  delegations: Delegation[];
  linkWallet: (walletType: 'freighter' | 'albedo' | 'ledger') => Promise<void>;
  unlinkWallet: (publicKey: string) => void;
  manageDelegation: (delegation: Omit<Delegation, 'id' | 'createdAt'>) => Promise<void>;
  recoverSession: () => Promise<void>;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// Soroban Types
export interface SorobanContractSpec {
  id: string;
  name: string;
  fns: SorobanFunctionSpec[];
}

export interface SorobanFunctionSpec {
  name: string;
  args: { name: string; type: string }[];
  result: string;
}

export interface ResourceMetrics {
  cpuInstructions: number;
  ramBytes: number;
  ledgerReadBytes: number;
  ledgerWriteBytes: number;
  readCount: number;
  writeCount: number;
  costXlm: string;
}

export interface SorobanTransactionResult extends TransactionResult {
  metrics?: ResourceMetrics;
  events?: SorobanEvent[];
}

export interface SorobanEvent {
  type: string;
  contractId: string;
  topics: any[];
  value: any;
}

export interface StellarAsset {
  code: string;
  issuer: string;
  name?: string;
}

// Trading Bonus Types
export enum BonusType {
  REFERRAL = 'Referral',
  TRADING_VOLUME = 'Trading Volume',
  STAKING = 'Staking',
  LOYALTY = 'Loyalty',
  QUEST = 'Quest',
}

export interface TradingBonus {
  id: string;
  type: BonusType;
  amount: string; // XLM or other asset amount
  asset: string;
  timestamp: string;
  status: 'earned' | 'pending' | 'projected';
  description: string;
}

export interface BonusBreakdown {
  type: BonusType;
  totalAmount: string;
  count: number;
  color: string;
}

export interface BonusHistory {
  date: string;
  amount: number;
}
