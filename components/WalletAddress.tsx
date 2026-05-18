'use client';

import React, { useState, useEffect } from 'react';
import { useStellarWallet } from './context/StellarWalletProvider';
import { truncateStellarAddress, formatXlmAmount } from '@/lib/stellar';

interface WalletAddressProps {
  showBalance?: boolean;
  className?: string;
}

export default function WalletAddress({ showBalance = true, className = '' }: WalletAddressProps) {
  const { wallet, disconnectWallet } = useStellarWallet();
  const [showMenu, setShowMenu] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    if (copiedAddress) {
      const timeout = setTimeout(() => setCopiedAddress(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copiedAddress]);

  if (!wallet?.isConnected || !wallet?.publicKey) {
    return null;
  }

  const xlmBalance = wallet.balances?.find((b) => b.asset === 'XLM')?.balance || '0';
  const truncatedAddress = truncateStellarAddress(wallet.publicKey);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.publicKey);
      setCopiedAddress(true);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded border border-cyan-500/30 hover:border-cyan-500/60 transition-colors"
      >
        <span>💰</span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-mono text-cyan-300">{truncatedAddress}</span>
          {showBalance && (
            <span className="text-xs text-cyan-200/70">
              {formatXlmAmount(xlmBalance)} XLM
            </span>
          )}
        </div>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-cyan-500/20">
            <div className="text-xs text-cyan-400 mb-1">Connected Wallet</div>
            <div className="font-mono text-sm text-cyan-300 break-all mb-2">
              {wallet.publicKey}
            </div>
            <button
              onClick={handleCopyAddress}
              className="text-xs px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded transition-colors"
            >
              {copiedAddress ? '✓ Copied' : 'Copy Address'}
            </button>
          </div>

          <div className="p-3 border-b border-cyan-500/20">
            <div className="text-xs text-cyan-400 mb-2">Balances</div>
            <div className="space-y-1">
              {wallet.balances?.slice(0, 5).map((balance) => (
                <div key={`${balance.asset}-${balance.assetIssuer}`} className="flex justify-between text-xs">
                  <span className="text-cyan-300">{balance.asset}</span>
                  <span className="text-cyan-200/70">{formatXlmAmount(balance.balance)}</span>
                </div>
              ))}
              {wallet.balances?.length > 5 && (
                <div className="text-xs text-cyan-400/50">
                  +{wallet.balances?.length - 5} more assets
                </div>
              )}
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
