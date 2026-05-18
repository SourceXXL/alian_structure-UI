import { ReferralService } from '../services/referralService';
import { ReferralLink } from '../types';

// Mock the API client
jest.mock('../../../lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ReferralService', () => {
  const mockUserId = 'user123';
  const mockReferralLink: ReferralLink = {
    id: 'ref_123',
    code: 'ABC12345',
    url: 'https://stellaiverse.com/ref/ABC12345',
    userId: mockUserId,
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    uses: 5,
    maxUses: 100,
    reward: '10 XLM',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://stellaiverse.com',
      },
      writable: true,
    });
  });

  describe('generateReferralLink', () => {
    it('should generate a referral link successfully', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.post.mockResolvedValue(mockReferralLink);

      const result = await ReferralService.generateReferralLink(mockUserId);

      expect(apiClient.post).toHaveBeenCalledWith('/referrals/generate', expect.objectContaining({
        userId: mockUserId,
        reward: '10 XLM',
      }));
      expect(result).toEqual(mockReferralLink);
    });

    it('should fallback to client-side generation if API fails', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.post.mockRejectedValue(new Error('API Error'));

      const result = await ReferralService.generateReferralLink(mockUserId);

      expect(result).toEqual(expect.objectContaining({
        userId: mockUserId,
        reward: '10 XLM',
        isActive: true,
        uses: 0,
        maxUses: 100,
      }));
      expect(result.id).toMatch(/^ref_\d+_/);
      expect(result.code).toHaveLength(8);
    });
  });

  describe('getUserReferralLinks', () => {
    it('should fetch user referral links', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.get.mockResolvedValue([mockReferralLink]);

      const result = await ReferralService.getUserReferralLinks(mockUserId);

      expect(apiClient.get).toHaveBeenCalledWith(`/referrals/user/${mockUserId}/links`);
      expect(result).toEqual([mockReferralLink]);
    });

    it('should return empty array if API fails', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.get.mockRejectedValue(new Error('API Error'));

      const result = await ReferralService.getUserReferralLinks(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getReferralStats', () => {
    it('should fetch referral statistics', async () => {
      const { apiClient } = require('../../../lib/api');
      const mockStats = {
        totalClicks: 100,
        totalSignups: 10,
        totalRewards: '100 XLM',
        pendingRewards: '20 XLM',
        activeLinks: 2,
        conversionRate: 0.1,
      };
      apiClient.get.mockResolvedValue(mockStats);

      const result = await ReferralService.getReferralStats(mockUserId);

      expect(apiClient.get).toHaveBeenCalledWith(`/referrals/user/${mockUserId}/stats`);
      expect(result).toEqual(mockStats);
    });

    it('should return default stats if API fails', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.get.mockRejectedValue(new Error('API Error'));

      const result = await ReferralService.getReferralStats(mockUserId);

      expect(result).toEqual({
        totalClicks: 0,
        totalSignups: 0,
        totalRewards: '0',
        pendingRewards: '0',
        activeLinks: 0,
        conversionRate: 0,
      });
    });
  });

  describe('trackReferralClick', () => {
    it('should track referral click', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.post.mockResolvedValue({});

      await ReferralService.trackReferralClick('ABC12345', 'twitter');

      expect(apiClient.post).toHaveBeenCalledWith('/referrals/track', expect.objectContaining({
        referralCode: 'ABC12345',
        eventType: 'click',
        source: 'twitter',
      }));
    });

    it('should not throw error if tracking fails', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.post.mockRejectedValue(new Error('Tracking Error'));

      await expect(ReferralService.trackReferralClick('ABC12345', 'twitter')).resolves.toBeUndefined();
    });
  });

  describe('validateReferralCode', () => {
    it('should validate referral code', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.get.mockResolvedValue({ isValid: true });

      const result = await ReferralService.validateReferralCode('ABC12345');

      expect(apiClient.get).toHaveBeenCalledWith('/referrals/validate/ABC12345');
      expect(result).toBe(true);
    });

    it('should return false if validation fails', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.get.mockRejectedValue(new Error('Invalid code'));

      const result = await ReferralService.validateReferralCode('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('claimReward', () => {
    it('should claim reward successfully', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.post.mockResolvedValue({});

      const result = await ReferralService.claimReward('reward123');

      expect(apiClient.post).toHaveBeenCalledWith('/referrals/rewards/reward123/claim', {});
      expect(result).toBe(true);
    });

    it('should return false if claim fails', async () => {
      const { apiClient } = require('../../../lib/api');
      apiClient.post.mockRejectedValue(new Error('Claim failed'));

      const result = await ReferralService.claimReward('reward123');

      expect(result).toBe(false);
    });
  });
});
