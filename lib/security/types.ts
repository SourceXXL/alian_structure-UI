import type { StellarNetwork } from "../types";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type VulnerabilityCategory =
  | "reentrancy"
  | "integer-overflow"
  | "unauthorized-access"
  | "unchecked-return"
  | "denial-of-service"
  | "storage-exhaustion"
  | "timestamp-dependence"
  | "panic-abort"
  | "unsafe-math"
  | "missing-auth"
  | "resource-leak"
  | "cross-contract"
  | "token-standard"
  | "upgrade-safety";

export interface VulnerabilityDefinition {
  id: string;
  category: VulnerabilityCategory;
  title: string;
  description: string;
  severity: Severity;
  cweId?: string;
  remediation: string;
  sorobanSpecific: boolean;
  patterns: string[];
  references: string[];
}

export interface DetectedVulnerability {
  definitionId: string;
  title: string;
  severity: Severity;
  category: VulnerabilityCategory;
  description: string;
  remediation: string;
  location?: string;
  confidence: number;
  cweId?: string;
}

export interface SecurityScore {
  overall: number;
  breakdown: {
    codeQuality: number;
    accessControl: number;
    resourceSafety: number;
    compliance: number;
    auditHistory: number;
  };
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  timestamp: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: "sep" | "token" | "governance" | "data" | "resource";
  required: boolean;
  check: (context: ContractAnalysisContext) => ComplianceResult;
}

export interface ComplianceResult {
  ruleId: string;
  passed: boolean;
  message: string;
  severity: Severity;
}

export interface ContractAnalysisContext {
  contractId: string;
  network: StellarNetwork;
  wasmHash?: string;
  sourceCode?: string;
  functionSignatures: string[];
  storageKeys: string[];
  authRequired: boolean;
  hasUpgradeFunction: boolean;
  usesTokenInterface: boolean;
  estimatedSizeByes: number;
  invokerAddress?: string;
}

export interface AuditRecord {
  id: string;
  contractId: string;
  auditor: string;
  timestamp: string;
  score: SecurityScore;
  vulnerabilities: DetectedVulnerability[];
  compliance: ComplianceResult[];
  txHash?: string;
  network: StellarNetwork;
  version: string;
}

export interface SecurityBadgeInfo {
  type: "verified" | "audited" | "compliant" | "certified";
  label: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  score?: number;
  txHash?: string;
}

export interface ResourceOptimization {
  category: "cpu" | "memory" | "storage" | "cost";
  title: string;
  description: string;
  currentValue: string;
  suggestedValue: string;
  estimatedSavings: string;
  priority: Severity;
}

export interface SecurityReport {
  id: string;
  contractId: string;
  network: StellarNetwork;
  generatedAt: string;
  score: SecurityScore;
  vulnerabilities: DetectedVulnerability[];
  compliance: ComplianceResult[];
  optimizations: ResourceOptimization[];
  badges: SecurityBadgeInfo[];
  auditHistory: AuditRecord[];
  summary: string;
}

export interface ScanRequest {
  contractId: string;
  network: StellarNetwork;
  sourceCode?: string;
  includeOptimizations?: boolean;
  includeCompliance?: boolean;
}

export interface ScanResponse {
  report: SecurityReport;
  success: boolean;
  error?: string;
}
