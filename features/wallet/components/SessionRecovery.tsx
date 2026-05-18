"use client";

import React, { useState } from "react";
import { useStellarWallet } from "@/components/context/StellarWalletProvider";

export default function SessionRecovery() {
  const { recoverSession } = useStellarWallet();
  const [recovering, setRecovering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRecover = async () => {
    setRecovering(true);
    setMessage(null);
    try {
      await recoverSession();
      setMessage("Session recovered successfully.");
    } catch (err: any) {
      setMessage(err.message || "No session found to recover.");
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-cosmic-purple/20 nebula-bg space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔄</span>
        <div>
          <h2 className="text-xl font-bold text-white">Session Recovery</h2>
          <p className="text-xs text-gray-500">Restore your linked wallets and active session from local encrypted storage.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleRecover}
          disabled={recovering}
          className="w-full py-2 bg-cosmic-dark/50 border border-cosmic-purple/30 rounded-lg text-sm font-bold hover:bg-cosmic-purple/10 transition-smooth disabled:opacity-50"
        >
          {recovering ? "Recovering..." : "Recover Previous Session"}
        </button>
        {message && (
          <p className={`text-xs text-center font-bold ${message.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
