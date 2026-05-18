/* Service for tracking referral analytics */

import { ReferralAnalytics } from '../types';

export class AnalyticsService {
  private static baseUrl = '/analytics';

  // Track referral event
  static async trackEvent(event: Omit<ReferralAnalytics, 'id' | 'timestamp'>): Promise<void> {
    const eventData = {
      ...event,
      timestamp: new Date().toISOString(),
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      // Send to analytics backend
      await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.warn('Failed to track analytics event:', error);
      // Fallback to local storage for offline tracking
      this.storeEventLocally(eventData);
    }
  }

  // Get referral analytics
  static async getReferralAnalytics(referralCode: string): Promise<ReferralAnalytics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/referral/${referralCode}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch analytics:', error);
      return this.getStoredEvents(referralCode);
    }
  }

  // Get user analytics summary
  static async getUserAnalyticsSummary(userId: string): Promise<{
    totalClicks: number;
    totalSignups: number;
    conversionRate: number;
    topSources: Array<{ source: string; count: number }>;
    dailyStats: Array<{ date: string; clicks: number; signups: number }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}/summary`);
      if (!response.ok) throw new Error('Failed to fetch user analytics');
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch user analytics:', error);
      return {
        totalClicks: 0,
        totalSignups: 0,
        conversionRate: 0,
        topSources: [],
        dailyStats: [],
      };
    }
  }

  // Track page view with referral context
  static trackPageView(referralCode?: string): void {
    if (typeof window === 'undefined') return;

    const event: Omit<ReferralAnalytics, 'id' | 'timestamp'> = {
      referralCode: referralCode || '',
      eventType: 'click',
      source: 'direct',
      userAgent: window.navigator.userAgent,
      referrer: document.referrer,
    };

    this.trackEvent(event);
  }

  // Track user signup from referral
  static trackSignup(referralCode: string, userId: string): void {
    const event: Omit<ReferralAnalytics, 'id' | 'timestamp'> = {
      referralCode,
      eventType: 'signup',
      source: 'direct',
    };

    this.trackEvent(event);
  }

  // Track conversion (when referred user completes key action)
  static trackConversion(referralCode: string, userId: string, actionType: string): void {
    const event: Omit<ReferralAnalytics, 'id' | 'timestamp'> = {
      referralCode,
      eventType: 'conversion',
      source: actionType,
    };

    this.trackEvent(event);
  }

  // Store events locally when offline
  private static storeEventLocally(event: ReferralAnalytics): void {
    if (typeof window === 'undefined') return;

    try {
      const storedEvents = localStorage.getItem('referral_events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      events.push(event);
      
      // Keep only last 100 events to avoid storage issues
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('referral_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store event locally:', error);
    }
  }

  // Get stored events for a referral
  private static getStoredEvents(referralCode: string): ReferralAnalytics[] {
    if (typeof window === 'undefined') return [];

    try {
      const storedEvents = localStorage.getItem('referral_events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      return events.filter((event: ReferralAnalytics) => event.referralCode === referralCode);
    } catch (error) {
      console.warn('Failed to retrieve stored events:', error);
      return [];
    }
  }

  // Sync stored events when back online
  static async syncStoredEvents(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const storedEvents = localStorage.getItem('referral_events');
      if (!storedEvents) return;

      const events = JSON.parse(storedEvents);
      for (const event of events) {
        await this.trackEvent(event);
      }

      // Clear stored events after successful sync
      localStorage.removeItem('referral_events');
    } catch (error) {
      console.warn('Failed to sync stored events:', error);
    }
  }

  // Get device info for analytics
  static getDeviceInfo(): {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  } {
    if (typeof window === 'undefined') {
      return { deviceType: 'desktop', browser: 'unknown', os: 'unknown' };
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Device type detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad|android(?!.*mobile)/.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Browser detection
    let browser = 'unknown';
    if (userAgent.includes('chrome')) browser = 'chrome';
    else if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('safari')) browser = 'safari';
    else if (userAgent.includes('edge')) browser = 'edge';

    // OS detection
    let os = 'unknown';
    if (userAgent.includes('windows')) os = 'windows';
    else if (userAgent.includes('mac')) os = 'macos';
    else if (userAgent.includes('linux')) os = 'linux';
    else if (userAgent.includes('android')) os = 'android';
    else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios';

    return { deviceType, browser, os };
  }
}
