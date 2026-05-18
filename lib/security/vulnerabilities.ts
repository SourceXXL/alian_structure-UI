import { VulnerabilityDefinition } from "./types";

export const SOROBAN_VULNERABILITIES: VulnerabilityDefinition[] = [
  {
    id: "SRB-001",
    category: "reentrancy",
    title: "Cross-Contract Reentrancy",
    description:
      "Contract may be vulnerable to reentrancy through cross-contract calls. Soroban contracts calling external contracts without proper state management can be re-entered before the first invocation completes.",
    severity: "critical",
    cweId: "CWE-841",
    remediation:
      "Use checks-effects-interactions pattern. Update all state before making cross-contract calls. Consider using reentrancy guards via storage flags.",
    sorobanSpecific: true,
    patterns: ["cross_contract_call", "invoke_contract", "try_invoke"],
    references: ["https://soroban.stellar.org/docs/learn/security"],
  },
  {
    id: "SRB-002",
    category: "integer-overflow",
    title: "Arithmetic Overflow/Underflow",
    description:
      "Unchecked arithmetic operations may overflow or underflow. While Rust panics on overflow in debug mode, release builds wrap silently unless checked arithmetic is used.",
    severity: "high",
    cweId: "CWE-190",
    remediation:
      "Use checked_add, checked_sub, checked_mul, checked_div instead of raw operators. Use saturating or wrapping arithmetic where overflow is acceptable.",
    sorobanSpecific: false,
    patterns: [
      "overflow",
      "underflow",
      "unchecked_add",
      "unchecked_mul",
      "wrapping_add",
    ],
    references: ["https://doc.rust-lang.org/book/ch03-02-data-types.html"],
  },
  {
    id: "SRB-003",
    category: "unauthorized-access",
    title: "Missing Authorization Check",
    description:
      "Contract function lacks proper authorization verification. Functions that modify state or transfer assets must verify the caller has permission to perform the action.",
    severity: "critical",
    cweId: "CWE-862",
    remediation:
      "Add require_auth() or require_auth_for_args() checks at the start of all privileged functions. Use Soroban's built-in auth framework.",
    sorobanSpecific: true,
    patterns: ["require_auth", "auth", "Address::require_auth"],
    references: ["https://soroban.stellar.org/docs/learn/authorization"],
  },
  {
    id: "SRB-004",
    category: "panic-abort",
    title: "Unhandled Panic / Abort",
    description:
      "Contract uses panic! or unwrap() which can cause unexpected aborts. Panics in Soroban contracts consume resources without completing the transaction.",
    severity: "medium",
    cweId: "CWE-248",
    remediation:
      "Replace unwrap() with proper error handling using Result types. Define contract-specific error enums with #[contracterror]. Use ok_or() or map_err() for conversions.",
    sorobanSpecific: true,
    patterns: ["unwrap()", "panic!", "expect(", "unreachable!"],
    references: ["https://soroban.stellar.org/docs/learn/errors"],
  },
  {
    id: "SRB-005",
    category: "storage-exhaustion",
    title: "Unbounded Storage Growth",
    description:
      "Contract stores data without bounds, potentially exhausting ledger storage. Soroban charges rent for persistent storage, making unbounded growth expensive.",
    severity: "high",
    cweId: "CWE-770",
    remediation:
      "Implement storage limits and cleanup mechanisms. Use temporary storage for transient data. Set appropriate TTL values with extend_ttl(). Prefer instance storage for small, frequently-accessed data.",
    sorobanSpecific: true,
    patterns: ["persistent().set", "storage().persistent", "extend_ttl"],
    references: ["https://soroban.stellar.org/docs/learn/storage"],
  },
  {
    id: "SRB-006",
    category: "denial-of-service",
    title: "Resource Exhaustion DoS",
    description:
      "Contract operations may exceed Soroban resource limits (CPU instructions, memory, ledger I/O) causing transaction failure and potential denial of service.",
    severity: "high",
    cweId: "CWE-400",
    remediation:
      "Avoid unbounded loops and recursive calls. Process data in batches. Pre-compute expensive operations off-chain when possible. Monitor resource usage with simulation.",
    sorobanSpecific: true,
    patterns: ["loop", "for.*in", "while", "recursive"],
    references: ["https://soroban.stellar.org/docs/learn/limits"],
  },
  {
    id: "SRB-007",
    category: "unchecked-return",
    title: "Unchecked Cross-Contract Return",
    description:
      "Return values from cross-contract calls are not validated. Failed sub-calls may return unexpected values that propagate silently.",
    severity: "medium",
    cweId: "CWE-252",
    remediation:
      "Always check return values from cross-contract invocations. Use pattern matching or if-let to handle all possible return variants.",
    sorobanSpecific: true,
    patterns: ["invoke_contract", "try_invoke", "call"],
    references: [
      "https://soroban.stellar.org/docs/learn/interacting-with-contracts",
    ],
  },
  {
    id: "SRB-008",
    category: "timestamp-dependence",
    title: "Ledger Timestamp Manipulation",
    description:
      "Contract logic depends on ledger timestamps which can be slightly manipulated by validators. Time-sensitive operations may be exploitable.",
    severity: "low",
    cweId: "CWE-829",
    remediation:
      "Use ledger sequence numbers instead of timestamps for ordering. Add tolerance windows for time-based conditions. Avoid using timestamps for randomness.",
    sorobanSpecific: true,
    patterns: ["ledger().timestamp", "env.ledger().timestamp"],
    references: ["https://soroban.stellar.org/docs/learn/environment"],
  },
  {
    id: "SRB-009",
    category: "unsafe-math",
    title: "Precision Loss in Token Calculations",
    description:
      "Division before multiplication or improper decimal handling leads to precision loss in token amount calculations.",
    severity: "medium",
    cweId: "CWE-682",
    remediation:
      "Multiply before dividing to preserve precision. Use fixed-point arithmetic libraries. Document expected precision for all calculations.",
    sorobanSpecific: false,
    patterns: ["div", "ratio", "percent", "decimal"],
    references: [],
  },
  {
    id: "SRB-010",
    category: "missing-auth",
    title: "Admin Function Without Multi-sig",
    description:
      "Critical admin functions (upgrade, pause, config change) are controlled by a single address without multi-signature protection.",
    severity: "high",
    cweId: "CWE-284",
    remediation:
      "Implement multi-sig or DAO governance for admin operations. Use timelocks for sensitive changes. Consider Stellar multisig accounts as admin.",
    sorobanSpecific: true,
    patterns: ["admin", "owner", "upgrade", "set_admin"],
    references: ["https://soroban.stellar.org/docs/learn/authorization"],
  },
  {
    id: "SRB-011",
    category: "resource-leak",
    title: "Storage TTL Misconfiguration",
    description:
      "Persistent storage entries have incorrect or missing TTL extension. Data may expire unexpectedly or incur unnecessary rent costs.",
    severity: "medium",
    cweId: "CWE-404",
    remediation:
      "Set appropriate TTL values based on data lifecycle. Call extend_ttl() in access paths. Use temporary storage for short-lived data.",
    sorobanSpecific: true,
    patterns: ["extend_ttl", "bump", "ttl"],
    references: ["https://soroban.stellar.org/docs/learn/storage"],
  },
  {
    id: "SRB-012",
    category: "cross-contract",
    title: "Unvalidated External Contract Address",
    description:
      "Contract interacts with external contract addresses provided by users without validation. Malicious contracts could be substituted.",
    severity: "high",
    cweId: "CWE-20",
    remediation:
      "Maintain a whitelist of approved contract addresses. Validate contract interfaces before interaction. Store trusted contract addresses in admin-controlled storage.",
    sorobanSpecific: true,
    patterns: ["Address", "contract_id", "invoke_contract"],
    references: [
      "https://soroban.stellar.org/docs/learn/interacting-with-contracts",
    ],
  },
  {
    id: "SRB-013",
    category: "token-standard",
    title: "Non-Compliant Token Interface",
    description:
      "Token contract does not fully implement the Soroban Token Interface (SEP-41). Missing required functions may cause interoperability issues.",
    severity: "medium",
    cweId: "CWE-439",
    remediation:
      "Implement all required SEP-41 token interface functions: initialize, mint, burn, transfer, approve, allowance, balance, decimals, name, symbol.",
    sorobanSpecific: true,
    patterns: ["token", "TokenInterface", "SEP-41", "transfer", "approve"],
    references: ["https://stellar.org/protocol/sep-41"],
  },
  {
    id: "SRB-014",
    category: "upgrade-safety",
    title: "Unsafe Contract Upgrade Path",
    description:
      "Contract upgrade mechanism does not validate the new WASM hash or lacks migration logic. Upgrades could break storage layout or lose data.",
    severity: "critical",
    cweId: "CWE-669",
    remediation:
      "Validate WASM hash before upgrade. Implement storage migration functions. Test upgrade paths thoroughly. Add version tracking in storage.",
    sorobanSpecific: true,
    patterns: ["upgrade", "update_wasm", "set_wasm_hash"],
    references: ["https://soroban.stellar.org/docs/learn/upgrading-contracts"],
  },
];

export function getVulnerabilityById(
  id: string,
): VulnerabilityDefinition | undefined {
  return SOROBAN_VULNERABILITIES.find((v) => v.id === id);
}

export function getVulnerabilitiesByCategory(
  category: string,
): VulnerabilityDefinition[] {
  return SOROBAN_VULNERABILITIES.filter((v) => v.category === category);
}

export function getVulnerabilitiesBySeverity(
  severity: string,
): VulnerabilityDefinition[] {
  return SOROBAN_VULNERABILITIES.filter((v) => v.severity === severity);
}

export function getSorobanSpecificVulnerabilities(): VulnerabilityDefinition[] {
  return SOROBAN_VULNERABILITIES.filter((v) => v.sorobanSpecific);
}
