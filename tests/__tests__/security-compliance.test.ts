import {
  runComplianceChecks,
  getComplianceSummary,
  STELLAR_COMPLIANCE_RULES,
} from "../../lib/security/compliance";
import {
  ContractAnalysisContext,
  ComplianceResult,
} from "../../lib/security/types";

describe("Stellar Compliance Checker", () => {
  const makeContext = (
    overrides: Partial<ContractAnalysisContext> = {},
  ): ContractAnalysisContext => ({
    contractId: "CTEST",
    network: "testnet",
    functionSignatures: [],
    storageKeys: [],
    authRequired: true,
    hasUpgradeFunction: false,
    usesTokenInterface: false,
    estimatedSizeByes: 5000,
    ...overrides,
  });

  describe("STELLAR_COMPLIANCE_RULES", () => {
    it("should have at least 5 rules", () => {
      expect(STELLAR_COMPLIANCE_RULES.length).toBeGreaterThanOrEqual(5);
    });

    it("should have unique rule IDs", () => {
      const ids = STELLAR_COMPLIANCE_RULES.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("runComplianceChecks", () => {
    it("should return results for all rules", () => {
      const ctx = makeContext();
      const results = runComplianceChecks(ctx);
      expect(results.length).toBe(STELLAR_COMPLIANCE_RULES.length);
    });

    it("should pass all checks for well-formed contract", () => {
      const ctx = makeContext({
        authRequired: true,
        hasUpgradeFunction: false,
        sourceCode: `
          #[contracterror] pub enum Error { NotAuth = 1 }
          fn transfer(env: Env) { addr.require_auth(); env.events().publish(topic, data); }
        `,
      });
      const results = runComplianceChecks(ctx);
      const failures = results.filter((r) => !r.passed);
      expect(failures.length).toBe(0);
    });

    it("should fail auth check for unprotected mutating functions", () => {
      const ctx = makeContext({
        authRequired: false,
        functionSignatures: ["mint", "transfer", "burn"],
      });
      const results = runComplianceChecks(ctx);
      const authResult = results.find((r) => r.ruleId === "SC-002");
      expect(authResult?.passed).toBe(false);
      expect(authResult?.severity).toBe("critical");
    });

    it("should fail upgrade safety for unprotected upgrade", () => {
      const ctx = makeContext({
        hasUpgradeFunction: true,
        authRequired: false,
      });
      const results = runComplianceChecks(ctx);
      const upgradeResult = results.find((r) => r.ruleId === "SC-003");
      expect(upgradeResult?.passed).toBe(false);
    });

    it("should fail storage TTL check when persistent storage lacks TTL", () => {
      const ctx = makeContext({
        sourceCode: `
          fn store(env: Env) { env.storage().persistent().set(&key, &val); }
        `,
      });
      const results = runComplianceChecks(ctx);
      const ttlResult = results.find((r) => r.ruleId === "SC-004");
      expect(ttlResult?.passed).toBe(false);
    });

    it("should detect non-compliant token interface", () => {
      const ctx = makeContext({
        usesTokenInterface: true,
        functionSignatures: ["transfer", "balance"],
      });
      const results = runComplianceChecks(ctx);
      const tokenResult = results.find((r) => r.ruleId === "SC-001");
      expect(tokenResult?.passed).toBe(false);
    });

    it("should pass token check for non-token contracts", () => {
      const ctx = makeContext({ usesTokenInterface: false });
      const results = runComplianceChecks(ctx);
      const tokenResult = results.find((r) => r.ruleId === "SC-001");
      expect(tokenResult?.passed).toBe(true);
    });

    it("should fail size check for oversized contracts", () => {
      const ctx = makeContext({ estimatedSizeByes: 600 * 1024 });
      const results = runComplianceChecks(ctx);
      const sizeResult = results.find((r) => r.ruleId === "SC-006");
      expect(sizeResult?.passed).toBe(false);
    });

    it("should flag mainnet with unprotected upgrade", () => {
      const ctx = makeContext({
        network: "mainnet",
        hasUpgradeFunction: true,
        authRequired: false,
      });
      const results = runComplianceChecks(ctx);
      const networkResult = results.find((r) => r.ruleId === "SC-008");
      expect(networkResult?.passed).toBe(false);
      expect(networkResult?.severity).toBe("critical");
    });
  });

  describe("getComplianceSummary", () => {
    it("should calculate correct pass rate", () => {
      const results: ComplianceResult[] = [
        { ruleId: "SC-001", passed: true, message: "ok", severity: "info" },
        { ruleId: "SC-002", passed: true, message: "ok", severity: "info" },
        { ruleId: "SC-003", passed: false, message: "fail", severity: "high" },
      ];
      const summary = getComplianceSummary(results);
      expect(summary.total).toBe(3);
      expect(summary.passed).toBe(2);
      expect(summary.failed).toBe(1);
      expect(summary.passRate).toBe(67);
    });

    it("should identify critical failures", () => {
      const results: ComplianceResult[] = [
        {
          ruleId: "SC-001",
          passed: false,
          message: "fail",
          severity: "critical",
        },
        { ruleId: "SC-002", passed: true, message: "ok", severity: "info" },
      ];
      const summary = getComplianceSummary(results);
      expect(summary.criticalFailures.length).toBe(1);
    });

    it("should handle empty results", () => {
      const summary = getComplianceSummary([]);
      expect(summary.total).toBe(0);
      expect(summary.passRate).toBe(0);
    });
  });
});
