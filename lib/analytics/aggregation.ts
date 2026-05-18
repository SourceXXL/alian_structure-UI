import { STELLAR_NETWORKS } from '@/lib/stellar-constants';
import { StellarNetwork } from '@/lib/types';
import { buildAnalyticsDataset } from './metrics';
import { getRangeStartDate } from './range';
import {
  AnalyticsDataset,
  AnalyticsRange,
  StellarOperationRecord,
  StellarTransactionRecord,
} from './types';

interface AgentTarget {
  agentId: string;
  agentName: string;
}

const MAX_RECORDS_PER_AGENT = 200;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed fetching ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function parseTransaction(record: any): StellarTransactionRecord {
  return {
    id: record.id,
    hash: record.hash,
    createdAt: record.created_at,
    successful: Boolean(record.successful),
    feeChargedStroops: String(record.fee_charged || '0'),
    sourceAccount: record.source_account || '',
  };
}

function parseOperation(record: any): StellarOperationRecord {
  return {
    id: record.id,
    transactionHash: record.transaction_hash,
    createdAt: record.created_at,
    type: record.type,
    sourceAccount: record.source_account,
    amount: record.amount,
    startingBalance: record.starting_balance,
    soldAmount: record.amount,
    boughtAmount: record.amount,
    transactionSuccessful: record.transaction_successful,
  };
}

async function fetchAgentLedgerData(input: {
  network: StellarNetwork;
  range: AnalyticsRange;
  agent: AgentTarget;
}): Promise<{ transactions: StellarTransactionRecord[]; operations: StellarOperationRecord[] }> {
  const { network, range, agent } = input;
  const horizonUrl = STELLAR_NETWORKS[network].horizonUrl;
  const startDate = getRangeStartDate(range);

  const [transactionsResponse, operationsResponse] = await Promise.all([
    fetchJson<any>(
      `${horizonUrl}/accounts/${agent.agentId}/transactions?order=desc&limit=${MAX_RECORDS_PER_AGENT}`
    ),
    fetchJson<any>(
      `${horizonUrl}/accounts/${agent.agentId}/operations?order=desc&limit=${MAX_RECORDS_PER_AGENT}`
    ),
  ]);

  const transactions = (transactionsResponse?._embedded?.records || [])
    .map(parseTransaction)
    .filter((record: StellarTransactionRecord) => new Date(record.createdAt) >= startDate);

  const operations = (operationsResponse?._embedded?.records || [])
    .map(parseOperation)
    .filter((record: StellarOperationRecord) => new Date(record.createdAt) >= startDate);

  return { transactions, operations };
}

export async function aggregateAnalytics(input: {
  network: StellarNetwork;
  range: AnalyticsRange;
  ownedAgents: AgentTarget[];
  marketplaceAgents: AgentTarget[];
}): Promise<AnalyticsDataset> {
  const { network, range, ownedAgents, marketplaceAgents } = input;

  const ownedAgentData = await Promise.all(
    ownedAgents.map(async (agent) => {
      try {
        const records = await fetchAgentLedgerData({ network, range, agent });
        return { ...agent, ...records };
      } catch {
        return { ...agent, transactions: [], operations: [] };
      }
    })
  );

  const marketplaceAgentData = await Promise.all(
    marketplaceAgents.map(async (agent) => {
      try {
        const records = await fetchAgentLedgerData({ network, range, agent });
        return { ...agent, ...records };
      } catch {
        return { ...agent, transactions: [], operations: [] };
      }
    })
  );

  return buildAnalyticsDataset({
    range,
    ownedAgents: ownedAgentData,
    topMarketplaceAgents: marketplaceAgentData,
  });
}
