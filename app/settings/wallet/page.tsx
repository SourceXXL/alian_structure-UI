import React from "react";
import WalletManager from "@/features/wallet/components/WalletManager";
import DelegationDashboard from "@/features/wallet/components/DelegationDashboard";
import SessionRecovery from "@/features/wallet/components/SessionRecovery";

export const metadata = {
  title: "Wallet Settings | stellAIverse",
  description: "Manage your linked Stellar wallets, delegations, and active session recovery.",
};

export default function WalletSettingsPage() {
  return (
    <main className="pt-24 pb-16 min-h-screen bg-cosmic-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold glow-text mb-4">Advanced Wallet Management</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Securely link multiple wallets, manage delegated signing permissions for your AI agents, and recover your session across sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <WalletManager />
            <SessionRecovery />
          </div>
          <div className="space-y-8">
            <DelegationDashboard />
            <div className="p-6 rounded-xl border border-cosmic-purple/20 nebula-bg space-y-4">
              <h2 className="text-xl font-bold text-white">Delegation Audit Log</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                <p className="text-xs text-gray-500 italic">Audit log functionality tracks all grant/revoke actions for security auditing.</p>
                {/* Audit logs would be listed here from walletService.getAuditLogs() */}
                <div className="p-3 bg-cosmic-dark/30 rounded border border-white/5 text-[10px] text-gray-500 font-mono">
                  No audit logs available for current session.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
