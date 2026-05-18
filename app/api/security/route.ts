import { NextRequest, NextResponse } from "next/server";
import { SorobanSecurityScanner } from "@/lib/security/scanner";
import { runComplianceChecks } from "@/lib/security/compliance";
import { calculateSecurityScore } from "@/lib/security/scoring";
import {
  generateSecurityReport,
  exportReportAsCsv,
  exportReportAsMarkdown,
} from "@/lib/security/report";
import { ScanRequest, AuditRecord } from "@/lib/security/types";

const auditStore: AuditRecord[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: ScanRequest & {
      action?: string;
      format?: string;
      auditRecord?: AuditRecord;
    } = await request.json();
    const { action } = body;

    if (action === "scan") {
      const scanner = new SorobanSecurityScanner(body.network);
      const { context, vulnerabilities, optimizations } =
        await scanner.analyzeContract(body);
      const compliance =
        body.includeCompliance !== false ? runComplianceChecks(context) : [];
      const contractAudits = auditStore.filter(
        (a) => a.contractId === body.contractId,
      );
      const score = calculateSecurityScore(
        vulnerabilities,
        compliance,
        contractAudits,
      );

      const report = generateSecurityReport({
        contractId: body.contractId,
        network: body.network,
        score,
        vulnerabilities,
        compliance,
        optimizations,
        auditHistory: contractAudits,
      });

      return NextResponse.json({ success: true, report });
    }

    if (action === "export") {
      const scanner = new SorobanSecurityScanner(body.network);
      const { context, vulnerabilities, optimizations } =
        await scanner.analyzeContract(body);
      const compliance = runComplianceChecks(context);
      const contractAudits = auditStore.filter(
        (a) => a.contractId === body.contractId,
      );
      const score = calculateSecurityScore(
        vulnerabilities,
        compliance,
        contractAudits,
      );

      const report = generateSecurityReport({
        contractId: body.contractId,
        network: body.network,
        score,
        vulnerabilities,
        compliance,
        optimizations,
        auditHistory: contractAudits,
      });

      if (body.format === "csv") {
        const csv = exportReportAsCsv(report);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=security-report-${body.contractId}.csv`,
          },
        });
      }

      if (body.format === "markdown") {
        const md = exportReportAsMarkdown(report);
        return new NextResponse(md, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename=security-report-${body.contractId}.md`,
          },
        });
      }

      return NextResponse.json({ success: true, report });
    }

    if (action === "record-audit") {
      if (body.auditRecord) {
        auditStore.push(body.auditRecord);
        return NextResponse.json({ success: true, message: "Audit recorded" });
      }
      return NextResponse.json(
        { error: "Missing auditRecord" },
        { status: 400 },
      );
    }

    if (action === "audit-history") {
      const audits = auditStore.filter((a) => a.contractId === body.contractId);
      return NextResponse.json({ success: true, audits });
    }

    return NextResponse.json(
      {
        error: "Invalid action. Use: scan, export, record-audit, audit-history",
      },
      { status: 400 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "StellAIverse Security Scanner",
    version: "1.0.0",
    actions: ["scan", "export", "record-audit", "audit-history"],
    supported_networks: ["mainnet", "testnet", "futurenet"],
  });
}
