import { STELLAR_NETWORKS } from '@/lib/stellar-constants';
import { StellarNetwork } from '@/lib/types';
import { HorizonStreamEvent, StellarTransactionRecord } from './types';

type EventCallback = (event: HorizonStreamEvent) => void;

export class HorizonSubscriptionManager {
  private streams = new Map<string, EventSource>();

  subscribeToAgentTransactions(input: {
    network: StellarNetwork;
    agentId: string;
    onEvent: EventCallback;
  }): void {
    const { network, agentId, onEvent } = input;
    const key = `${network}:${agentId}`;
    if (this.streams.has(key)) {
      return;
    }

    const horizon = STELLAR_NETWORKS[network].horizonUrl;
    const streamUrl = `${horizon}/accounts/${agentId}/transactions?cursor=now&stream=true`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data);
        const transaction: StellarTransactionRecord = {
          id: payload.id,
          hash: payload.hash,
          createdAt: payload.created_at,
          successful: Boolean(payload.successful),
          feeChargedStroops: String(payload.fee_charged || '0'),
          sourceAccount: payload.source_account || '',
        };

        onEvent({
          type: 'transaction',
          transaction,
        });
      } catch {
        // Ignore malformed stream payloads
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      this.streams.delete(key);
    };

    this.streams.set(key, eventSource);
  }

  unsubscribeFromAgent(network: StellarNetwork, agentId: string): void {
    const key = `${network}:${agentId}`;
    const stream = this.streams.get(key);
    if (!stream) return;
    stream.close();
    this.streams.delete(key);
  }

  unsubscribeAll(): void {
    this.streams.forEach((source) => source.close());
    this.streams.clear();
  }
}
