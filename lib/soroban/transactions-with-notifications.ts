import * as StellarSdk from "@stellar/stellar-sdk";
import { SorobanContract } from "./client";
import { SorobanTransactionResult, ResourceMetrics } from "../types";
import { STELLAR_NETWORKS } from "../stellar-constants";
import { notificationManager } from "../notifications";

export interface TransactionNotificationOptions {
  description?: string;
  agentName?: string;
  amount?: string;
  type?: 'trade' | 'transaction' | 'general';
  showNotification?: boolean;
}

/**
 * Enhanced transaction wrapper with notification support
 */
export async function invokeContractWithNotifications(
    contract: SorobanContract,
    functionName: string,
    args: any[],
    publicKey: string,
    signCallback: (tx: StellarSdk.Transaction) => Promise<{ success: boolean; hash?: string; error?: string }>,
    notificationOptions: TransactionNotificationOptions = {}
): Promise<SorobanTransactionResult> {
    const {
        description,
        agentName,
        amount,
        type = 'transaction',
        showNotification = true
    } = notificationOptions;

    try {
        // 1. Prepare and simulate
        const { transaction, metrics } = await contract.prepareInvoke(functionName, args, publicKey);

        // 2. Sign
        const signResult = await signCallback(transaction);
        if (!signResult.success) {
            const errorResult = { success: false, error: signResult.error || "User rejected signing" };
            
            // Show notification for signing failure if enabled
            if (showNotification) {
                await showTransactionNotification(errorResult, description, type, agentName, amount);
            }
            
            return errorResult;
        }

        // 3. Submit
        const rpcUrl = STELLAR_NETWORKS[contract.network].rpcUrl ||
            STELLAR_NETWORKS[contract.network].horizonUrl.replace("horizon", "soroban-rpc");
        const server = new (StellarSdk as any).rpc.Server(rpcUrl);

        // For safety, let's assume we might need to poll if we have a hash
        if (signResult.hash) {
            const waitResult = await pollTransactionStatus(server, signResult.hash);
            const result = {
                success: waitResult.status === "SUCCESS",
                hash: signResult.hash,
                metrics,
                error: waitResult.error,
            };

            // Show notification based on result
            if (showNotification) {
                await showTransactionNotification(result, description, type, agentName, amount);
            }

            return result;
        }

        const errorResult = { success: false, error: "Failed to obtain transaction hash" };
        
        // Show notification for hash failure if enabled
        if (showNotification) {
            await showTransactionNotification(errorResult, description, type, agentName, amount);
        }

        return errorResult;
    } catch (error: any) {
        console.error("Invoke Error:", error);
        const errorResult = { success: false, error: error.message || "Unknown error during invocation" };
        
        // Show notification for exception if enabled
        if (showNotification) {
            await showTransactionNotification(errorResult, description, type, agentName, amount);
        }
        
        return errorResult;
    }
}

/**
 * Show appropriate notification based on transaction result and type
 */
async function showTransactionNotification(
    result: SorobanTransactionResult,
    description: string | undefined,
    type: 'trade' | 'transaction' | 'general',
    agentName: string | undefined,
    amount: string | undefined
): Promise<void> {
    if (type === 'trade' && agentName) {
        await notificationManager.showTradeNotification(result, agentName, amount);
    } else {
        const notificationDescription = description || 
            (result.success ? 'Transaction completed successfully' : 'Transaction failed');
        await notificationManager.showTransactionNotification(result, notificationDescription);
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

/**
 * Trade-specific transaction wrapper
 */
export async function executeTrade(
    contract: SorobanContract,
    functionName: string,
    args: any[],
    publicKey: string,
    signCallback: (tx: StellarSdk.Transaction) => Promise<{ success: boolean; hash?: string; error?: string }>,
    agentName: string,
    amount?: string
): Promise<SorobanTransactionResult> {
    return await invokeContractWithNotifications(
        contract,
        functionName,
        args,
        publicKey,
        signCallback,
        {
            description: `Trade execution for ${agentName}`,
            agentName,
            amount,
            type: 'trade',
            showNotification: true
        }
    );
}

/**
 * General transaction wrapper
 */
export async function executeTransaction(
    contract: SorobanContract,
    functionName: string,
    args: any[],
    publicKey: string,
    signCallback: (tx: StellarSdk.Transaction) => Promise<{ success: boolean; hash?: string; error?: string }>,
    description?: string
): Promise<SorobanTransactionResult> {
    return await invokeContractWithNotifications(
        contract,
        functionName,
        args,
        publicKey,
        signCallback,
        {
            description,
            type: 'transaction',
            showNotification: true
        }
    );
}

/**
 * Silent transaction wrapper (no notifications)
 */
export async function executeSilentTransaction(
    contract: SorobanContract,
    functionName: string,
    args: any[],
    publicKey: string,
    signCallback: (tx: StellarSdk.Transaction) => Promise<{ success: boolean; hash?: string; error?: string }>
): Promise<SorobanTransactionResult> {
    return await invokeContractWithNotifications(
        contract,
        functionName,
        args,
        publicKey,
        signCallback,
        {
            showNotification: false
        }
    );
}
