'use client';

import { useState, useEffect, useCallback } from 'react';
import PWAManager from '@/lib/pwa-utils';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  updateAvailable: boolean;
  connectionStatus: {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
}

interface UsePWAReturn extends PWAState {
  promptInstall: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  skipWaiting: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheStats: () => Promise<any>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  preloadAssets: () => Promise<void>;
}

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isServiceWorkerSupported: false,
    updateAvailable: false,
    connectionStatus: {
      online: true,
    },
  });

  const [pwaManager] = useState(() => PWAManager.getInstance());

  const updateState = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInstallable: pwaManager.isInstallPromptAvailable(),
      isServiceWorkerSupported: pwaManager.isServiceWorkerSupported(),
      isOnline: navigator.onLine,
      connectionStatus: pwaManager.getConnectionStatus(),
    }));
  }, [pwaManager]);

  useEffect(() => {
    updateState();
    pwaManager.setupConnectionListeners();

    // Listen for PWA events
    const handleInstallAvailable = () => {
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
    };

    const handleSWUpdate = () => {
      setState(prev => ({ ...prev, updateAvailable: true }));
    };

    const handleConnectionChange = (event: CustomEvent) => {
      setState(prev => ({
        ...prev,
        isOnline: event.detail.online,
        connectionStatus: pwaManager.getConnectionStatus(),
      }));
    };

    const handleConnectionQualityChange = (event: CustomEvent) => {
      setState(prev => ({
        ...prev,
        connectionStatus: event.detail,
      }));
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable as EventListener);
    window.addEventListener('pwa-installed', handleAppInstalled as EventListener);
    window.addEventListener('sw-update', handleSWUpdate as EventListener);
    window.addEventListener('connection-change', handleConnectionChange as EventListener);
    window.addEventListener('connection-quality-change', handleConnectionQualityChange as EventListener);
    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable as EventListener);
      window.removeEventListener('pwa-installed', handleAppInstalled as EventListener);
      window.removeEventListener('sw-update', handleSWUpdate as EventListener);
      window.removeEventListener('connection-change', handleConnectionChange as EventListener);
      window.removeEventListener('connection-quality-change', handleConnectionQualityChange as EventListener);
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, [pwaManager, updateState]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const success = await pwaManager.promptInstall();
    if (success) {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
    }
    return success;
  }, [pwaManager]);

  const updateServiceWorker = useCallback(async (): Promise<void> => {
    await pwaManager.updateServiceWorker();
  }, [pwaManager]);

  const skipWaiting = useCallback(async (): Promise<void> => {
    await pwaManager.skipWaiting();
    setState(prev => ({ ...prev, updateAvailable: false }));
  }, [pwaManager]);

  const clearCache = useCallback(async (): Promise<void> => {
    await pwaManager.clearCache();
  }, [pwaManager]);

  const getCacheStats = useCallback(async (): Promise<any> => {
    return await pwaManager.getCacheStats();
  }, [pwaManager]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    return await pwaManager.requestNotificationPermission();
  }, [pwaManager]);

  const showNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<void> => {
    await pwaManager.showNotification(title, options);
  }, [pwaManager]);

  const preloadAssets = useCallback(async (): Promise<void> => {
    await pwaManager.preloadCriticalAssets();
  }, [pwaManager]);

  return {
    ...state,
    promptInstall,
    updateServiceWorker,
    skipWaiting,
    clearCache,
    getCacheStats,
    requestNotificationPermission,
    showNotification,
    preloadAssets,
  };
}
