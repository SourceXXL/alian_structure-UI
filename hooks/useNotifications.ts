'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationManager, NotificationPreferences, NotificationData } from '@/lib/notifications';
import { SorobanTransactionResult } from '@/lib/types';

export interface UseNotificationsReturn {
  // Permission state
  permission: NotificationPermission;
  isSupported: boolean;
  isLoading: boolean;
  
  // Preferences
  preferences: NotificationPreferences;
  
  // Actions
  requestPermission: () => Promise<NotificationPermission>;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  showNotification: (data: NotificationData) => Promise<void>;
  showTradeNotification: (result: SorobanTransactionResult, agentName: string, amount?: string) => Promise<void>;
  showTransactionNotification: (result: SorobanTransactionResult, description: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getNotificationCount: () => Promise<number>;
  
  // Push subscription
  subscribeToPush: () => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<void>;
  isSubscribed: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationManager.getPreferences());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isSupported = typeof window !== 'undefined' && 
    'Notification' in window && 
    'serviceWorker' in navigator && 
    'PushManager' in window;

  // Initialize permission state
  useEffect(() => {
    const initializeNotifications = async () => {
      if (isSupported) {
        try {
          const currentPermission = await notificationManager.getCurrentPermission();
          setPermission(currentPermission);
          
          // Check if already subscribed to push
          const subscription = notificationManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      }
      setIsLoading(false);
    };

    initializeNotifications();
  }, [isSupported]);

  // Listen for permission changes
  useEffect(() => {
    if (isSupported) {
      const handlePermissionChange = () => {
        notificationManager.getCurrentPermission().then(setPermission);
      };

      // Listen for permission changes
      navigator.permissions?.query({ name: 'notifications' }).then((permissionStatus) => {
        permissionStatus.addEventListener('change', handlePermissionChange);
        return () => {
          permissionStatus.removeEventListener('change', handlePermissionChange);
        };
      }).catch(() => {
        // Fallback: just check current permission
        const interval = setInterval(() => {
          notificationManager.getCurrentPermission().then(setPermission);
        }, 5000);
        return () => clearInterval(interval);
      });
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const result = await notificationManager.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }, [isSupported]);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    notificationManager.updatePreferences(updates);
    setPreferences(notificationManager.getPreferences());
  }, []);

  const showNotification = useCallback(async (data: NotificationData) => {
    await notificationManager.showNotification(data);
  }, []);

  const showTradeNotification = useCallback(async (
    result: SorobanTransactionResult,
    agentName: string,
    amount?: string
  ) => {
    await notificationManager.showTradeNotification(result, agentName, amount);
  }, []);

  const showTransactionNotification = useCallback(async (
    result: SorobanTransactionResult,
    description: string
  ) => {
    await notificationManager.showTransactionNotification(result, description);
  }, []);

  const clearAllNotifications = useCallback(async () => {
    await notificationManager.clearAllNotifications();
  }, []);

  const getNotificationCount = useCallback(async () => {
    return await notificationManager.getNotificationCount();
  }, []);

  const subscribeToPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    try {
      const subscription = await notificationManager.subscribeToPush();
      setIsSubscribed(!!subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }, [isSupported]);

  const unsubscribeFromPush = useCallback(async () => {
    await notificationManager.unsubscribeFromPush();
    setIsSubscribed(false);
  }, []);

  return {
    // Permission state
    permission,
    isSupported,
    isLoading,
    
    // Preferences
    preferences,
    
    // Actions
    requestPermission,
    updatePreferences,
    showNotification,
    showTradeNotification,
    showTransactionNotification,
    clearAllNotifications,
    getNotificationCount,
    
    // Push subscription
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribed
  };
}
