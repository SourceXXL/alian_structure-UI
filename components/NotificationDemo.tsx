'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationDemo() {
  const { 
    showNotification, 
    showTradeNotification, 
    showTransactionNotification,
    permission,
    isSupported 
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  const handleTestBasicNotification = async () => {
    setIsLoading(true);
    try {
      await showNotification({
        title: 'Test Notification 🚀',
        body: 'This is a test notification from stellAIverse!',
        tag: 'test',
        data: {
          type: 'general',
          url: '/settings/notifications'
        }
      });
    } catch (error) {
      console.error('Failed to show test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTradeSuccess = async () => {
    setIsLoading(true);
    try {
      await showTradeNotification(
        {
          success: true,
          hash: 'test-hash-12345',
          metrics: {
            cpuInstructions: 1000000,
            ramBytes: 5000,
            ledgerReadBytes: 1000,
            ledgerWriteBytes: 500,
            readCount: 10,
            writeCount: 5,
            costXlm: '0.001'
          }
        },
        'DataBot Pro',
        '100 XLM'
      );
    } catch (error) {
      console.error('Failed to show trade notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTradeFailure = async () => {
    setIsLoading(true);
    try {
      await showTradeNotification(
        {
          success: false,
          hash: 'test-hash-67890',
          error: 'Insufficient balance'
        },
        'CodeAssistant',
        '50 XLM'
      );
    } catch (error) {
      console.error('Failed to show trade notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTransactionSuccess = async () => {
    setIsLoading(true);
    try {
      await showTransactionNotification(
        {
          success: true,
          hash: 'test-hash-11111'
        },
        'Smart contract deployed successfully'
      );
    } catch (error) {
      console.error('Failed to show transaction notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
        <p className="text-red-400 text-sm">
          Notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  if (permission !== 'granted') {
    return (
      <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
        <p className="text-yellow-400 text-sm">
          Please enable notifications in your browser settings to test the demo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Test Notifications</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleTestBasicNotification}
          disabled={isLoading}
          className="p-3 rounded-lg border border-cosmic-purple/30 bg-cosmic-purple/20 hover:bg-cosmic-purple/30 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📢 Basic Notification
        </button>

        <button
          onClick={handleTestTradeSuccess}
          disabled={isLoading}
          className="p-3 rounded-lg border border-green-500/30 bg-green-500/20 hover:bg-green-500/30 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✅ Trade Success
        </button>

        <button
          onClick={handleTestTradeFailure}
          disabled={isLoading}
          className="p-3 rounded-lg border border-red-500/30 bg-red-500/20 hover:bg-red-500/30 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ❌ Trade Failure
        </button>

        <button
          onClick={handleTestTransactionSuccess}
          disabled={isLoading}
          className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/20 hover:bg-blue-500/30 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✅ Transaction Success
        </button>
      </div>

      {isLoading && (
        <p className="text-gray-400 text-sm">Sending notification...</p>
      )}
    </div>
  );
}
