import { STORAGE_KEYS } from "../stellar-constants";
import { LinkedWallet, Delegation, DelegationAuditLog, SessionRecoveryState } from "./types";

export const walletService = {
  getLinkedWallets(): LinkedWallet[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEYS.LINKED_WALLETS);
    return saved ? JSON.parse(saved) : [];
  },

  saveLinkedWallets(wallets: LinkedWallet[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.LINKED_WALLETS, JSON.stringify(wallets));
  },

  getDelegations(): Delegation[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEYS.DELEGATIONS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDelegations(delegations: Delegation[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.DELEGATIONS, JSON.stringify(delegations));
  },

  getAuditLogs(): DelegationAuditLog[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("stellar_delegation_audit_logs");
    return saved ? JSON.parse(saved) : [];
  },

  addAuditLog(log: Omit<DelegationAuditLog, "id" | "timestamp">) {
    if (typeof window === "undefined") return;
    const logs = this.getAuditLogs();
    const newLog: DelegationAuditLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem("stellar_delegation_audit_logs", JSON.stringify(logs));
  },

  recoverSession(): SessionRecoveryState | null {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION_RECOVERY);
    return saved ? JSON.parse(saved) : null;
  },

  saveSessionRecovery(state: SessionRecoveryState) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.SESSION_RECOVERY, JSON.stringify(state));
  }
};
