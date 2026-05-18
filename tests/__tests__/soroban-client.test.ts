import { SorobanContract } from "../../lib/soroban/client";
import * as StellarSdk from "@stellar/stellar-sdk";

// Mock StellarSdk to avoid network calls during tests
jest.mock("@stellar/stellar-sdk", () => {
    return {
        ...jest.requireActual("@stellar/stellar-sdk"),
        rpc: {
            Server: jest.fn().mockImplementation(() => ({
                simulateTransaction: jest.fn().mockResolvedValue({
                    results: [{ xdr: "AAAAAgAAAAE=" }], // Dummy XDR
                    minResourceFee: "1000000",
                    events: [],
                }),
            })),
            Api: {
                isSimulationSuccess: jest.fn().mockReturnValue(true),
                isSimulationError: jest.fn().mockReturnValue(false),
            },
        },
        Contract: jest.fn().mockImplementation(() => ({
            call: jest.fn().mockReturnValue({}),
        })),
        TransactionBuilder: jest.fn().mockImplementation(() => ({
            addOperation: jest.fn().mockReturnThis(),
            setTimeout: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({}),
        })),
        Account: jest.fn().mockImplementation(() => ({})),
        nativeToScVal: jest.fn().mockReturnValue({}),
        scValToNative: jest.fn().mockReturnValue("mockResult"),
        xdr: {
            ScVal: {
                fromXDR: jest.fn().mockReturnValue({}),
            },
        },
    };
});

describe("SorobanContract", () => {
    let contract: SorobanContract;

    beforeEach(() => {
        contract = new SorobanContract("CAT123", "testnet");
    });

    it("should perform readonly call and return result and metrics", async () => {
        const result = await contract.callReadOnly("hello", ["world"]);
        expect(result.result).toBe("mockResult");
        expect(result.metrics.costXlm).toBe("0.1000000"); // 1M stroops = 0.1 XLM
    });

    it("should handle simulation failures", async () => {
        const { rpc }: any = StellarSdk;
        rpc.Api.isSimulationSuccess.mockReturnValueOnce(false);

        await expect(contract.callReadOnly("hello")).rejects.toThrow("Simulation failed");
    });
});
