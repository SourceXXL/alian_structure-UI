import { StellarNetworkConfig, StellarNetwork } from "./types";

// Stellar Network Configurations
export const STELLAR_NETWORKS: Record<string, StellarNetworkConfig> = {
  mainnet: {
    name: "mainnet",
    displayName: "Mainnet",
    horizonUrl:
      process.env.NEXT_PUBLIC_STELLAR_MAINNET_URL ||
      "https://horizon.stellar.org",
    networkPassphrase:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE_MAINNET ||
      "Public Global Stellar Network ; September 2015",
    color: "bg-blue-600",
    badge: "🟦 Mainnet",
  },
  testnet: {
    name: "testnet",
    displayName: "Testnet",
    horizonUrl:
      process.env.NEXT_PUBLIC_STELLAR_TESTNET_URL ||
      "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE_TESTNET ||
      "Test SDF Network ; September 2015",
    color: "bg-yellow-500",
    badge: "🟨 Testnet",
  },
  futurenet: {
    name: "futurenet",
    displayName: "Futurenet",
    horizonUrl:
      process.env.NEXT_PUBLIC_STELLAR_FUTURENET_URL ||
      "https://horizon-futurenet.stellar.org",
    rpcUrl: "https://rpc-futurenet.stellar.org",
    networkPassphrase:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE_FUTURENET ||
      "Test SDF Future Network ; October 2022",
    color: "bg-purple-600",
    badge: "🟪 Futurenet",
  },
};

// Default network - ensure it's a valid network value
const defaultNetworkValue = (process.env.NEXT_PUBLIC_DEFAULT_STELLAR_NETWORK ||
  "mainnet") as string;
export const DEFAULT_NETWORK: StellarNetwork = (
  ["mainnet", "testnet", "futurenet"].includes(defaultNetworkValue)
    ? defaultNetworkValue
    : "mainnet"
) as StellarNetwork;

// Wallet types
export const WALLET_TYPES = {
  FREIGHTER: "freighter",
  ALBEDO: "albedo",
  LEDGER: "ledger",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: "stellar_wallet_address",
  WALLET_TYPE: "stellar_wallet_type",
  NETWORK: "stellar_network",
  WALLET_STATE: "stellar_wallet_state",
  LINKED_WALLETS: "stellar_linked_wallets",
  DELEGATIONS: "stellar_delegations",
  SESSION_RECOVERY: "stellar_session_recovery",
} as const;

// XLM Asset
export const XLM_ASSET = {
  code: "XLM",
  issuer: undefined, // XLM is native
  name: "Lumens",
} as const;

// Common Stellar Assets
export const STELLAR_ASSETS = {
  XLM: { code: "XLM", name: "Lumens" },
  USDC: {
    code: "USDC",
    issuer: "GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ75XABVQVDF3YKBE6",
    name: "USD Coin",
  },
  SRT: {
    code: "SRT",
    issuer: "GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ75XABVQVDF3YKBE6",
    name: "Stellar",
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_INSTALLED: "Wallet extension not found. Please install it first.",
  USER_REJECTED: "Transaction was rejected by the user.",
  NETWORK_ERROR: "Network error. Please try again.",
  INVALID_ADDRESS: "Invalid Stellar address.",
  INSUFFICIENT_BALANCE: "Insufficient balance for this transaction.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
} as const;
