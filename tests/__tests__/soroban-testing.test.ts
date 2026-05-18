import { SorobanTestingEngine } from "../../lib/soroban/testing";

// Mock StellarSdk to avoid network calls during unit tests
jest.mock("@stellar/stellar-sdk", () => {
  return {
    rpc: {
      Server: jest.fn().mockImplementation(() => ({
        simulateTransaction: jest.fn().mockResolvedValue({
          results: [{ xdr: "AAAAAgAAAAE=" }],
          minResourceFee: "1000000",
          events: [],
        }),
      })),
      Api: {
        isSimulationSuccess: jest.fn().mockReturnValue(true),
        isSimulationError: jest.fn().mockReturnValue(false),
      },
    },
    Account: jest.fn().mockImplementation(() => ({})),
    Contract: jest.fn().mockImplementation(() => ({
      call: jest.fn().mockReturnValue({}),
    })),
    TransactionBuilder: jest.fn().mockImplementation(() => ({
      addOperation: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    })),
    TimeoutInfinite: 0,
    xdr: {
      ScVal: {
        fromXDR: jest.fn().mockReturnValue({}),
      },
    },
    nativeToScVal: jest.fn().mockReturnValue({}),
    scValToNative: jest.fn().mockReturnValue("mockResult"),
  };
});

describe("SorobanTestingEngine", () => {
  let engine: SorobanTestingEngine;

  beforeEach(() => {
    engine = new SorobanTestingEngine("testnet");
  });

  it("should calculate correct quality score", () => {
    const metrics = {
      cpuInstructions: 500000,
      ramBytes: 100000,
      ledgerReadBytes: 200,
      ledgerWriteBytes: 100,
      readCount: 1,
      writeCount: 1,
      costXlm: "0.01",
    };

    const score = engine.calculateQualityScore(metrics);
    expect(score).toBe(100);
  });

  it("should penalize high resource usage", () => {
    const metrics = {
      cpuInstructions: 2000000, // > 1M, -10
      ramBytes: 600000, // > 500K, -10
      ledgerReadBytes: 200,
      ledgerWriteBytes: 100,
      readCount: 1,
      writeCount: 1,
      costXlm: "0.2", // > 0.1, -20
    };

    const score = engine.calculateQualityScore(metrics);
    expect(score).toBe(60);
  });

  it("should simulate invocation and return results", async () => {
    const result = await engine.simulateInvocation("C...", "hello", []);
    expect(result.result).toBe("mockResult");
    expect(result.metrics.costXlm).toBe("0.1000000"); // 1,000,000 stroops / 10,000,000
  });
});
