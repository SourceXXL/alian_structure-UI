import * as StellarSdk from "@stellar/stellar-sdk";
import { StellarNetwork } from "../types";
import { STELLAR_NETWORKS } from "../stellar-constants";
import {
  ContractAnalysisContext,
  DetectedVulnerability,
  ResourceOptimization,
  ScanRequest,
  Severity,
} from "./types";
import { SOROBAN_VULNERABILITIES } from "./vulnerabilities";

export class SorobanSecurityScanner {
  private server: any;
  private networkPassphrase: string;
  private network: StellarNetwork;

  constructor(network: StellarNetwork) {
    const config = STELLAR_NETWORKS[network];
    const rpcUrl =
      config.rpcUrl || config.horizonUrl.replace("horizon", "soroban-rpc");
    this.server = new (StellarSdk as any).rpc.Server(rpcUrl);
    this.networkPassphrase = config.networkPassphrase;
    this.network = network;
  }

  async analyzeContract(request: ScanRequest): Promise<{
    context: ContractAnalysisContext;
    vulnerabilities: DetectedVulnerability[];
    optimizations: ResourceOptimization[];
  }> {
    const context = await this.buildAnalysisContext(request);
    const vulnerabilities = this.detectVulnerabilities(context);
    const optimizations = request.includeOptimizations
      ? this.analyzeResourceUsage(context)
      : [];

    return { context, vulnerabilities, optimizations };
  }

  async buildAnalysisContext(
    request: ScanRequest,
  ): Promise<ContractAnalysisContext> {
    let functionSignatures: string[] = [];
    let storageKeys: string[] = [];
    let authRequired = false;
    let hasUpgradeFunction = false;
    let usesTokenInterface = false;
    let estimatedSizeByes = 0;
    let wasmHash: string | undefined;

    try {
      const contractData = await this.fetchContractInfo(request.contractId);
      functionSignatures = contractData.functions;
      storageKeys = contractData.storageKeys;
      wasmHash = contractData.wasmHash;
      estimatedSizeByes = contractData.sizeBytes;

      authRequired = functionSignatures.some(
        (fn) => fn.includes("require_auth") || fn.includes("auth"),
      );
      hasUpgradeFunction = functionSignatures.some(
        (fn) => fn.includes("upgrade") || fn.includes("update_wasm"),
      );
      usesTokenInterface = this.checkTokenInterface(functionSignatures);
    } catch {
      if (request.sourceCode) {
        const parsed = this.parseSourceCode(request.sourceCode);
        functionSignatures = parsed.functions;
        storageKeys = parsed.storageKeys;
        authRequired = parsed.authRequired;
        hasUpgradeFunction = parsed.hasUpgradeFunction;
        usesTokenInterface = parsed.usesTokenInterface;
        estimatedSizeByes = new TextEncoder().encode(request.sourceCode).length;
      }
    }

    return {
      contractId: request.contractId,
      network: request.network,
      wasmHash,
      sourceCode: request.sourceCode,
      functionSignatures,
      storageKeys,
      authRequired,
      hasUpgradeFunction,
      usesTokenInterface,
      estimatedSizeByes,
    };
  }

  private async fetchContractInfo(contractId: string): Promise<{
    functions: string[];
    storageKeys: string[];
    wasmHash?: string;
    sizeBytes: number;
  }> {
    try {
      const account = new StellarSdk.Account(
        "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        "0",
      );
      const contract = new StellarSdk.Contract(contractId);

      const probeFunctions = [
        "initialize",
        "mint",
        "transfer",
        "approve",
        "balance",
        "upgrade",
        "admin",
        "set_admin",
        "get_config",
        "name",
        "symbol",
        "decimals",
        "allowance",
        "burn",
      ];

      const discoveredFunctions: string[] = [];

      for (const fn of probeFunctions) {
        try {
          const tx = new StellarSdk.TransactionBuilder(account, {
            fee: "100",
            networkPassphrase: this.networkPassphrase,
          })
            .addOperation(contract.call(fn))
            .setTimeout(StellarSdk.TimeoutInfinite)
            .build();

          await this.server.simulateTransaction(tx);
          discoveredFunctions.push(fn);
        } catch {
          // function doesn't exist or requires args
        }
      }

      return {
        functions: discoveredFunctions,
        storageKeys: [],
        sizeBytes: 0,
      };
    } catch {
      return { functions: [], storageKeys: [], sizeBytes: 0 };
    }
  }

  private parseSourceCode(source: string): {
    functions: string[];
    storageKeys: string[];
    authRequired: boolean;
    hasUpgradeFunction: boolean;
    usesTokenInterface: boolean;
  } {
    const fnRegex = /(?:pub\s+)?fn\s+(\w+)/g;
    const functions: string[] = [];
    let match;
    while ((match = fnRegex.exec(source)) !== null) {
      functions.push(match[1]);
    }

    const storageRegex = /Symbol::(?:new|short)\("(\w+)"\)/g;
    const storageKeys: string[] = [];
    while ((match = storageRegex.exec(source)) !== null) {
      storageKeys.push(match[1]);
    }

    return {
      functions,
      storageKeys,
      authRequired: source.includes("require_auth"),
      hasUpgradeFunction: /fn\s+upgrade|fn\s+update_wasm/.test(source),
      usesTokenInterface: this.checkTokenInterface(functions),
    };
  }

  private checkTokenInterface(functions: string[]): boolean {
    const requiredTokenFns = ["transfer", "balance", "approve", "allowance"];
    const found = requiredTokenFns.filter((fn) =>
      functions.some((f) => f.toLowerCase().includes(fn)),
    );
    return found.length >= 3;
  }

  detectVulnerabilities(
    context: ContractAnalysisContext,
  ): DetectedVulnerability[] {
    const detected: DetectedVulnerability[] = [];
    const source = context.sourceCode || "";
    const fns = context.functionSignatures;

    for (const vuln of SOROBAN_VULNERABILITIES) {
      const result = this.checkVulnerability(vuln.id, context, source, fns);
      if (result) {
        detected.push(result);
      }
    }

    return detected.sort((a, b) => {
      const order: Record<Severity, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      return order[a.severity] - order[b.severity];
    });
  }

  private checkVulnerability(
    vulnId: string,
    context: ContractAnalysisContext,
    source: string,
    fns: string[],
  ): DetectedVulnerability | null {
    const vuln = SOROBAN_VULNERABILITIES.find((v) => v.id === vulnId);
    if (!vuln) return null;

    let detected = false;
    let confidence = 0;
    let location: string | undefined;

    switch (vulnId) {
      case "SRB-001": {
        if (source) {
          const hasExternalCall = vuln.patterns.some((p) => source.includes(p));
          const hasStateAfterCall =
            /invoke_contract[\s\S]{0,200}storage\(\)/.test(source);
          if (hasExternalCall && hasStateAfterCall) {
            detected = true;
            confidence = 0.7;
            location = "Cross-contract call followed by state mutation";
          }
        }
        break;
      }
      case "SRB-002": {
        if (source) {
          const hasUncheckedMath = /[+\-*]\s*(?!checked_)/.test(source);
          const noCheckedMath =
            !source.includes("checked_add") && !source.includes("checked_sub");
          if (hasUncheckedMath && noCheckedMath && source.includes("fn ")) {
            detected = true;
            confidence = 0.5;
            location = "Arithmetic operations without checked variants";
          }
        }
        break;
      }
      case "SRB-003": {
        const hasMutableFns = fns.some((f) =>
          [
            "mint",
            "transfer",
            "burn",
            "set_admin",
            "upgrade",
            "withdraw",
          ].includes(f),
        );
        if (hasMutableFns && !context.authRequired) {
          detected = true;
          confidence = 0.9;
          location = "State-modifying functions without auth checks";
        }
        if (source && hasMutableFns && !source.includes("require_auth")) {
          detected = true;
          confidence = 0.85;
          location = "Privileged functions missing require_auth()";
        }
        break;
      }
      case "SRB-004": {
        if (source) {
          const unwrapCount = (source.match(/\.unwrap\(\)/g) || []).length;
          const panicCount = (source.match(/panic!/g) || []).length;
          if (unwrapCount > 3 || panicCount > 0) {
            detected = true;
            confidence = 0.6 + Math.min(0.3, (unwrapCount + panicCount) * 0.05);
            location = `Found ${unwrapCount} unwrap() and ${panicCount} panic! calls`;
          }
        }
        break;
      }
      case "SRB-005": {
        if (source) {
          const hasPersistent =
            source.includes("persistent().set") ||
            source.includes("storage().persistent");
          const hasNoLimit =
            !source.includes("MAX_") &&
            !source.includes("max_") &&
            !source.includes("limit");
          if (hasPersistent && hasNoLimit) {
            detected = true;
            confidence = 0.55;
            location = "Persistent storage writes without size limits";
          }
        }
        break;
      }
      case "SRB-006": {
        if (source) {
          const loops = (source.match(/\bfor\b|\bwhile\b|\bloop\b/g) || [])
            .length;
          const hasNoBound =
            !source.includes("take(") && !source.includes("LIMIT");
          if (loops > 2 && hasNoBound) {
            detected = true;
            confidence = 0.5;
            location = `${loops} loops without explicit bounds`;
          }
        }
        break;
      }
      case "SRB-007": {
        if (source) {
          const hasCrossCall =
            source.includes("invoke_contract") || source.includes("try_invoke");
          const unchecked =
            !source.includes("match") && !source.includes("if let");
          if (hasCrossCall && unchecked) {
            detected = true;
            confidence = 0.5;
            location = "Cross-contract return values not pattern-matched";
          }
        }
        break;
      }
      case "SRB-008": {
        if (source && source.includes("timestamp")) {
          detected = true;
          confidence = 0.4;
          location = "Ledger timestamp usage detected";
        }
        break;
      }
      case "SRB-009": {
        if (source) {
          const divBeforeMul = /\/[\s\S]{0,30}\*/.test(source);
          if (divBeforeMul) {
            detected = true;
            confidence = 0.6;
            location = "Division before multiplication pattern";
          }
        }
        break;
      }
      case "SRB-010": {
        if (context.hasUpgradeFunction) {
          const singleAdmin =
            !source.includes("multisig") && !source.includes("multi_sig");
          if (singleAdmin) {
            detected = true;
            confidence = 0.65;
            location = "Admin/upgrade functions without multi-sig";
          }
        }
        break;
      }
      case "SRB-011": {
        if (source) {
          const hasPersistent = source.includes("persistent");
          const noTtl =
            !source.includes("extend_ttl") && !source.includes("bump");
          if (hasPersistent && noTtl) {
            detected = true;
            confidence = 0.7;
            location = "Persistent storage without TTL management";
          }
        }
        break;
      }
      case "SRB-012": {
        if (source) {
          const externalAddr =
            source.includes("Address") && source.includes("invoke_contract");
          const noWhitelist =
            !source.includes("whitelist") &&
            !source.includes("allowed_contracts");
          if (externalAddr && noWhitelist) {
            detected = true;
            confidence = 0.5;
            location = "External contract addresses not validated";
          }
        }
        break;
      }
      case "SRB-013": {
        if (context.usesTokenInterface) {
          const requiredFns = [
            "transfer",
            "balance",
            "approve",
            "allowance",
            "decimals",
            "name",
            "symbol",
          ];
          const missing = requiredFns.filter(
            (fn) => !fns.some((f) => f.includes(fn)),
          );
          if (missing.length > 0) {
            detected = true;
            confidence = 0.8;
            location = `Missing token interface functions: ${missing.join(", ")}`;
          }
        }
        break;
      }
      case "SRB-014": {
        if (context.hasUpgradeFunction && source) {
          const noMigration =
            !source.includes("migrate") && !source.includes("version");
          if (noMigration) {
            detected = true;
            confidence = 0.6;
            location = "Upgrade function without migration/versioning logic";
          }
        }
        break;
      }
    }

    if (!detected) return null;

    return {
      definitionId: vuln.id,
      title: vuln.title,
      severity: vuln.severity,
      category: vuln.category,
      description: vuln.description,
      remediation: vuln.remediation,
      location,
      confidence: Math.round(confidence * 100) / 100,
      cweId: vuln.cweId,
    };
  }

  analyzeResourceUsage(
    context: ContractAnalysisContext,
  ): ResourceOptimization[] {
    const optimizations: ResourceOptimization[] = [];
    const source = context.sourceCode || "";

    if (context.estimatedSizeByes > 256 * 1024) {
      optimizations.push({
        category: "storage",
        title: "Contract size exceeds recommended limit",
        description:
          "Large WASM binaries increase deployment cost and ledger storage rent.",
        currentValue: `${Math.round(context.estimatedSizeByes / 1024)}KB`,
        suggestedValue: "< 256KB",
        estimatedSavings: `~${(((context.estimatedSizeByes - 256 * 1024) / 1024) * 0.001).toFixed(4)} XLM/day rent`,
        priority: "medium",
      });
    }

    if (source.includes("Vec<") && !source.includes("Map<")) {
      const vecCount = (source.match(/Vec</g) || []).length;
      if (vecCount > 5) {
        optimizations.push({
          category: "memory",
          title: "Consider Map for key-value lookups",
          description:
            "Multiple Vec usages detected. Map provides O(1) lookups vs O(n) for Vec iteration.",
          currentValue: `${vecCount} Vec instances`,
          suggestedValue: "Use Map for keyed data",
          estimatedSavings: "Reduced CPU instructions per lookup",
          priority: "low",
        });
      }
    }

    if (source && !source.includes("#[cfg(test)]")) {
      optimizations.push({
        category: "cost",
        title: "Add unit tests for gas estimation",
        description:
          "Including test modules helps estimate resource costs before deployment.",
        currentValue: "No test module",
        suggestedValue: "Add #[cfg(test)] mod tests",
        estimatedSavings: "Prevent costly deployment failures",
        priority: "low",
      });
    }

    if (context.storageKeys.length > 20) {
      optimizations.push({
        category: "storage",
        title: "High number of storage keys",
        description:
          "Many storage keys increase ledger I/O costs. Consider consolidating related data.",
        currentValue: `${context.storageKeys.length} keys`,
        suggestedValue: "< 20 keys",
        estimatedSavings: `~${(context.storageKeys.length * 0.0001).toFixed(4)} XLM per transaction`,
        priority: "medium",
      });
    }

    const persistentWrites = (source.match(/persistent\(\)\.set/g) || [])
      .length;
    if (persistentWrites > 10) {
      optimizations.push({
        category: "cost",
        title: "Consolidate persistent storage writes",
        description:
          "Multiple individual storage writes are more expensive than batch operations.",
        currentValue: `${persistentWrites} individual writes`,
        suggestedValue: "Batch writes where possible",
        estimatedSavings: `~${(persistentWrites * 0.0005).toFixed(4)} XLM per invocation`,
        priority: "medium",
      });
    }

    return optimizations;
  }
}
