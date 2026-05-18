/**
 * Build a Soroban contract deployment and mint transaction for agent minting
 */
import { Contract } from '@stellar/stellar-sdk';
import { AgentMetadata } from './ipfs';

export async function buildAgentMintTx({
  network,
  creatorPublicKey,
  ipfsCid,
  royaltyPercent,
}: {
  network: StellarNetwork;
  creatorPublicKey: string;
  ipfsCid: string;
  royaltyPercent: number;
}): Promise<StellarSdk.Transaction> {
  // This assumes a Soroban token contract with mint and metadata methods
  // You may need to adjust contract method names/params for your deployment
  const sourceAccount = new StellarSdk.Account(creatorPublicKey, '0');
  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '1000',
    networkPassphrase: getNetworkPassphrase(network),
  });

  // Example: deploy contract (if needed) and mint token with metadata
  // Replace with actual Soroban deployment logic as needed
  // const deployOp = ...
  // builder.addOperation(deployOp);

  // Attach metadata (IPFS CID, royalty)
  const contract = new (StellarSdk as any).Contract(''); // Contract ID set after deployment
  const mintOp = contract.call(
    'mint_agent',
    StellarSdk.nativeToScVal(ipfsCid, { type: 'string' }),
    StellarSdk.nativeToScVal(royaltyPercent, { type: 'u32' })
  );
  builder.addOperation(mintOp as any);

  return builder.setTimeout(0).build();
}
import * as StellarSdk from "@stellar/stellar-sdk";
import { isConnected, getAddress } from "@stellar/freighter-api";
import { StellarNetwork, WalletBalance, TransactionResult } from "./types";
import {
  STELLAR_NETWORKS,
  XLM_ASSET,
  DEFAULT_NETWORK,
} from "./stellar-constants";

/**
 * Get the Stellar server instance for a given network
 */
export function getStellarServer(network: StellarNetwork) {
  const networkConfig =
    STELLAR_NETWORKS[network] ||
    STELLAR_NETWORKS[DEFAULT_NETWORK] ||
    Object.values(STELLAR_NETWORKS)[0];
  return new StellarSdk.Horizon.Server(networkConfig.horizonUrl);
}

/**
 * Validate a Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || address.length !== 56) return false;
  const regex = /^G[A-Z0-9]{55}$/;
  if (!regex.test(address)) return false;

  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Truncate a Stellar address for display (GAAAA...ZZZZ)
 */
export function truncateStellarAddress(address: string, chars = 4): string {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get account balances from Horizon API
 */
export async function getAccountBalances(
  publicKey: string,
  network: StellarNetwork,
): Promise<WalletBalance[]> {
  try {
    const server = getStellarServer(network);
    const account = await server.loadAccount(publicKey);

    return account.balances.map((balance: any) => {
      const isNative = balance.asset_type === "native";
      return {
        asset: isNative ? "XLM" : balance.asset_code,
        balance: balance.balance,
        assetCode: balance.asset_code,
        assetIssuer: balance.asset_issuer,
      };
    });
  } catch (error) {
    console.error("Error fetching account balances:", error);
    throw error;
  }
}

/**
 * Check if Freighter wallet is available
 */
export async function isFreighterAvailable(): Promise<boolean> {
  const status = await isConnected();
  return !!status.isConnected;
}

/**
 * Check if Albedo wallet is available
 */
export function isAlbedoAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).albedo;
}

/**
 * Connect to Freighter wallet
 */
export async function connectFreighter(
  network: StellarNetwork,
): Promise<string> {
  try {
    const status = await isConnected();
    // Check if freighter is available
    if (!status.isConnected) {
      throw new Error("Freighter wallet not found. Please install it first.");
    }

    const { address, error } = await getAddress();
    if (error) {
      throw new Error(
        typeof error === "string"
          ? error
          : "Failed to get address from Freighter",
      );
    }

    if (!address || !isValidStellarAddress(address)) {
      throw new Error("Invalid address from Freighter");
    }

    return address;
  } catch (error: any) {
    if (error.message?.includes("User rejected")) {
      throw new Error("User rejected the wallet connection");
    }
    throw error;
  }
}

/**
 * Connect to Albedo wallet
 */
export async function connectAlbedo(network: StellarNetwork): Promise<string> {
  try {
    if (!isAlbedoAvailable()) {
      throw new Error("Albedo wallet not found. Please install it first.");
    }

    const response = await (window as any).albedo.publicKey();

    if (!response.publicKey || !isValidStellarAddress(response.publicKey)) {
      throw new Error("Invalid address from Albedo");
    }

    return response.publicKey;
  } catch (error: any) {
    if (error.message?.includes("User rejected")) {
      throw new Error("User rejected the wallet connection");
    }
    throw error;
  }
}

/**
 * Connect to Ledger wallet (placeholder for Ledger implementation)
 */
export async function connectLedger(network: StellarNetwork): Promise<string> {
  try {
    // This is a placeholder. Full Ledger implementation would require @ledgerhq/hw-transport-u2f
    // and additional setup. For now, we throw an error indicating it's not fully implemented.
    throw new Error(
      "Ledger wallet integration coming soon. Please use Freighter or Albedo for now.",
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Disconnect wallet and clear related data
 */
export function disconnectWallet(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("stellar_wallet_address");
  localStorage.removeItem("stellar_wallet_type");
  localStorage.removeItem("stellar_wallet_state");
}

/**
 * Sign a transaction with Freighter
 */
export async function signTransactionWithFreighter(
  transaction: StellarSdk.Transaction,
  network: StellarNetwork,
): Promise<TransactionResult> {
  try {
    if (!isFreighterAvailable()) {
      throw new Error("Freighter wallet not found");
    }

    const freighter = (window as any).freighter;
    const xdr = transaction.toEnvelope().toXDR("base64");
    const response = await freighter.signTransaction(xdr, {
      networkPassphrase: getNetworkPassphrase(network),
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to sign transaction");
    }

    return {
      success: true,
      hash: "", // Hash would be returned after submission
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to sign transaction",
    };
  }
}

/**
 * Sign a transaction with Albedo
 */
export async function signTransactionWithAlbedo(
  transaction: StellarSdk.Transaction,
  network: StellarNetwork,
): Promise<TransactionResult> {
  try {
    if (!isAlbedoAvailable()) {
      throw new Error("Albedo wallet not found");
    }

    const xdr = transaction.toEnvelope().toXDR("base64");
    const response = await (window as any).albedo.tx({ xdr });

    if (response.error) {
      throw new Error(response.error);
    }

    return {
      success: true,
      hash: response.hash,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to sign transaction",
    };
  }
}

/**
 * Submit a transaction to the Stellar network
 */
export async function submitTransaction(
  signedTransactionXdr: string,
  network: StellarNetwork,
): Promise<TransactionResult> {
  try {
    const server = getStellarServer(network);
    // Parse the signed transaction XDR
    const envelope = StellarSdk.TransactionBuilder.fromXDR(
      signedTransactionXdr,
      getNetworkPassphrase(network),
    );
    const result = await server.submitTransaction(envelope);

    return {
      success: true,
      hash: result.hash,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to submit transaction",
    };
  }
}

/**
 * Get network identifier
 */
export function getNetworkPassphrase(network: StellarNetwork): string {
  return STELLAR_NETWORKS[network].networkPassphrase;
}

/**
 * Format XLM amount (removes trailing zeros)
 */
export function formatXlmAmount(amount: string): string {
  try {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 7,
    });
  } catch {
    return amount;
  }
}
