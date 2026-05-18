interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private static instance: PWAManager;
  private installPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;

  private constructor() {
    this.initializeServiceWorker();
    this.setupInstallPrompt();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async initializeServiceWorker(): Promise<void> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        this.swRegistration = registration;
        console.log('[PWA] Service worker registered successfully');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                this.onServiceWorkerUpdate();
              }
            });
          }
        });

        // Check for existing updates
        if (registration.active) {
          registration.active.postMessage({ type: 'CHECK_UPDATE' });
        }

      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.onInstallPromptAvailable();
      });

      window.addEventListener('appinstalled', () => {
        console.log('[PWA] App was installed');
        this.onAppInstalled();
      });
    }
  }

  private onServiceWorkerUpdate(): void {
    // Create a custom event for the update
    const event = new CustomEvent('sw-update', {
      detail: { available: true }
    });
    window.dispatchEvent(event);
  }

  private onInstallPromptAvailable(): void {
    // Create a custom event when install prompt is available
    const event = new CustomEvent('pwa-install-available', {
      detail: { available: true }
    });
    window.dispatchEvent(event);
  }

  private onAppInstalled(): void {
    // Create a custom event when app is installed
    const event = new CustomEvent('pwa-installed', {
      detail: { installed: true }
    });
    window.dispatchEvent(event);
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      this.deferredPrompt = null;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        return true;
      } else {
        console.log('[PWA] User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error during install prompt:', error);
      return false;
    }
  }

  public async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      console.log('[PWA] No service worker registration found');
      return;
    }

    try {
      await this.swRegistration.update();
      console.log('[PWA] Service worker update triggered');
    } catch (error) {
      console.error('[PWA] Error updating service worker:', error);
    }
  }

  public async skipWaiting(): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.waiting) {
      console.log('[PWA] No waiting service worker found');
      return;
    }

    try {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('[PWA] Skip waiting message sent');
    } catch (error) {
      console.error('[PWA] Error sending skip waiting message:', error);
    }
  }

  public isInstallPromptAvailable(): boolean {
    return this.deferredPrompt !== null;
  }

  public isServiceWorkerSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  public async getCacheStats(): Promise<any> {
    if (!this.isServiceWorkerSupported()) {
      return null;
    }

    try {
      const messageChannel = new MessageChannel();
      const promise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
      });

      if (this.swRegistration?.active) {
        this.swRegistration.active.postMessage(
          { type: 'GET_CACHE_STATS' },
          [messageChannel.port2]
        );
      }

      return await promise;
    } catch (error) {
      console.error('[PWA] Error getting cache stats:', error);
      return null;
    }
  }

  public async clearCache(): Promise<void> {
    if (!this.isServiceWorkerSupported()) {
      return;
    }

    try {
      if (this.swRegistration?.active) {
        this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
    } catch (error) {
      console.error('[PWA] Error clearing cache:', error);
    }
  }

  public async preloadCriticalAssets(): Promise<void> {
    if (!this.isServiceWorkerSupported()) {
      return;
    }

    try {
      if (this.swRegistration?.active) {
        this.swRegistration.active.postMessage({ type: 'PRELOAD_ASSETS' });
      }
    } catch (error) {
      console.error('[PWA] Error preloading assets:', error);
    }
  }

  public getConnectionStatus(): {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } {
    if (typeof window === 'undefined' || !navigator.connection) {
      return { online: navigator.onLine };
    }

    const connection = (navigator as any).connection;
    return {
      online: navigator.onLine,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  public setupConnectionListeners(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('online', () => {
      console.log('[PWA] Connection restored');
      const event = new CustomEvent('connection-change', {
        detail: { online: true }
      });
      window.dispatchEvent(event);
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Connection lost');
      const event = new CustomEvent('connection-change', {
        detail: { online: false }
      });
      window.dispatchEvent(event);
    });

    // Listen for connection quality changes
    if (navigator.connection) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        const event = new CustomEvent('connection-quality-change', {
          detail: this.getConnectionStatus()
        });
        window.dispatchEvent(event);
      });
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  public async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        await new Notification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          vibrate: [100, 50, 100],
          ...options,
        });
      } catch (error) {
        console.error('[PWA] Error showing notification:', error);
      }
    }
  }
}

export default PWAManager;
