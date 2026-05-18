import {
  DetectedVulnerability,
  ComplianceResult,
  SecurityScore,
  AuditRecord,
  Severity,
} from "./types";

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0,
};

export function calculateSecurityScore(
  vulnerabilities: DetectedVulnerability[],
  compliance: ComplianceResult[],
  auditHistory: AuditRecord[],
): SecurityScore {
  const codeQuality = calculateCodeQualityScore(vulnerabilities);
  const accessControl = calculateAccessControlScore(vulnerabilities);
  const resourceSafety = calculateResourceSafetyScore(vulnerabilities);
  const complianceScore = calculateComplianceScore(compliance);
  const auditHistoryScore = calculateAuditHistoryScore(auditHistory);

  const overall = Math.round(
    codeQuality * 0.3 +
      accessControl * 0.25 +
      resourceSafety * 0.2 +
      complianceScore * 0.15 +
      auditHistoryScore * 0.1,
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    breakdown: {
      codeQuality,
      accessControl,
      resourceSafety,
      compliance: complianceScore,
      auditHistory: auditHistoryScore,
    },
    grade: scoreToGrade(overall),
    timestamp: new Date().toISOString(),
  };
}

function calculateCodeQualityScore(vulns: DetectedVulnerability[]): number {
  const codeVulns = vulns.filter((v) =>
    [
      "panic-abort",
      "unchecked-return",
      "integer-overflow",
      "unsafe-math",
    ].includes(v.category),
  );
  return deductFromBase(100, codeVulns);
}

function calculateAccessControlScore(vulns: DetectedVulnerability[]): number {
  const authVulns = vulns.filter((v) =>
    [
      "unauthorized-access",
      "missing-auth",
      "cross-contract",
      "upgrade-safety",
    ].includes(v.category),
  );
  return deductFromBase(100, authVulns);
}

function calculateResourceSafetyScore(vulns: DetectedVulnerability[]): number {
  const resourceVulns = vulns.filter((v) =>
    [
      "reentrancy",
      "denial-of-service",
      "storage-exhaustion",
      "resource-leak",
      "timestamp-dependence",
    ].includes(v.category),
  );
  return deductFromBase(100, resourceVulns);
}

function calculateComplianceScore(results: ComplianceResult[]): number {
  if (results.length === 0) return 50;
  const passed = results.filter((r) => r.passed).length;
  return Math.round((passed / results.length) * 100);
}

function calculateAuditHistoryScore(audits: AuditRecord[]): number {
  if (audits.length === 0) return 30;
  const latestAudit = audits.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];

  const daysSinceAudit = Math.floor(
    (Date.now() - new Date(latestAudit.timestamp).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  let base = latestAudit.score.overall;
  if (daysSinceAudit > 365) base -= 20;
  else if (daysSinceAudit > 180) base -= 10;
  else if (daysSinceAudit > 90) base -= 5;

  if (audits.length >= 3) base += 10;
  else if (audits.length >= 2) base += 5;

  return Math.max(0, Math.min(100, base));
}

function deductFromBase(base: number, vulns: DetectedVulnerability[]): number {
  let score = base;
  for (const vuln of vulns) {
    const weight = SEVERITY_WEIGHTS[vuln.severity] || 0;
    const adjustedWeight = weight * vuln.confidence;
    score -= adjustedWeight;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreToGrade(score: number): SecurityScore["grade"] {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 55) return "text-orange-400";
  return "text-red-400";
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "text-red-500 bg-red-500/10 border-red-500/30";
    case "high":
      return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    case "medium":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "low":
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    case "info":
      return "text-gray-400 bg-gray-400/10 border-gray-400/30";
  }
}
