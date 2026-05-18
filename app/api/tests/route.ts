import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/mock-db";
import { SorobanTestingEngine } from "@/lib/soroban/testing";

export async function GET(request: NextRequest) {
  try {
    const testCases = await db.testCases.findMany();
    return NextResponse.json(testCases);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, ...payload } = data;

    if (action === "run") {
      const { testCaseId, contractId, functionName, args, network } = payload;

      const engine = new SorobanTestingEngine(network || "testnet");

      // Start execution entry
      const execution = await db.testExecutions.create({
        testCaseId: testCaseId || "adhoc",
        status: "running",
        logs: [],
        events: [],
        qualityScore: 0,
      });

      try {
        const results = await engine.simulateInvocation(
          contractId,
          functionName,
          args,
        );
        const qualityScore = engine.calculateQualityScore(results.metrics);

        const updated = await db.testExecutions.update(execution.id, {
          status: "completed",
          result: results.result,
          metrics: results.metrics,
          events: results.events,
          logs: results.logs,
          endTime: new Date().toISOString(),
          qualityScore,
        });

        return NextResponse.json(updated);
      } catch (execError: any) {
        await db.testExecutions.update(execution.id, {
          status: "failed",
          error: execError.message,
          endTime: new Date().toISOString(),
        });
        throw execError;
      }
    }

    if (action === "batch") {
      const { tests, network } = payload;
      const engine = new SorobanTestingEngine(network || "testnet");
      const results = [];

      for (const test of tests) {
        try {
          const res = await engine.simulateInvocation(
            test.contractId,
            test.functionName,
            test.args,
          );
          results.push({
            ...test,
            status: "completed",
            result: res.result,
            metrics: res.metrics,
            qualityScore: engine.calculateQualityScore(res.metrics),
          });
        } catch (err: any) {
          results.push({ ...test, status: "failed", error: err.message });
        }
      }
      return NextResponse.json({ results });
    }

    // Create test case
    const newTestCase = await db.testCases.create(payload);
    return NextResponse.json(newTestCase);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
