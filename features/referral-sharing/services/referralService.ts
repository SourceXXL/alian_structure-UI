/* Service for managing referral links and analytics */

import { apiClient } from '../../../lib/api';
import { ReferralLink, ReferralStats, ReferralAnalytics, ReferralReward } from '../types';

export class ReferralService {
  private static baseUrl = '/referrals';

  // Generate a new referral link
  static async generateReferralLink(userId: string, reward: string = '10 XLM'): Promise<ReferralLink> {
    const referralCode = this.generateReferralCode();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://stellaiverse.com';
    const referralUrl = `${baseUrl}/ref/${referralCode}`;

    const referralLink: Omit<ReferralLink, 'id' | 'createdAt'> = {
      code: referralCode,
      url: referralUrl,
      userId,
      isActive: true,
      uses: 0,
      maxUses: 100,
      reward,
    };

    try {
      const response = await apiClient.post(`${this.baseUrl}/generate`, referralLink);
      return response;
    } catch (error) {
      // Fallback to client-side generation if API fails
      return {
        ...referralLink,
        id: `ref_${Date.now()}_${userId}`,
        createdAt: new Date().toISOString(),
      };
    }
  }

  // Get user's referral links
  static async getUserReferralLinks(userId: string): Promise<ReferralLink[]> {
    try {
      return await apiClient.get(`${this.baseUrl}/user/${userId}/links`);
    } catch (error) {
      return [];
    }
  }

  // Get referral statistics
  static async getReferralStats(userId: string): Promise<ReferralStats> {
    try {
      return await apiClient.get(`${this.baseUrl}/user/${userId}/stats`);
    } catch (error) {
      return {
        totalClicks: 0,
        totalSignups: 0,
        totalRewards: '0',
        pendingRewards: '0',
        activeLinks: 0,
        conversionRate: 0,
      };
    }
  }

  // Track referral click
  static async trackReferralClick(referralCode: string, source: string, metadata?: any): Promise<void> {
    const analytics: Omit<ReferralAnalytics, 'id' | 'timestamp'> = {
      referralCode,
      eventType: 'click',
      source,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      ...metadata,
    };

    try {
      await apiClient.post(`${this.baseUrl}/track`, analytics);
    } catch (error) {
      console.warn('Failed to track referral click:', error);
    }
  }

  // Track referral signup
  static async trackReferralSignup(referralCode: string, userId: string): Promise<void> {
    const analytics: Omit<ReferralAnalytics, 'id' | 'timestamp'> = {
      referralCode,
      eventType: 'signup',
      source: 'direct',
    };

    try {
      await apiClient.post(`${this.baseUrl}/track`, analytics);
    } catch (error) {
      console.warn('Failed to track referral signup:', error);
    }
  }

  // Get referral rewards
  static async getReferralRewards(userId: string): Promise<ReferralReward[]> {
    try {
      return await apiClient.get(`${this.baseUrl}/user/${userId}/rewards`);
    } catch (error) {
      return [];
    }
  }

  // Claim referral reward
  static async claimReward(rewardId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/rewards/${rewardId}/claim`, {});
      return true;
    } catch (error) {
      console.warn('Failed to claim reward:', error);
      return false;
    }
  }

  // Validate referral code
  static async validateReferralCode(referralCode: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/validate/${referralCode}`);
      return response.isValid;
    } catch (error) {
      return false;
    }
  }

  // Generate a unique referral code
  private static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get referral link by code
  static async getReferralByCode(referralCode: string): Promise<ReferralLink | null> {
    try {
      return await apiClient.get(`${this.baseUrl}/code/${referralCode}`);
    } catch (error) {
      return null;
    }
  }

  // Update referral link
  static async updateReferralLink(id: string, updates: Partial<ReferralLink>): Promise<ReferralLink> {
    return await apiClient.put(`${this.baseUrl}/links/${id}`, updates);
  }

  // Delete referral link
  static async deleteReferralLink(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/links/${id}`);
  }
}
