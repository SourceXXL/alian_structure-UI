import {
  generateSecurityReport,
  exportReportAsJson,
  exportReportAsCsv,
  exportReportAsMarkdown,
} from "../../lib/security/report";
import {
  SecurityScore,
  DetectedVulnerability,
  ComplianceResult,
  AuditRecord,
} from "../../lib/security/types";

describe("Security Report Generator", () => {
  const mockScore: SecurityScore = {
    overall: 72,
    breakdown: {
      codeQuality: 80,
      accessControl: 65,
      resourceSafety: 75,
      compliance: 70,
      auditHistory: 30,
    },
    grade: "B",
    timestamp: new Date().toISOString(),
  };

  const mockVulns: DetectedVulnerability[] = [
    {
      definitionId: "SRB-003",
      title: "Missing Authorization Check",
      severity: "critical",
      category: "unauthorized-access",
      description: "No auth",
      remediation: "Add require_auth()",
      confidence: 0.9,
      location: "mint function",
      cweId: "CWE-862",
    },
    {
      definitionId: "SRB-004",
      title: "Unhandled Panic",
      severity: "medium",
      category: "panic-abort",
      description: "Uses unwrap",
      remediation: "Use Result",
      confidence: 0.6,
    },
  ];

  const mockCompliance: ComplianceResult[] = [
    {
      ruleId: "SC-001",
      passed: true,
      message: "Token interface OK",
      severity: "info",
    },
    {
      ruleId: "SC-002",
      passed: false,
      message: "Missing auth",
      severity: "critical",
    },
  ];

  const mockAudit: AuditRecord = {
    id: "audit-1",
    contractId: "CTEST123",
    auditor: "CertiK",
    timestamp: new Date().toISOString(),
    score: mockScore,
    vulnerabilities: mockVulns,
    compliance: mockCompliance,
    network: "testnet",
    version: "1.0.0",
    txHash: "abc123def456",
  };

  describe("generateSecurityReport", () => {
    it("should generate a complete report", () => {
      const report = generateSecurityReport({
        contractId: "CTEST123",
        network: "testnet",
        score: mockScore,
        vulnerabilities: mockVulns,
        compliance: mockCompliance,
        optimizations: [],
        auditHistory: [mockAudit],
      });

      expect(report.id).toBeTruthy();
      expect(report.contractId).toBe("CTEST123");
      expect(report.network).toBe("testnet");
      expect(report.score.overall).toBe(72);
      expect(report.vulnerabilities.length).toBe(2);
      expect(report.compliance.length).toBe(2);
      expect(report.summary).toBeTruthy();
      expect(report.generatedAt).toBeTruthy();
    });

    it("should assign badges for high-scoring contracts", () => {
      const highScore: SecurityScore = {
        ...mockScore,
        overall: 90,
        grade: "A",
      };
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: highScore,
        vulnerabilities: [],
        compliance: [
          { ruleId: "SC-001", passed: true, message: "ok", severity: "info" },
        ],
        optimizations: [],
        auditHistory: [mockAudit],
      });

      expect(report.badges.length).toBeGreaterThan(0);
      const verifiedBadge = report.badges.find((b) => b.type === "verified");
      expect(verifiedBadge).toBeDefined();
    });

    it("should not assign verified badge for low-scoring contracts", () => {
      const lowScore: SecurityScore = { ...mockScore, overall: 40, grade: "D" };
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: lowScore,
        vulnerabilities: mockVulns,
        compliance: [],
        optimizations: [],
        auditHistory: [],
      });

      const verifiedBadge = report.badges.find((b) => b.type === "verified");
      expect(verifiedBadge).toBeUndefined();
    });

    it("should include audited badge when audit history exists", () => {
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: mockScore,
        vulnerabilities: [],
        compliance: [],
        optimizations: [],
        auditHistory: [mockAudit],
      });

      const auditedBadge = report.badges.find((b) => b.type === "audited");
      expect(auditedBadge).toBeDefined();
      expect(auditedBadge?.issuer).toBe("CertiK");
    });

    it("should generate meaningful summary", () => {
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: mockScore,
        vulnerabilities: mockVulns,
        compliance: mockCompliance,
        optimizations: [],
        auditHistory: [],
      });

      expect(report.summary).toContain("72");
      expect(report.summary).toContain("critical");
    });
  });

  describe("exportReportAsJson", () => {
    it("should produce valid JSON", () => {
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: mockScore,
        vulnerabilities: mockVulns,
        compliance: mockCompliance,
        optimizations: [],
        auditHistory: [],
      });

      const json = exportReportAsJson(report);
      const parsed = JSON.parse(json);
      expect(parsed.contractId).toBe("CTEST");
      expect(parsed.score.overall).toBe(72);
    });
  });

  describe("exportReportAsCsv", () => {
    it("should produce CSV with headers", () => {
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: mockScore,
        vulnerabilities: mockVulns,
        compliance: mockCompliance,
        optimizations: [],
        auditHistory: [],
      });

      const csv = exportReportAsCsv(report);
      expect(csv).toContain("Section,Field,Value");
      expect(csv).toContain("Vulnerability ID");
      expect(csv).toContain("Compliance Rule");
      expect(csv).toContain("CTEST");
    });
  });

  describe("exportReportAsMarkdown", () => {
    it("should produce valid markdown", () => {
      const report = generateSecurityReport({
        contractId: "CTEST",
        network: "testnet",
        score: mockScore,
        vulnerabilities: mockVulns,
        compliance: mockCompliance,
        optimizations: [],
        auditHistory: [],
      });

      const md = exportReportAsMarkdown(report);
      expect(md).toContain("# Security Audit Report");
      expect(md).toContain("## Vulnerabilities");
      expect(md).toContain("## Compliance");
      expect(md).toContain("CTEST");
      expect(md).toContain("🔴");
    });
  });
});
