import * as StellarSdk from "@stellar/stellar-sdk";
import { StellarNetwork, SorobanEvent } from "../types";
import { STELLAR_NETWORKS } from "../stellar-constants";

/**
 * Utility to subscribe to contract events via Horizon
 */
export class SorobanEventManager {
    private server: StellarSdk.Horizon.Server;

    constructor(network: StellarNetwork) {
        this.server = new StellarSdk.Horizon.Server(STELLAR_NETWORKS[network].horizonUrl);
    }

    /**
     * Listen for events on a specific contract
     */
    subscribeToContractEvents(
        contractId: string,
        onEvent: (event: SorobanEvent) => void
    ): () => void {
        // Horizon event streaming for transactions involving the contract
        const closeStream = this.server
            .transactions()
            .forAccount(contractId) // Soroban contracts are also accounts
            .cursor("now")
            .stream({
                onmessage: (tx: any) => {
                    // Parse transaction meta to find Soroban events
                    try {
                        if (tx.result_meta_xdr) {
                            const meta = StellarSdk.xdr.TransactionMeta.fromXDR(tx.result_meta_xdr, "base64");
                            // In newer SDKs, meta for Soroban is often in v3
                            const v3 = (meta as any).v3?.();
                            if (v3 && v3.sorobanMeta()) {
                                const events = v3.sorobanMeta().events() || [];
                                events.forEach((e: any) => {
                                    onEvent({
                                        type: "contract_event",
                                        contractId: contractId,
                                        topics: e.type().name === "CONTRACT" ? e.contractEvent().topics().map((t: any) => StellarSdk.scValToNative(t)) : [],
                                        value: e.type().name === "CONTRACT" ? StellarSdk.scValToNative(e.contractEvent().data()) : null,
                                    });
                                });
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing Soroban events from transaction:", e);
                    }
                },
                onerror: (err: any) => {
                    console.error("Event stream error:", err);
                },
            });

        return closeStream;
    }
}
