"use client";

import React, { useState } from "react";
import { useStellarWallet } from "@/components/context/StellarWalletProvider";
import { truncateStellarAddress } from "@/lib/stellar";
import { Delegation } from "@/lib/wallet/types";

export default function DelegationDashboard() {
  const { wallet, delegations, manageDelegation } = useStellarWallet();
  const [grantee, setGrantee] = useState("");
  const [label, setLabel] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["sign_transaction"]);

  const handleGrant = async () => {
    if (!grantee || !label) return;
    await manageDelegation({
      granter: wallet?.publicKey || "",
      grantee,
      label,
      permissions,
      status: "granted",
    });
    setGrantee("");
    setLabel("");
  };

  return (
    <div className="p-6 rounded-xl border border-cosmic-purple/20 nebula-bg space-y-6">
      <h2 className="text-xl font-bold text-white">Delegation Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cosmic-dark/30 p-4 rounded-lg border border-cosmic-purple/10">
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Grantee Address</label>
          <input
            type="text"
            value={grantee}
            onChange={(e) => setGrantee(e.target.value)}
            placeholder="G..."
            className="w-full bg-cosmic-dark/50 border border-cosmic-purple/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cosmic-purple/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., My AI Agent"
            className="w-full bg-cosmic-dark/50 border border-cosmic-purple/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cosmic-purple/50"
          />
        </div>
        <div className="col-span-full">
          <button
            onClick={handleGrant}
            className="w-full py-2 bg-cosmic-purple text-white rounded-lg text-sm font-bold hover:bg-cosmic-purple/80 transition-smooth"
          >
            Grant Delegation
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Delegations</h3>
        {delegations.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No delegations granted yet.</p>
        ) : (
          delegations.map((d: Delegation) => (
            <div
              key={d.id}
              className="p-4 rounded-lg border border-cosmic-purple/10 bg-cosmic-dark/30 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-white">{d.label}</p>
                <p className="text-xs text-gray-500 font-mono">Grantee: {truncateStellarAddress(d.grantee, 8)}</p>
                <div className="flex gap-1 mt-1">
                  {d.permissions.map((p) => (
                    <span key={p} className="text-[10px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-1.5 py-0.5 rounded uppercase">
                      {p.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 uppercase">{new Date(d.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
