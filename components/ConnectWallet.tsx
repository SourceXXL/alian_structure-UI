'use client';

import React, { useState } from 'react';
import { useStellarWallet } from './context/StellarWalletProvider';
import Button from './Button';

interface ConnectWalletProps {
  className?: string;
}

export default function ConnectWallet({ className = '' }: ConnectWalletProps) {
  const { wallet, isConnecting, error, connectWallet, clearError } = useStellarWallet();
  const [showMenu, setShowMenu] = useState(false);

  if (wallet?.isConnected) {
    return null; // Show wallet address component instead
  }

  const handleConnect = async (walletType: 'freighter' | 'albedo' | 'ledger') => {
    clearError();
    try {
      await connectWallet(walletType);
      setShowMenu(false);
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          <span>⛓️</span>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <button
                onClick={() => handleConnect('freighter')}
                disabled={isConnecting}
                className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
              >
                <span>🔐</span>
                Freighter
              </button>
              <button
                onClick={() => handleConnect('albedo')}
                disabled={isConnecting}
                className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
              >
                <span>🌟</span>
                Albedo
              </button>
              <button
                onClick={() => handleConnect('ledger')}
                disabled={isConnecting}
                className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
              >
                <span>💳</span>
                Ledger (Coming Soon)
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-full mt-2 p-2 bg-red-900/20 border border-red-500/50 rounded text-red-300 text-sm w-64">
          {error}
        </div>
      )}
    </div>
  );
}
