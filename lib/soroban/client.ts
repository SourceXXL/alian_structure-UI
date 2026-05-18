import * as StellarSdk from "@stellar/stellar-sdk";
import {
    StellarNetwork,
    SorobanContractSpec,
    ResourceMetrics,
    SorobanTransactionResult
} from "../types";
import { STELLAR_NETWORKS } from "../stellar-constants";
import { specLoader } from "./spec";

/**
 * Robust Soroban contract interaction client
 */
export class SorobanContract {
    private server: any;
    private networkPassphrase: string;
    private contract: StellarSdk.Contract;

    constructor(
        public readonly contractId: string,
        public readonly network: StellarNetwork,
        public readonly spec?: SorobanContractSpec
    ) {
        const config = STELLAR_NETWORKS[network];
        const rpcUrl = config.rpcUrl || config.horizonUrl.replace("horizon", "soroban-rpc");
        this.server = new (StellarSdk as any).rpc.Server(rpcUrl);
        this.networkPassphrase = config.networkPassphrase;
        this.contract = new StellarSdk.Contract(contractId);
    }

    /**
     * Simulate a contract call (Read-only)
     */
    async callReadOnly(
        functionName: string,
        args: any[] = []
    ): Promise<{ result: any; metrics: ResourceMetrics }> {
        try {
            // Mock account for simulation if no signer provided
            const dummyAccount = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");

            const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
                fee: "100",
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(this.contract.call(functionName, ...this.prepareArgs(functionName, args)))
                .setTimeout(StellarSdk.TimeoutInfinite)
                .build();

            const response = await this.server.simulateTransaction(tx);

            if ((StellarSdk as any).rpc.Api.isSimulationSuccess(response)) {
                const result = response.results[0];
                const scValResult = StellarSdk.xdr.ScVal.fromXDR(result.xdr, "base64");

                return {
                    result: StellarSdk.scValToNative(scValResult),
                    metrics: this.extractMetrics(response),
                };
            } else {
                throw new Error(`Simulation failed: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            console.error(`Error in callReadOnly (${functionName}):`, error);
            throw error;
        }
    }

    /**
     * Prepare a transaction for invocation (State-changing)
     */
    async prepareInvoke(
        functionName: string,
        args: any[],
        publicKey: string
    ): Promise<{ transaction: StellarSdk.Transaction; metrics: ResourceMetrics }> {
        try {
            const server = new StellarSdk.Horizon.Server(STELLAR_NETWORKS[this.network].horizonUrl);
            const account = await server.loadAccount(publicKey);

            let tx = new StellarSdk.TransactionBuilder(account, {
                fee: "100", // Placeholder, will be updated by simulation
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(this.contract.call(functionName, ...this.prepareArgs(functionName, args)))
                .setTimeout(StellarSdk.TimeoutInfinite)
                .build();

            const simulationResponse = await this.server.simulateTransaction(tx);

            if (!(StellarSdk as any).rpc.Api.isSimulationSuccess(simulationResponse)) {
                throw new Error("Simulation failed for invoke");
            }

            // Assemble the full transaction with simulation results
            tx = (StellarSdk as any).rpc.assembleTransaction(tx, simulationResponse).build();

            return {
                transaction: tx,
                metrics: this.extractMetrics(simulationResponse),
            };
        } catch (error) {
            console.error(`Error in prepareInvoke (${functionName}):`, error);
            throw error;
        }
    }

    /**
   * Helper to extract resource metrics from simulation response
   */
    private extractMetrics(response: any): ResourceMetrics {
        const minFee = Number(response.minResourceFee || 0);
        const cost = response.cost || {};

        return {
            cpuInstructions: Number(cost.cpuInsns || 0),
            ramBytes: Number(cost.memBytes || 0),
            ledgerReadBytes: 0, // Footprint details would require deeper parsing of transactionData
            ledgerWriteBytes: 0,
            readCount: 0,
            writeCount: 0,
            costXlm: (minFee / 10000000).toFixed(7),
        };
    }

    /**
     * Internal helper to map args based on spec (if available) or native conversion
     */
    private prepareArgs(functionName: string, args: any[]): StellarSdk.xdr.ScVal[] {
        // If we have a spec, we could do more advanced mapping here
        return args.map(arg => StellarSdk.nativeToScVal(arg));
    }
}

/**
 * Factory class for managing Soroban contract instances
 */
export class SorobanContractFactory {
    private instances: Map<string, SorobanContract> = new Map();

    constructor(private network: StellarNetwork) { }

    async getContract(contractId: string, specJson?: any): Promise<SorobanContract> {
        const key = `${this.network}:${contractId}`;
        if (this.instances.has(key)) {
            return this.instances.get(key)!;
        }

        let spec: SorobanContractSpec | undefined;
        if (specJson) {
            spec = await specLoader.loadFromJson(contractId, specJson);
        }

        const instance = new SorobanContract(contractId, this.network, spec);
        this.instances.set(key, instance);
        return instance;
    }
}
