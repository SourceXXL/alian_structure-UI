"use client";

import React, { useState } from "react";
import { useStellarWallet } from "./context/StellarWalletProvider";
import { StellarNetwork } from "@/lib/types";
import { STELLAR_NETWORKS, DEFAULT_NETWORK } from "@/lib/stellar-constants";

interface NetworkSwitcherProps {
  className?: string;
}

export default function NetworkSwitcher({
  className = "",
}: NetworkSwitcherProps) {
  const { network, switchNetwork, wallet, isConnecting } = useStellarWallet();
  const [showMenu, setShowMenu] = useState(false);

  const networkConfig =
    STELLAR_NETWORKS[network] ||
    STELLAR_NETWORKS[DEFAULT_NETWORK] ||
    Object.values(STELLAR_NETWORKS)[0];

  const handleSwitchNetwork = async (newNetwork: StellarNetwork) => {
    try {
      await switchNetwork(newNetwork);
      setShowMenu(false);
    } catch (err) {
      console.error("Error switching network:", err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isConnecting}
        className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
          networkConfig.color === "bg-blue-600"
            ? "border-blue-500/50 hover:border-blue-500"
            : networkConfig.color === "bg-yellow-500"
              ? "border-yellow-500/50 hover:border-yellow-500"
              : "border-purple-500/50 hover:border-purple-500"
        }`}
      >
        <span className="text-lg">
          {networkConfig.color === "bg-blue-600"
            ? "🟦"
            : networkConfig.color === "bg-yellow-500"
              ? "🟨"
              : "🟪"}
        </span>
        <span className="text-sm font-medium">{networkConfig.displayName}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {Object.entries(STELLAR_NETWORKS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleSwitchNetwork(key as StellarNetwork)}
                disabled={isConnecting}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center gap-2 ${
                  network === key
                    ? "bg-cyan-500/20 border border-cyan-500/50"
                    : "hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">
                  {config.color === "bg-blue-600"
                    ? "🟦"
                    : config.color === "bg-yellow-500"
                      ? "🟨"
                      : "🟪"}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {config.displayName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {config.horizonUrl.split("//")[1]}
                  </div>
                </div>
                {network === key && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {wallet?.isConnected && (
        <div className="absolute top-full mt-2 text-xs text-cyan-300/70">
          Network: {networkConfig.displayName}
        </div>
      )}
    </div>
  );
}
