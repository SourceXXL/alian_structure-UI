"use client";

import React from "react";
import { useStellarWallet } from "@/components/context/StellarWalletProvider";
import { truncateStellarAddress } from "@/lib/stellar";
import { LinkedWallet } from "@/lib/wallet/types";

export default function WalletManager() {
  const { wallet, linkedWallets, linkWallet, unlinkWallet, connectWallet } = useStellarWallet();

  const handleLink = async (type: "freighter" | "albedo" | "ledger") => {
    await linkWallet(type);
  };

  return (
    <div className="p-6 rounded-xl border border-cosmic-purple/20 nebula-bg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Linked Wallets</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleLink("freighter")}
            className="px-3 py-1.5 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg text-xs hover:bg-cosmic-purple/20 transition-smooth"
          >
            + Link Freighter
          </button>
          <button
            onClick={() => handleLink("albedo")}
            className="px-3 py-1.5 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg text-xs hover:bg-cosmic-purple/20 transition-smooth"
          >
            + Link Albedo
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {linkedWallets.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No wallets linked yet.</p>
        ) : (
          linkedWallets.map((lw: LinkedWallet) => (
            <div
              key={lw.publicKey}
              className={`p-4 rounded-lg border flex items-center justify-between transition-smooth ${
                wallet?.publicKey === lw.publicKey
                  ? "bg-cosmic-purple/10 border-cosmic-purple/50"
                  : "bg-cosmic-dark/30 border-cosmic-purple/10 hover:border-cosmic-purple/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cosmic-dark flex items-center justify-center text-lg">
                  {lw.type === "freighter" ? "🚢" : lw.type === "albedo" ? "🔭" : "🏦"}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {lw.name} {wallet?.publicKey === lw.publicKey && <span className="text-[10px] bg-cosmic-purple px-1.5 py-0.5 rounded ml-2 uppercase">Active</span>}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{truncateStellarAddress(lw.publicKey, 8)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {wallet?.publicKey !== lw.publicKey && (
                  <button
                    onClick={() => connectWallet(lw.type)}
                    className="text-xs text-cosmic-purple hover:text-white transition-smooth"
                  >
                    Switch to
                  </button>
                )}
                <button
                  onClick={() => unlinkWallet(lw.publicKey)}
                  className="p-1.5 text-gray-500 hover:text-rose-400 transition-smooth"
                  title="Unlink Wallet"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
