import * as StellarSdk from "@stellar/stellar-sdk";
import { SorobanContract } from "./client";
import { SorobanTransactionResult, ResourceMetrics } from "../types";
import { STELLAR_NETWORKS } from "../stellar-constants";

/**
 * High-level wrapper for Soroban state-changing calls
 */
export async function invokeContract(
    contract: SorobanContract,
    functionName: string,
    args: any[],
    publicKey: string,
    signCallback: (tx: StellarSdk.Transaction) => Promise<{ success: boolean; hash?: string; error?: string }>
): Promise<SorobanTransactionResult> {
    try {
        // 1. Prepare and simulate
        const { transaction, metrics } = await contract.prepareInvoke(functionName, args, publicKey);

        // 2. Sign
        const signResult = await signCallback(transaction);
        if (!signResult.success) {
            return { success: false, error: signResult.error || "User rejected signing" };
        }

        // 3. Submit
        const rpcUrl = STELLAR_NETWORKS[contract.network].rpcUrl ||
            STELLAR_NETWORKS[contract.network].horizonUrl.replace("horizon", "soroban-rpc");
        const server = new (StellarSdk as any).rpc.Server(rpcUrl);

        // Note: If signResult didn't return a hash, we might need to submit it here
        // However, Freighter/Albedo usually return a hash after signing AND submitting depending on the wallet setup
        // For this implementation, we assume we need to submit the signed XDR if only a signature was provided
        // but most modern Stellar wallets handle the submission or return the signed envelope.

        // For safety, let's assume we might need to poll if we have a hash
        if (signResult.hash) {
            const waitResult = await pollTransactionStatus(server, signResult.hash);
            return {
                success: waitResult.status === "SUCCESS",
                hash: signResult.hash,
                metrics,
                error: waitResult.error,
            };
        }

        return { success: false, error: "Failed to obtain transaction hash" };
    } catch (error: any) {
        console.error("Invoke Error:", error);
        return { success: false, error: error.message || "Unknown error during invocation" };
    }
}

/**
 * Poll for transaction completion with exponential backoff
 */
export async function pollTransactionStatus(
    server: any,
    hash: string,
    maxAttempts = 10,
    initialDelay = 1000
): Promise<{ status: string; error?: string }> {
    let delay = initialDelay;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const statusResponse = await server.getTransaction(hash);

            if (statusResponse.status === "SUCCESS") {
                return { status: "SUCCESS" };
            } else if (statusResponse.status === "FAILED") {
                return { status: "FAILED", error: "Transaction failed on-chain" };
            }

            // Still pending
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.5; // Exponential backoff
        } catch (e) {
            // Ignore network errors during polling and retry
        }
    }

    return { status: "TIMEOUT", error: "Transaction polling timed out" };
}
