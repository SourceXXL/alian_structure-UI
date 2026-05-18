"use client";

import React, { useState } from "react";
import { StellarNetwork } from "@/lib/types";

interface ScanFormProps {
  onScan: (data: {
    contractId: string;
    network: StellarNetwork;
    sourceCode?: string;
    includeOptimizations: boolean;
    includeCompliance: boolean;
  }) => void;
  isLoading: boolean;
}

export default function ScanForm({ onScan, isLoading }: ScanFormProps) {
  const [contractId, setContractId] = useState("");
  const [network, setNetwork] = useState<StellarNetwork>("testnet");
  const [sourceCode, setSourceCode] = useState("");
  const [showSource, setShowSource] = useState(false);
  const [includeOptimizations, setIncludeOptimizations] = useState(true);
  const [includeCompliance, setIncludeCompliance] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId.trim()) return;
    onScan({
      contractId: contractId.trim(),
      network,
      sourceCode:
        showSource && sourceCode.trim() ? sourceCode.trim() : undefined,
      includeOptimizations,
      includeCompliance,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Contract ID
        </label>
        <input
          type="text"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="C..."
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-cosmic-purple/20 text-white placeholder-gray-500 focus:border-cosmic-purple/60 focus:outline-none transition-smooth text-sm font-mono"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Network
        </label>
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value as StellarNetwork)}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-800/60 border border-cosmic-purple/20 text-white focus:border-cosmic-purple/60 focus:outline-none transition-smooth text-sm"
        >
          <option value="testnet">Testnet</option>
          <option value="futurenet">Futurenet</option>
          <option value="mainnet">Mainnet</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeOptimizations}
            onChange={(e) => setIncludeOptimizations(e.target.checked)}
            className="rounded border-cosmic-purple/40"
          />
          <span className="text-sm text-gray-300">Optimizations</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCompliance}
            onChange={(e) => setIncludeCompliance(e.target.checked)}
            className="rounded border-cosmic-purple/40"
          />
          <span className="text-sm text-gray-300">Compliance</span>
        </label>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          className="text-xs text-cosmic-cyan hover:text-white transition-smooth"
        >
          {showSource ? "▲ Hide" : "▼ Show"} Source Code (optional, improves
          accuracy)
        </button>
        {showSource && (
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            placeholder="Paste your Rust/Soroban contract source code here..."
            rows={8}
            className="w-full mt-2 px-4 py-2.5 rounded-lg bg-gray-800/60 border border-cosmic-purple/20 text-white placeholder-gray-500 focus:border-cosmic-purple/60 focus:outline-none transition-smooth text-sm font-mono resize-y"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !contractId.trim()}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-blue font-semibold hover:shadow-lg hover:shadow-cosmic-purple/50 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Scanning...
          </span>
        ) : (
          "🔍 Run Security Scan"
        )}
      </button>
    </form>
  );
}
