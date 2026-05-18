import {
  SOROBAN_VULNERABILITIES,
  getVulnerabilityById,
  getVulnerabilitiesByCategory,
  getVulnerabilitiesBySeverity,
  getSorobanSpecificVulnerabilities,
} from "../../lib/security/vulnerabilities";
import { SorobanSecurityScanner } from "../../lib/security/scanner";
import { ContractAnalysisContext } from "../../lib/security/types";

jest.mock("@stellar/stellar-sdk", () => ({
  rpc: {
    Server: jest.fn().mockImplementation(() => ({
      simulateTransaction: jest.fn().mockRejectedValue(new Error("mock")),
    })),
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
  xdr: { ScVal: { fromXDR: jest.fn() } },
  nativeToScVal: jest.fn(),
}));

describe("Vulnerability Database", () => {
  it("should contain at least 10 vulnerability definitions", () => {
    expect(SOROBAN_VULNERABILITIES.length).toBeGreaterThanOrEqual(10);
  });

  it("should have unique IDs for all vulnerabilities", () => {
    const ids = SOROBAN_VULNERABILITIES.map((v) => v.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have all required fields for each vulnerability", () => {
    for (const vuln of SOROBAN_VULNERABILITIES) {
      expect(vuln.id).toBeTruthy();
      expect(vuln.category).toBeTruthy();
      expect(vuln.title).toBeTruthy();
      expect(vuln.description).toBeTruthy();
      expect(vuln.severity).toBeTruthy();
      expect(vuln.remediation).toBeTruthy();
      expect(vuln.patterns.length).toBeGreaterThan(0);
    }
  });

  it("should find vulnerability by ID", () => {
    const vuln = getVulnerabilityById("SRB-001");
    expect(vuln).toBeDefined();
    expect(vuln?.category).toBe("reentrancy");
  });

  it("should return undefined for unknown ID", () => {
    expect(getVulnerabilityById("UNKNOWN")).toBeUndefined();
  });

  it("should filter by category", () => {
    const authVulns = getVulnerabilitiesByCategory("unauthorized-access");
    expect(authVulns.length).toBeGreaterThan(0);
    authVulns.forEach((v) => expect(v.category).toBe("unauthorized-access"));
  });

  it("should filter by severity", () => {
    const criticals = getVulnerabilitiesBySeverity("critical");
    expect(criticals.length).toBeGreaterThan(0);
    criticals.forEach((v) => expect(v.severity).toBe("critical"));
  });

  it("should return Soroban-specific vulnerabilities", () => {
    const sorobanVulns = getSorobanSpecificVulnerabilities();
    expect(sorobanVulns.length).toBeGreaterThan(5);
    sorobanVulns.forEach((v) => expect(v.sorobanSpecific).toBe(true));
  });
});

describe("SorobanSecurityScanner", () => {
  let scanner: SorobanSecurityScanner;

  beforeEach(() => {
    scanner = new SorobanSecurityScanner("testnet");
  });

  describe("detectVulnerabilities", () => {
    it("should detect missing auth in source code", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: ["mint", "transfer", "burn"],
        storageKeys: [],
        authRequired: false,
        hasUpgradeFunction: false,
        usesTokenInterface: false,
        estimatedSizeByes: 1000,
        sourceCode: `
          pub fn mint(env: Env, to: Address, amount: i128) {
            let balance = env.storage().persistent().get(&to).unwrap();
            env.storage().persistent().set(&to, &(balance + amount));
          }
          pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
            let b = env.storage().persistent().get(&from).unwrap();
          }
        `,
      };

      const vulns = scanner.detectVulnerabilities(context);
      const authVuln = vulns.find((v) => v.category === "unauthorized-access");
      expect(authVuln).toBeDefined();
      expect(authVuln?.severity).toBe("critical");
    });

    it("should detect unwrap abuse", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: [],
        storageKeys: [],
        authRequired: true,
        hasUpgradeFunction: false,
        usesTokenInterface: false,
        estimatedSizeByes: 1000,
        sourceCode: `
          fn foo(env: Env) {
            let a = something.unwrap();
            let b = other.unwrap();
            let c = third.unwrap();
            let d = fourth.unwrap();
          }
        `,
      };

      const vulns = scanner.detectVulnerabilities(context);
      const panicVuln = vulns.find((v) => v.category === "panic-abort");
      expect(panicVuln).toBeDefined();
    });

    it("should detect storage without TTL", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: [],
        storageKeys: [],
        authRequired: true,
        hasUpgradeFunction: false,
        usesTokenInterface: false,
        estimatedSizeByes: 1000,
        sourceCode: `
          fn store(env: Env) {
            env.storage().persistent().set(&key, &value);
          }
        `,
      };

      const vulns = scanner.detectVulnerabilities(context);
      const storageVuln = vulns.find((v) => v.category === "resource-leak");
      expect(storageVuln).toBeDefined();
    });

    it("should detect unsafe upgrade path", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: ["upgrade"],
        storageKeys: [],
        authRequired: true,
        hasUpgradeFunction: true,
        usesTokenInterface: false,
        estimatedSizeByes: 1000,
        sourceCode: `
          pub fn upgrade(env: Env, new_wasm: BytesN<32>) {
            env.deployer().update_wasm(new_wasm);
          }
        `,
      };

      const vulns = scanner.detectVulnerabilities(context);
      const upgradeVuln = vulns.find((v) => v.category === "upgrade-safety");
      expect(upgradeVuln).toBeDefined();
    });

    it("should return vulnerabilities sorted by severity", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: ["mint", "upgrade"],
        storageKeys: [],
        authRequired: false,
        hasUpgradeFunction: true,
        usesTokenInterface: false,
        estimatedSizeByes: 1000,
        sourceCode: `
          pub fn mint(env: Env) {
            let x = a.unwrap();
            let y = b.unwrap();
            let z = c.unwrap();
            let w = d.unwrap();
            env.storage().persistent().set(&key, &value);
            env.ledger().timestamp();
          }
          pub fn upgrade(env: Env, hash: BytesN<32>) {
            env.deployer().update_wasm(hash);
          }
        `,
      };

      const vulns = scanner.detectVulnerabilities(context);
      expect(vulns.length).toBeGreaterThan(0);

      const severityOrder = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      for (let i = 1; i < vulns.length; i++) {
        expect(severityOrder[vulns[i].severity]).toBeGreaterThanOrEqual(
          severityOrder[vulns[i - 1].severity],
        );
      }
    });

    it("should return empty array for clean contract", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: ["get_value"],
        storageKeys: [],
        authRequired: true,
        hasUpgradeFunction: false,
        usesTokenInterface: false,
        estimatedSizeByes: 1000,
      };

      const vulns = scanner.detectVulnerabilities(context);
      const criticals = vulns.filter((v) => v.severity === "critical");
      expect(criticals.length).toBe(0);
    });
  });

  describe("analyzeResourceUsage", () => {
    it("should flag large contract size", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: [],
        storageKeys: [],
        authRequired: true,
        hasUpgradeFunction: false,
        usesTokenInterface: false,
        estimatedSizeByes: 512 * 1024,
        sourceCode: "",
      };

      const opts = scanner.analyzeResourceUsage(context);
      const sizeOpt = opts.find(
        (o) => o.category === "storage" && o.title.includes("size"),
      );
      expect(sizeOpt).toBeDefined();
    });

    it("should return empty for optimized contract", () => {
      const context: ContractAnalysisContext = {
        contractId: "CTEST",
        network: "testnet",
        functionSignatures: [],
        storageKeys: [],
        authRequired: true,
        hasUpgradeFunction: false,
        usesTokenInterface: false,
        estimatedSizeByes: 10000,
        sourceCode: "#[cfg(test)] mod tests {}",
      };

      const opts = scanner.analyzeResourceUsage(context);
      expect(opts.length).toBe(0);
    });
  });
});
