import {
  ComplianceRule,
  ComplianceResult,
  ContractAnalysisContext,
} from "./types";

const TOKEN_INTERFACE_FUNCTIONS = [
  "initialize",
  "mint",
  "burn",
  "transfer",
  "approve",
  "allowance",
  "balance",
  "decimals",
  "name",
  "symbol",
];

export const STELLAR_COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "SC-001",
    name: "SEP-41 Token Interface Compliance",
    description:
      "Token contracts must implement the full Soroban Token Interface as defined in SEP-41.",
    category: "token",
    required: false,
    check: (ctx) => {
      if (!ctx.usesTokenInterface) {
        return {
          ruleId: "SC-001",
          passed: true,
          message: "Not a token contract, rule not applicable.",
          severity: "info",
        };
      }
      const missing = TOKEN_INTERFACE_FUNCTIONS.filter(
        (fn) =>
          !ctx.functionSignatures.some((f) => f.toLowerCase().includes(fn)),
      );
      if (missing.length === 0) {
        return {
          ruleId: "SC-001",
          passed: true,
          message: "All SEP-41 token interface functions implemented.",
          severity: "info",
        };
      }
      return {
        ruleId: "SC-001",
        passed: false,
        message: `Missing SEP-41 functions: ${missing.join(", ")}`,
        severity: "medium",
      };
    },
  },
  {
    id: "SC-002",
    name: "Authorization Framework Usage",
    description:
      "All state-mutating functions must use Soroban authorization framework (require_auth).",
    category: "governance",
    required: true,
    check: (ctx) => {
      if (!ctx.authRequired && ctx.functionSignatures.length > 0) {
        const mutatingFns = ctx.functionSignatures.filter((fn) =>
          [
            "mint",
            "transfer",
            "burn",
            "set",
            "update",
            "remove",
            "delete",
            "upgrade",
            "withdraw",
          ].some((k) => fn.toLowerCase().includes(k)),
        );
        if (mutatingFns.length > 0) {
          return {
            ruleId: "SC-002",
            passed: false,
            message: `State-mutating functions found without authorization: ${mutatingFns.join(", ")}`,
            severity: "critical",
          };
        }
      }
      return {
        ruleId: "SC-002",
        passed: true,
        message: "Authorization checks present for state-mutating functions.",
        severity: "info",
      };
    },
  },
  {
    id: "SC-003",
    name: "Upgrade Safety Controls",
    description:
      "Contracts with upgrade capability must implement proper access controls and migration logic.",
    category: "governance",
    required: true,
    check: (ctx) => {
      if (!ctx.hasUpgradeFunction) {
        return {
          ruleId: "SC-003",
          passed: true,
          message: "No upgrade function detected.",
          severity: "info",
        };
      }
      if (!ctx.authRequired) {
        return {
          ruleId: "SC-003",
          passed: false,
          message: "Upgrade function exists without authorization controls.",
          severity: "critical",
        };
      }
      return {
        ruleId: "SC-003",
        passed: true,
        message: "Upgrade function has authorization controls.",
        severity: "info",
      };
    },
  },
  {
    id: "SC-004",
    name: "Storage TTL Management",
    description:
      "Persistent storage entries must have appropriate TTL configuration to prevent data loss and minimize rent.",
    category: "resource",
    required: true,
    check: (ctx) => {
      if (!ctx.sourceCode) {
        return {
          ruleId: "SC-004",
          passed: true,
          message: "No source code available for analysis.",
          severity: "info",
        };
      }
      const usesPersistent = ctx.sourceCode.includes("persistent");
      const hasTtl =
        ctx.sourceCode.includes("extend_ttl") ||
        ctx.sourceCode.includes("bump");
      if (usesPersistent && !hasTtl) {
        return {
          ruleId: "SC-004",
          passed: false,
          message:
            "Persistent storage detected without TTL management. Data may expire unexpectedly.",
          severity: "high",
        };
      }
      return {
        ruleId: "SC-004",
        passed: true,
        message: "Storage TTL properly managed.",
        severity: "info",
      };
    },
  },
  {
    id: "SC-005",
    name: "Error Handling Standards",
    description:
      "Contracts should use #[contracterror] enums instead of panic/unwrap for error handling.",
    category: "data",
    required: false,
    check: (ctx) => {
      if (!ctx.sourceCode) {
        return {
          ruleId: "SC-005",
          passed: true,
          message: "No source code available.",
          severity: "info",
        };
      }
      const hasContractError = ctx.sourceCode.includes("contracterror");
      const hasUnwrap =
        (ctx.sourceCode.match(/\.unwrap\(\)/g) || []).length > 2;
      if (!hasContractError && hasUnwrap) {
        return {
          ruleId: "SC-005",
          passed: false,
          message: "Contract uses unwrap() without #[contracterror] enums.",
          severity: "medium",
        };
      }
      return {
        ruleId: "SC-005",
        passed: true,
        message: "Error handling follows Soroban best practices.",
        severity: "info",
      };
    },
  },
  {
    id: "SC-006",
    name: "Contract Size Limit",
    description:
      "Compiled WASM should stay under network size limits for efficient deployment.",
    category: "resource",
    required: true,
    check: (ctx) => {
      if (ctx.estimatedSizeByes > 512 * 1024) {
        return {
          ruleId: "SC-006",
          passed: false,
          message: `Contract size (${Math.round(ctx.estimatedSizeByes / 1024)}KB) exceeds 512KB limit.`,
          severity: "high",
        };
      }
      if (ctx.estimatedSizeByes > 256 * 1024) {
        return {
          ruleId: "SC-006",
          passed: false,
          message: `Contract size (${Math.round(ctx.estimatedSizeByes / 1024)}KB) exceeds recommended 256KB.`,
          severity: "medium",
        };
      }
      return {
        ruleId: "SC-006",
        passed: true,
        message: "Contract size within acceptable limits.",
        severity: "info",
      };
    },
  },
  {
    id: "SC-007",
    name: "Event Emission Standards",
    description:
      "Contracts should emit events for all state-changing operations to support indexing and auditing.",
    category: "data",
    required: false,
    check: (ctx) => {
      if (!ctx.sourceCode) {
        return {
          ruleId: "SC-007",
          passed: true,
          message: "No source code available.",
          severity: "info",
        };
      }
      const hasEvents =
        ctx.sourceCode.includes("events().publish") ||
        ctx.sourceCode.includes("emit");
      const hasStateChanges =
        ctx.sourceCode.includes(".set(") || ctx.sourceCode.includes(".remove(");
      if (hasStateChanges && !hasEvents) {
        return {
          ruleId: "SC-007",
          passed: false,
          message: "State changes detected without event emissions.",
          severity: "low",
        };
      }
      return {
        ruleId: "SC-007",
        passed: true,
        message: "Events emitted for state changes.",
        severity: "info",
      };
    },
  },
  {
    id: "SC-008",
    name: "Stellar Network Compatibility",
    description:
      "Contract must be compatible with target Stellar network protocol version.",
    category: "sep",
    required: true,
    check: (ctx) => {
      if (
        ctx.network === "mainnet" &&
        ctx.hasUpgradeFunction &&
        !ctx.authRequired
      ) {
        return {
          ruleId: "SC-008",
          passed: false,
          message:
            "Mainnet deployment with unprotected upgrade is not recommended.",
          severity: "critical",
        };
      }
      return {
        ruleId: "SC-008",
        passed: true,
        message: "Contract compatible with target network.",
        severity: "info",
      };
    },
  },
];

export function runComplianceChecks(
  context: ContractAnalysisContext,
): ComplianceResult[] {
  return STELLAR_COMPLIANCE_RULES.map((rule) => rule.check(context));
}

export function getComplianceSummary(results: ComplianceResult[]): {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  criticalFailures: ComplianceResult[];
} {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const criticalFailures = results.filter(
    (r) => !r.passed && (r.severity === "critical" || r.severity === "high"),
  );

  return {
    total: results.length,
    passed,
    failed,
    passRate:
      results.length > 0 ? Math.round((passed / results.length) * 100) : 0,
    criticalFailures,
  };
}
