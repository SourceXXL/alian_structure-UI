import {
  calculateSecurityScore,
  scoreToGrade,
  getScoreColor,
  getSeverityColor,
} from "../../lib/security/scoring";
import {
  DetectedVulnerability,
  ComplianceResult,
  AuditRecord,
  SecurityScore,
} from "../../lib/security/types";

describe("Security Scoring", () => {
  const makeVuln = (
    severity: DetectedVulnerability["severity"],
    category: DetectedVulnerability["category"],
    confidence = 0.8,
  ): DetectedVulnerability => ({
    definitionId: `TEST-${Math.random().toString(36).slice(2, 6)}`,
    title: `Test ${severity} vulnerability`,
    severity,
    category,
    description: "Test description",
    remediation: "Test remediation",
    confidence,
  });

  const makeCompliance = (
    passed: boolean,
    severity: ComplianceResult["severity"] = "info",
  ): ComplianceResult => ({
    ruleId: `SC-${Math.random().toString(36).slice(2, 5)}`,
    passed,
    message: passed ? "Check passed" : "Check failed",
    severity,
  });

  const makeAudit = (score: number, daysAgo: number): AuditRecord => ({
    id: `audit-${Math.random().toString(36).slice(2, 6)}`,
    contractId: "CTEST",
    auditor: "TestAuditor",
    timestamp: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    score: {
      overall: score,
      breakdown: {
        codeQuality: score,
        accessControl: score,
        resourceSafety: score,
        compliance: score,
        auditHistory: score,
      },
      grade: scoreToGrade(score),
      timestamp: new Date().toISOString(),
    },
    vulnerabilities: [],
    compliance: [],
    network: "testnet",
    version: "1.0.0",
  });

  describe("calculateSecurityScore", () => {
    it("should return 100 for contract with no issues", () => {
      const score = calculateSecurityScore([], [makeCompliance(true)], []);
      expect(score.overall).toBeGreaterThanOrEqual(80);
      expect(["A+", "A", "B"]).toContain(score.grade);
    });

    it("should heavily penalize critical vulnerabilities", () => {
      const vulns = [makeVuln("critical", "unauthorized-access")];
      const score = calculateSecurityScore(vulns, [], []);
      expect(score.overall).toBeLessThan(90);
    });

    it("should penalize multiple vulnerabilities cumulatively", () => {
      const vulns = [
        makeVuln("critical", "reentrancy"),
        makeVuln("high", "storage-exhaustion"),
        makeVuln("medium", "panic-abort"),
      ];
      const score = calculateSecurityScore(vulns, [], []);
      expect(score.overall).toBeLessThan(80);
    });

    it("should factor in compliance results", () => {
      const allPassing = [
        makeCompliance(true),
        makeCompliance(true),
        makeCompliance(true),
      ];
      const allFailing = [
        makeCompliance(false, "high"),
        makeCompliance(false, "critical"),
        makeCompliance(false, "medium"),
      ];

      const goodScore = calculateSecurityScore([], allPassing, []);
      const badScore = calculateSecurityScore([], allFailing, []);

      expect(goodScore.overall).toBeGreaterThan(badScore.overall);
    });

    it("should reward audit history", () => {
      const withAudit = calculateSecurityScore([], [], [makeAudit(90, 30)]);
      const withoutAudit = calculateSecurityScore([], [], []);

      expect(withAudit.overall).toBeGreaterThan(withoutAudit.overall);
    });

    it("should penalize old audits", () => {
      const recent = calculateSecurityScore([], [], [makeAudit(90, 30)]);
      const old = calculateSecurityScore([], [], [makeAudit(90, 400)]);

      expect(recent.overall).toBeGreaterThan(old.overall);
    });

    it("should clamp score between 0 and 100", () => {
      const manyVulns = Array.from({ length: 20 }, () =>
        makeVuln("critical", "reentrancy", 1.0),
      );
      const score = calculateSecurityScore(manyVulns, [], []);
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it("should include breakdown scores", () => {
      const score = calculateSecurityScore([], [], []);
      expect(score.breakdown).toHaveProperty("codeQuality");
      expect(score.breakdown).toHaveProperty("accessControl");
      expect(score.breakdown).toHaveProperty("resourceSafety");
      expect(score.breakdown).toHaveProperty("compliance");
      expect(score.breakdown).toHaveProperty("auditHistory");
    });

    it("should confidence-weight vulnerability impact", () => {
      const highConfidence = [makeVuln("high", "denial-of-service", 1.0)];
      const lowConfidence = [makeVuln("high", "denial-of-service", 0.2)];

      const highConfScore = calculateSecurityScore(highConfidence, [], []);
      const lowConfScore = calculateSecurityScore(lowConfidence, [], []);

      expect(lowConfScore.overall).toBeGreaterThan(highConfScore.overall);
    });
  });

  describe("scoreToGrade", () => {
    it("should return A+ for scores >= 95", () => {
      expect(scoreToGrade(95)).toBe("A+");
      expect(scoreToGrade(100)).toBe("A+");
    });

    it("should return A for scores 85-94", () => {
      expect(scoreToGrade(85)).toBe("A");
      expect(scoreToGrade(94)).toBe("A");
    });

    it("should return B for scores 70-84", () => {
      expect(scoreToGrade(70)).toBe("B");
      expect(scoreToGrade(84)).toBe("B");
    });

    it("should return C for scores 55-69", () => {
      expect(scoreToGrade(55)).toBe("C");
    });

    it("should return D for scores 40-54", () => {
      expect(scoreToGrade(40)).toBe("D");
    });

    it("should return F for scores below 40", () => {
      expect(scoreToGrade(39)).toBe("F");
      expect(scoreToGrade(0)).toBe("F");
    });
  });

  describe("getScoreColor", () => {
    it("should return green for high scores", () => {
      expect(getScoreColor(90)).toContain("green");
    });

    it("should return red for low scores", () => {
      expect(getScoreColor(30)).toContain("red");
    });
  });

  describe("getSeverityColor", () => {
    it("should return distinct colors for each severity", () => {
      const critical = getSeverityColor("critical");
      const high = getSeverityColor("high");
      const medium = getSeverityColor("medium");
      const low = getSeverityColor("low");

      expect(critical).toContain("red");
      expect(high).toContain("orange");
      expect(medium).toContain("yellow");
      expect(low).toContain("blue");
    });
  });
});
