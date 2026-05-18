import {
  SecurityReport,
  DetectedVulnerability,
  ComplianceResult,
  ResourceOptimization,
  SecurityScore,
  SecurityBadgeInfo,
  AuditRecord,
  Severity,
} from "./types";
import { StellarNetwork } from "../types";

export function generateSecurityReport(params: {
  contractId: string;
  network: StellarNetwork;
  score: SecurityScore;
  vulnerabilities: DetectedVulnerability[];
  compliance: ComplianceResult[];
  optimizations: ResourceOptimization[];
  auditHistory: AuditRecord[];
}): SecurityReport {
  const badges = determineBadges(
    params.score,
    params.vulnerabilities,
    params.compliance,
    params.auditHistory,
  );
  const summary = generateSummary(
    params.score,
    params.vulnerabilities,
    params.compliance,
  );

  return {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    contractId: params.contractId,
    network: params.network,
    generatedAt: new Date().toISOString(),
    score: params.score,
    vulnerabilities: params.vulnerabilities,
    compliance: params.compliance,
    optimizations: params.optimizations,
    badges,
    auditHistory: params.auditHistory,
    summary,
  };
}

function determineBadges(
  score: SecurityScore,
  vulns: DetectedVulnerability[],
  compliance: ComplianceResult[],
  audits: AuditRecord[],
): SecurityBadgeInfo[] {
  const badges: SecurityBadgeInfo[] = [];
  const now = new Date().toISOString();

  const criticalCount = vulns.filter((v) => v.severity === "critical").length;
  const highCount = vulns.filter((v) => v.severity === "high").length;

  if (score.overall >= 85 && criticalCount === 0 && highCount === 0) {
    badges.push({
      type: "verified",
      label: "Security Verified",
      issuer: "StellAIverse Scanner",
      issuedAt: now,
      score: score.overall,
    });
  }

  if (audits.length > 0) {
    const latest = audits[0];
    badges.push({
      type: "audited",
      label: "Professionally Audited",
      issuer: latest.auditor,
      issuedAt: latest.timestamp,
      txHash: latest.txHash,
      score: latest.score.overall,
    });
  }

  const allRequiredPassed = compliance.every(
    (c) => c.passed || c.severity === "info",
  );
  if (allRequiredPassed && compliance.length > 0) {
    badges.push({
      type: "compliant",
      label: "Stellar Standards Compliant",
      issuer: "StellAIverse Compliance",
      issuedAt: now,
    });
  }

  if (
    score.overall >= 95 &&
    criticalCount === 0 &&
    highCount === 0 &&
    audits.length >= 2
  ) {
    badges.push({
      type: "certified",
      label: "StellAIverse Certified",
      issuer: "StellAIverse",
      issuedAt: now,
      score: score.overall,
    });
  }

  return badges;
}

function generateSummary(
  score: SecurityScore,
  vulns: DetectedVulnerability[],
  compliance: ComplianceResult[],
): string {
  const criticalCount = vulns.filter((v) => v.severity === "critical").length;
  const highCount = vulns.filter((v) => v.severity === "high").length;
  const mediumCount = vulns.filter((v) => v.severity === "medium").length;
  const failedCompliance = compliance.filter((c) => !c.passed).length;

  const parts: string[] = [];
  parts.push(`Security Score: ${score.overall}/100 (Grade: ${score.grade}).`);

  if (vulns.length === 0) {
    parts.push("No vulnerabilities detected.");
  } else {
    const counts: string[] = [];
    if (criticalCount > 0) counts.push(`${criticalCount} critical`);
    if (highCount > 0) counts.push(`${highCount} high`);
    if (mediumCount > 0) counts.push(`${mediumCount} medium`);
    parts.push(`Found ${vulns.length} issue(s): ${counts.join(", ")}.`);
  }

  if (failedCompliance > 0) {
    parts.push(`${failedCompliance} compliance check(s) failed.`);
  } else if (compliance.length > 0) {
    parts.push("All compliance checks passed.");
  }

  if (score.overall >= 85) {
    parts.push("This contract meets recommended security standards.");
  } else if (score.overall >= 55) {
    parts.push(
      "This contract requires attention on flagged issues before production deployment.",
    );
  } else {
    parts.push(
      "This contract has significant security concerns that must be addressed.",
    );
  }

  return parts.join(" ");
}

export function exportReportAsJson(report: SecurityReport): string {
  return JSON.stringify(report, null, 2);
}

export function exportReportAsCsv(report: SecurityReport): string {
  const lines: string[] = [];

  lines.push("Section,Field,Value");
  lines.push(`Overview,Contract ID,${report.contractId}`);
  lines.push(`Overview,Network,${report.network}`);
  lines.push(`Overview,Generated,${report.generatedAt}`);
  lines.push(`Overview,Overall Score,${report.score.overall}`);
  lines.push(`Overview,Grade,${report.score.grade}`);
  lines.push(
    `Score Breakdown,Code Quality,${report.score.breakdown.codeQuality}`,
  );
  lines.push(
    `Score Breakdown,Access Control,${report.score.breakdown.accessControl}`,
  );
  lines.push(
    `Score Breakdown,Resource Safety,${report.score.breakdown.resourceSafety}`,
  );
  lines.push(`Score Breakdown,Compliance,${report.score.breakdown.compliance}`);
  lines.push(
    `Score Breakdown,Audit History,${report.score.breakdown.auditHistory}`,
  );

  lines.push("");
  lines.push("Vulnerability ID,Title,Severity,Category,Confidence,Location");
  for (const v of report.vulnerabilities) {
    lines.push(
      `${v.definitionId},"${v.title}",${v.severity},${v.category},${v.confidence},"${v.location || ""}"`,
    );
  }

  lines.push("");
  lines.push("Compliance Rule,Passed,Severity,Message");
  for (const c of report.compliance) {
    lines.push(`${c.ruleId},${c.passed},${c.severity},"${c.message}"`);
  }

  lines.push("");
  lines.push("Optimization,Category,Priority,Current,Suggested,Savings");
  for (const o of report.optimizations) {
    lines.push(
      `"${o.title}",${o.category},${o.priority},"${o.currentValue}","${o.suggestedValue}","${o.estimatedSavings}"`,
    );
  }

  return lines.join("\n");
}

export function exportReportAsMarkdown(report: SecurityReport): string {
  const lines: string[] = [];
  const severityIcon = (s: Severity) => {
    switch (s) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      default:
        return "ℹ️";
    }
  };

  lines.push(`# Security Audit Report`);
  lines.push("");
  lines.push(`**Contract:** \`${report.contractId}\``);
  lines.push(`**Network:** ${report.network}`);
  lines.push(`**Date:** ${new Date(report.generatedAt).toLocaleDateString()}`);
  lines.push(`**Score:** ${report.score.overall}/100 (${report.score.grade})`);
  lines.push("");

  lines.push("## Score Breakdown");
  lines.push("| Category | Score |");
  lines.push("|----------|-------|");
  lines.push(`| Code Quality | ${report.score.breakdown.codeQuality} |`);
  lines.push(`| Access Control | ${report.score.breakdown.accessControl} |`);
  lines.push(`| Resource Safety | ${report.score.breakdown.resourceSafety} |`);
  lines.push(`| Compliance | ${report.score.breakdown.compliance} |`);
  lines.push(`| Audit History | ${report.score.breakdown.auditHistory} |`);
  lines.push("");

  if (report.vulnerabilities.length > 0) {
    lines.push("## Vulnerabilities");
    for (const v of report.vulnerabilities) {
      lines.push(
        `### ${severityIcon(v.severity)} ${v.title} (${v.definitionId})`,
      );
      lines.push(`- **Severity:** ${v.severity}`);
      lines.push(`- **Confidence:** ${Math.round(v.confidence * 100)}%`);
      if (v.location) lines.push(`- **Location:** ${v.location}`);
      lines.push(`- **Description:** ${v.description}`);
      lines.push(`- **Remediation:** ${v.remediation}`);
      lines.push("");
    }
  }

  if (report.compliance.length > 0) {
    lines.push("## Compliance");
    lines.push("| Rule | Status | Severity | Details |");
    lines.push("|------|--------|----------|---------|");
    for (const c of report.compliance) {
      const status = c.passed ? "✅" : "❌";
      lines.push(`| ${c.ruleId} | ${status} | ${c.severity} | ${c.message} |`);
    }
    lines.push("");
  }

  if (report.optimizations.length > 0) {
    lines.push("## Resource Optimizations");
    for (const o of report.optimizations) {
      lines.push(`### ${o.title}`);
      lines.push(`- **Category:** ${o.category}`);
      lines.push(`- **Current:** ${o.currentValue}`);
      lines.push(`- **Suggested:** ${o.suggestedValue}`);
      lines.push(`- **Estimated Savings:** ${o.estimatedSavings}`);
      lines.push("");
    }
  }

  if (report.badges.length > 0) {
    lines.push("## Badges");
    for (const b of report.badges) {
      lines.push(
        `- **${b.label}** — Issued by ${b.issuer} on ${new Date(b.issuedAt).toLocaleDateString()}`,
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Report generated by StellAIverse Security Scanner*`);

  return lines.join("\n");
}
