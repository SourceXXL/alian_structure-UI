export type AnalyticsRange = '7d' | '30d' | '90d' | '1y';

export interface StellarTransactionRecord {
  id: string;
  hash: string;
  createdAt: string;
  successful: boolean;
  feeChargedStroops: string;
  sourceAccount: string;
}

export interface StellarOperationRecord {
  id: string;
  transactionHash: string;
  createdAt: string;
  type: string;
  sourceAccount?: string;
  amount?: string;
  startingBalance?: string;
  soldAmount?: string;
  boughtAmount?: string;
  transactionSuccessful?: boolean;
}

export interface AnalyticsTimeSeriesPoint {
  date: string;
  contractInvocations: number;
  successRate: number;
  avgExecutionCostXlm: number;
  xlmRevenue: number;
  transactionFrequency: number;
  uniqueAccounts: number;
}

export interface RevenueBreakdownItem {
  type: string;
  xlm: number;
  percentage: number;
}

export interface AgentAnalyticsSummary {
  agentId: string;
  agentName: string;
  totalContractInvocations: number;
  successRate: number;
  avgExecutionCostXlm: number;
  xlmRevenue: number;
  uniqueAccounts: number;
  transactionFrequency: number;
}

export interface AnalyticsDataset {
  range: AnalyticsRange;
  generatedAt: string;
  totals: {
    totalContractInvocations: number;
    successRate: number;
    avgExecutionCostXlm: number;
    xlmRevenue: number;
    uniqueAccounts: number;
    transactionFrequency: number;
  };
  revenueBreakdown: RevenueBreakdownItem[];
  timeSeries: AnalyticsTimeSeriesPoint[];
  ownedAgents: AgentAnalyticsSummary[];
  topMarketplaceAgents: AgentAnalyticsSummary[];
}

export interface HorizonStreamEvent {
  type: 'transaction';
  transaction: StellarTransactionRecord;
}
