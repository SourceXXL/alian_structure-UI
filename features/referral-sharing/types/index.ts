/* Type definitions for referral sharing feature */

export interface ReferralLink {
  id: string;
  code: string;
  url: string;
  userId: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  uses: number;
  maxUses?: number;
  reward: string; // XLM amount or token amount
}

export interface ReferralStats {
  totalClicks: number;
  totalSignups: number;
  totalRewards: string;
  pendingRewards: string;
  activeLinks: number;
  conversionRate: number;
}

export interface ReferralAnalytics {
  id: string;
  referralCode: string;
  timestamp: string;
  eventType: 'click' | 'signup' | 'conversion';
  source: string; // 'twitter', 'facebook', 'copy', 'qr', etc.
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

export interface SocialShareConfig {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram';
  url: string;
  title: string;
  description: string;
  hashtags?: string[];
}

export interface QRCodeConfig {
  url: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  logo?: string;
  logoSize?: number;
}

export interface ReferralReward {
  id: string;
  referralCode: string;
  amount: string;
  asset: string;
  status: 'pending' | 'claimed' | 'expired';
  createdAt: string;
  claimedAt?: string;
}
