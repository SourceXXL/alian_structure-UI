import {
  AgentAnalyticsSummary,
  AnalyticsDataset,
  AnalyticsRange,
  AnalyticsTimeSeriesPoint,
  RevenueBreakdownItem,
  StellarOperationRecord,
  StellarTransactionRecord,
} from './types';
import { formatDateKey, getRangeStartDate } from './range';

function toNumber(value?: string): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toXlmFromStroops(stroops?: string): number {
  const stroopsValue = Number.parseInt(stroops || '0', 10);
  if (!Number.isFinite(stroopsValue)) return 0;
  return stroopsValue / 10_000_000;
}

export function extractOperationRevenueXlm(operation: StellarOperationRecord): number {
  switch (operation.type) {
    case 'payment':
    case 'path_payment_strict_receive':
    case 'path_payment_strict_send':
      return toNumber(operation.amount);
    case 'create_account':
      return toNumber(operation.startingBalance);
    case 'manage_sell_offer':
      return toNumber(operation.soldAmount);
    case 'manage_buy_offer':
      return toNumber(operation.boughtAmount);
    default:
      return 0;
  }
}

function operationTypeLabel(type: string): string {
  if (type === 'invoke_host_function') return 'contract_invocation';
  if (type.includes('payment')) return 'payment';
  if (type.includes('offer')) return 'offer';
  if (type === 'create_account') return 'create_account';
  return 'other';
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, current) => acc + current, 0) / values.length;
}

function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function calculateAgentSummary(input: {
  agentId: string;
  agentName: string;
  transactions: StellarTransactionRecord[];
  operations: StellarOperationRecord[];
}): AgentAnalyticsSummary {
  const { agentId, agentName, transactions, operations } = input;

  const totalContractInvocations = operations.filter((op) => op.type === 'invoke_host_function').length;
  const successfulTransactions = transactions.filter((tx) => tx.successful).length;
  const successRate = transactions.length === 0 ? 0 : (successfulTransactions / transactions.length) * 100;
  const avgExecutionCostXlm = average(transactions.map((tx) => toXlmFromStroops(tx.feeChargedStroops)));
  const xlmRevenue = operations.reduce((acc, op) => acc + extractOperationRevenueXlm(op), 0);

  const uniqueAccounts = new Set(
    transactions.map((tx) => tx.sourceAccount).filter(Boolean)
  ).size;

  const first = transactions[0]?.createdAt;
  const last = transactions[transactions.length - 1]?.createdAt;
  const days = first && last
    ? Math.max(1, (new Date(first).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const transactionFrequency = transactions.length / days;

  return {
    agentId,
    agentName,
    totalContractInvocations,
    successRate,
    avgExecutionCostXlm,
    xlmRevenue,
    uniqueAccounts,
    transactionFrequency,
  };
}

export function buildAnalyticsDataset(input: {
  range: AnalyticsRange;
  ownedAgents: Array<{
    agentId: string;
    agentName: string;
    transactions: StellarTransactionRecord[];
    operations: StellarOperationRecord[];
  }>;
  topMarketplaceAgents: Array<{
    agentId: string;
    agentName: string;
    transactions: StellarTransactionRecord[];
    operations: StellarOperationRecord[];
  }>;
}): AnalyticsDataset {
  const { range, ownedAgents, topMarketplaceAgents } = input;

  const ownedAgentSummaries = ownedAgents.map((item) => calculateAgentSummary(item));
  const topMarketplaceSummaries = topMarketplaceAgents.map((item) => calculateAgentSummary(item));

  const allOwnedTransactions = ownedAgents.flatMap((item) => item.transactions);
  const allOwnedOperations = ownedAgents.flatMap((item) => item.operations);

  const startDate = getRangeStartDate(range);
  const dayBuckets = new Map<string, {
    invocations: number;
    tx: number;
    successfulTx: number;
    feeXlm: number[];
    revenueXlm: number;
    accounts: Set<string>;
  }>();

  for (let i = 0; i < 370; i += 1) {
    const cursorDate = new Date(startDate);
    cursorDate.setUTCDate(cursorDate.getUTCDate() + i);
    const key = formatDateKey(cursorDate);
    dayBuckets.set(key, {
      invocations: 0,
      tx: 0,
      successfulTx: 0,
      feeXlm: [],
      revenueXlm: 0,
      accounts: new Set(),
    });
    if (key === formatDateKey(new Date())) {
      break;
    }
  }

  allOwnedTransactions.forEach((tx) => {
    const key = formatDateKey(tx.createdAt);
    const bucket = dayBuckets.get(key);
    if (!bucket) return;
    bucket.tx += 1;
    if (tx.successful) bucket.successfulTx += 1;
    bucket.feeXlm.push(toXlmFromStroops(tx.feeChargedStroops));
    if (tx.sourceAccount) bucket.accounts.add(tx.sourceAccount);
  });

  allOwnedOperations.forEach((operation) => {
    const key = formatDateKey(operation.createdAt);
    const bucket = dayBuckets.get(key);
    if (!bucket) return;
    if (operation.type === 'invoke_host_function') bucket.invocations += 1;
    bucket.revenueXlm += extractOperationRevenueXlm(operation);
  });

  const timeSeries: AnalyticsTimeSeriesPoint[] = Array.from(dayBuckets.entries()).map(([date, bucket]) => ({
    date,
    contractInvocations: bucket.invocations,
    successRate: percentage(bucket.successfulTx, bucket.tx),
    avgExecutionCostXlm: average(bucket.feeXlm),
    xlmRevenue: bucket.revenueXlm,
    transactionFrequency: bucket.tx,
    uniqueAccounts: bucket.accounts.size,
  }));

  const revenueByType = new Map<string, number>();
  allOwnedOperations.forEach((operation) => {
    const key = operationTypeLabel(operation.type);
    revenueByType.set(key, (revenueByType.get(key) || 0) + extractOperationRevenueXlm(operation));
  });

  const totalRevenue = Array.from(revenueByType.values()).reduce((acc, value) => acc + value, 0);
  const revenueBreakdown: RevenueBreakdownItem[] = Array.from(revenueByType.entries()).map(([type, xlm]) => ({
    type,
    xlm,
    percentage: percentage(xlm, totalRevenue),
  }));

  const totals = {
    totalContractInvocations: allOwnedOperations.filter((op) => op.type === 'invoke_host_function').length,
    successRate: percentage(
      allOwnedTransactions.filter((tx) => tx.successful).length,
      allOwnedTransactions.length
    ),
    avgExecutionCostXlm: average(allOwnedTransactions.map((tx) => toXlmFromStroops(tx.feeChargedStroops))),
    xlmRevenue: totalRevenue,
    uniqueAccounts: new Set(allOwnedTransactions.map((tx) => tx.sourceAccount).filter(Boolean)).size,
    transactionFrequency:
      timeSeries.reduce((acc, point) => acc + point.transactionFrequency, 0) / Math.max(1, timeSeries.length),
  };

  return {
    range,
    generatedAt: new Date().toISOString(),
    totals,
    revenueBreakdown,
    timeSeries,
    ownedAgents: ownedAgentSummaries,
    topMarketplaceAgents: topMarketplaceSummaries
      .sort((a, b) => b.xlmRevenue - a.xlmRevenue)
      .slice(0, 10),
  };
}
