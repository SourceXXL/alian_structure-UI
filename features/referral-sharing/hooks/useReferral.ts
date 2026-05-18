import { useState, useEffect } from 'react';
import { ReferralService } from '../services/referralService';
import { AnalyticsService } from '../services/analyticsService';
import { ReferralLink, ReferralStats, ReferralReward } from '../types';

export const useReferral = (userId: string) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReferralData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [statsData, linksData, rewardsData] = await Promise.all([
        ReferralService.getReferralStats(userId),
        ReferralService.getUserReferralLinks(userId),
        ReferralService.getReferralRewards(userId),
      ]);

      setStats(statsData);
      setReferralLinks(linksData);
      setRewards(rewardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralLink = async (reward: string = '10 XLM') => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newLink = await ReferralService.generateReferralLink(userId, reward);
      setReferralLinks(prev => [...prev, newLink]);
      return newLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate referral link');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (rewardId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await ReferralService.claimReward(rewardId);
      if (success) {
        await loadReferralData(); // Refresh data
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReferralLink = async (linkId: string, updates: Partial<ReferralLink>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedLink = await ReferralService.updateReferralLink(linkId, updates);
      setReferralLinks(prev => 
        prev.map(link => link.id === linkId ? updatedLink : link)
      );
      return updatedLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update referral link');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReferralLink = async (linkId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ReferralService.deleteReferralLink(linkId);
      setReferralLinks(prev => prev.filter(link => link.id !== linkId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete referral link');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const trackReferralClick = async (referralCode: string, source: string) => {
    try {
      await ReferralService.trackReferralClick(referralCode, source);
      await AnalyticsService.trackEvent({
        referralCode,
        eventType: 'click',
        source,
      });
    } catch (err) {
      console.warn('Failed to track referral click:', err);
    }
  };

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  return {
    stats,
    referralLinks,
    rewards,
    isLoading,
    error,
    loadReferralData,
    generateReferralLink,
    claimReward,
    updateReferralLink,
    deleteReferralLink,
    trackReferralClick,
  };
};
