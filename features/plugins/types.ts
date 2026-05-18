// ─────────────────────────────────────────────────────────────────────────────
// Plugin Management Types & Mock Data
// Issue: Plugin Management UI — stellAIverse-frontend
// ─────────────────────────────────────────────────────────────────────────────

export type PluginStatus = "active" | "inactive" | "pending" | "error";
export type SandboxLevel = "full" | "partial" | "none";
export type AuditAction =
  | "registered"
  | "activated"
  | "deactivated"
  | "updated"
  | "error"
  | "security_flag";

export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  status: PluginStatus;
  sandboxLevel: SandboxLevel;
  permissions: string[];
  registeredAt: string;
  lastUpdated: string;
  category: string;
  verified: boolean;
}

export interface AuditLog {
  id: string;
  pluginId: string;
  pluginName: string;
  action: AuditAction;
  performedBy: string;
  timestamp: string;
  details: string;
}

// ─── Mock Plugins ─────────────────────────────────────────────────────────────
export const MOCK_PLUGINS: Plugin[] = [
  {
    id: "plg_001",
    name: "StellarPay Gateway",
    version: "2.1.0",
    author: "Stellar Labs",
    description: "Processes on-chain payments and tip flows via Stellar network.",
    status: "active",
    sandboxLevel: "full",
    permissions: ["read:wallet", "write:transactions"],
    registeredAt: "2026-01-10T08:00:00Z",
    lastUpdated: "2026-03-01T12:00:00Z",
    category: "Payments",
    verified: true,
  },
  {
    id: "plg_002",
    name: "AI Content Moderator",
    version: "1.0.4",
    author: "OpenMod Inc.",
    description: "Scans and flags AI-generated content for policy violations.",
    status: "active",
    sandboxLevel: "full",
    permissions: ["read:content", "write:flags"],
    registeredAt: "2026-02-05T09:30:00Z",
    lastUpdated: "2026-03-10T15:20:00Z",
    category: "Security",
    verified: true,
  },
  {
    id: "plg_003",
    name: "Analytics Beacon",
    version: "3.0.1",
    author: "DataPulse",
    description: "Tracks user events and sends anonymized metrics to the dashboard.",
    status: "inactive",
    sandboxLevel: "partial",
    permissions: ["read:events"],
    registeredAt: "2026-01-20T11:00:00Z",
    lastUpdated: "2026-02-14T08:00:00Z",
    category: "Analytics",
    verified: false,
  },
  {
    id: "plg_004",
    name: "NFT Provenance Checker",
    version: "0.9.2",
    author: "ChainProof",
    description: "Verifies NFT ownership and provenance on Stellar and EVM chains.",
    status: "pending",
    sandboxLevel: "full",
    permissions: ["read:nft", "read:chain"],
    registeredAt: "2026-03-25T14:00:00Z",
    lastUpdated: "2026-03-25T14:00:00Z",
    category: "Blockchain",
    verified: false,
  },
  {
    id: "plg_005",
    name: "Legacy Bridge",
    version: "1.2.0",
    author: "OldStack Co.",
    description: "Bridges legacy REST APIs to the stellAIverse plugin bus.",
    status: "error",
    sandboxLevel: "none",
    permissions: ["read:*", "write:*"],
    registeredAt: "2025-11-01T07:00:00Z",
    lastUpdated: "2026-03-20T10:00:00Z",
    category: "Integration",
    verified: false,
  },
];

// ─── Mock Audit Logs ──────────────────────────────────────────────────────────
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log_001",
    pluginId: "plg_001",
    pluginName: "StellarPay Gateway",
    action: "activated",
    performedBy: "admin@stellaiverse.io",
    timestamp: "2026-03-01T12:05:00Z",
    details: "Plugin activated after security review.",
  },
  {
    id: "log_002",
    pluginId: "plg_005",
    pluginName: "Legacy Bridge",
    action: "error",
    performedBy: "system",
    timestamp: "2026-03-20T10:01:00Z",
    details: "Sandbox violation: attempted to access restricted memory.",
  },
  {
    id: "log_003",
    pluginId: "plg_003",
    pluginName: "Analytics Beacon",
    action: "deactivated",
    performedBy: "admin@stellaiverse.io",
    timestamp: "2026-02-14T08:05:00Z",
    details: "Deactivated pending re-verification of data handling.",
  },
  {
    id: "log_004",
    pluginId: "plg_004",
    pluginName: "NFT Provenance Checker",
    action: "registered",
    performedBy: "admin@stellaiverse.io",
    timestamp: "2026-03-25T14:02:00Z",
    details: "New plugin registered, awaiting activation approval.",
  },
  {
    id: "log_005",
    pluginId: "plg_002",
    pluginName: "AI Content Moderator",
    action: "security_flag",
    performedBy: "system",
    timestamp: "2026-03-15T16:30:00Z",
    details: "Unusual API call rate detected. Monitoring escalated.",
  },
  {
    id: "log_006",
    pluginId: "plg_001",
    pluginName: "StellarPay Gateway",
    action: "updated",
    performedBy: "admin@stellaiverse.io",
    timestamp: "2026-03-01T11:55:00Z",
    details: "Updated to v2.1.0 from v2.0.3.",
  },
];