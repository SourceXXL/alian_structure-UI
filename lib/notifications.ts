import { SorobanTransactionResult } from './types';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: {
    url?: string;
    transactionHash?: string;
    type?: 'trade' | 'transaction' | 'general';
    amount?: string;
    agentName?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationPreferences {
  enabled: boolean;
  tradeNotifications: boolean;
  transactionNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export class NotificationManager {
  private static instance: NotificationManager;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;
  private preferences: NotificationPreferences = {
    enabled: true,
    tradeNotifications: true,
    transactionNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  };

  private constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    this.loadPreferences();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = localStorage.getItem('stellAIverse-notification-preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('stellAIverse-notification-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async getCurrentPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }
    return Notification.permission;
  }

  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = this.preferences.quietHours;

    if (start <= end) {
      // Same day range (e.g., 22:00 to 08:00 doesn't apply here)
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight range (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end;
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      });

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  async showNotification(data: NotificationData): Promise<void> {
    if (!this.preferences.enabled) {
      return;
    }

    if (this.isInQuietHours()) {
      console.log('Notification suppressed due to quiet hours');
      return;
    }

    const permission = await this.getCurrentPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Check type-specific preferences
    const type = data.data?.type || 'general';
    if (type === 'trade' && !this.preferences.tradeNotifications) {
      return;
    }
    if (type === 'transaction' && !this.preferences.transactionNotifications) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const notificationData = {
        title: data.title,
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
        tag: data.tag || 'stellAIverse',
        requireInteraction: data.requireInteraction || false,
        silent: !this.preferences.soundEnabled,
        vibrate: this.preferences.vibrationEnabled ? [100, 50, 100] : undefined,
        data: {
          ...data.data,
          timestamp: Date.now()
        },
        actions: data.actions || []
      };

      await registration.showNotification(data.title, notificationData);
    } catch (error) {
      console.error('Failed to show notification:', error);
      
      // Fallback to browser notification if service worker fails
      if (permission === 'granted') {
        new Notification(data.title, {
          body: data.body,
          icon: data.icon || '/icons/icon-192x192.png',
          badge: data.badge || '/icons/icon-192x192.png',
          tag: data.tag || 'stellAIverse',
          requireInteraction: data.requireInteraction || false,
          silent: !this.preferences.soundEnabled,
          vibrate: this.preferences.vibrationEnabled ? [100, 50, 100] : undefined,
          data: data.data
        });
      }
    }
  }

  async showTradeNotification(
    transactionResult: SorobanTransactionResult,
    agentName: string,
    amount?: string
  ): Promise<void> {
    if (transactionResult.success) {
      await this.showNotification({
        title: 'Trade Successful! 🎉',
        body: `Successfully completed transaction for ${agentName}${amount ? ` (${amount})` : ''}`,
        tag: 'trade-success',
        data: {
          type: 'trade',
          transactionHash: transactionResult.hash,
          agentName,
          amount,
          url: '/portfolio',
          status: 'success'
        },
        actions: [
          {
            action: 'view-transaction',
            title: 'View Details',
            icon: '/icons/icon-192x192.png'
          },
          {
            action: 'view-portfolio',
            title: 'View Portfolio',
            icon: '/icons/icon-192x192.png'
          }
        ]
      });
    } else {
      await this.showNotification({
        title: 'Trade Failed ❌',
        body: `Transaction failed for ${agentName}: ${transactionResult.error}`,
        tag: 'trade-error',
        requireInteraction: true,
        data: {
          type: 'trade',
          transactionHash: transactionResult.hash,
          agentName,
          error: transactionResult.error,
          url: '/portfolio',
          status: 'failed'
        },
        actions: [
          {
            action: 'retry-transaction',
            title: 'Retry',
            icon: '/icons/icon-192x192.png'
          }
        ]
      });
    }
  }

  async showTransactionNotification(
    transactionResult: SorobanTransactionResult,
    description: string
  ): Promise<void> {
    if (transactionResult.success) {
      await this.showNotification({
        title: 'Transaction Complete ✅',
        body: description,
        tag: 'transaction-success',
        data: {
          type: 'transaction',
          transactionHash: transactionResult.hash,
          url: '/portfolio',
          status: 'success'
        }
      });
    } else {
      await this.showNotification({
        title: 'Transaction Failed ❌',
        body: `${description}: ${transactionResult.error}`,
        tag: 'transaction-error',
        requireInteraction: true,
        data: {
          type: 'transaction',
          transactionHash: transactionResult.hash,
          error: transactionResult.error,
          url: '/portfolio',
          status: 'failed'
        }
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async clearAllNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  async getNotificationCount(): Promise<number> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      return notifications.length;
    } catch (error) {
      console.error('Failed to get notification count:', error);
      return 0;
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
