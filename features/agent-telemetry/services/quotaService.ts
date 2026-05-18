'use client';

export interface QuotaData {
  userId: string;
  totalLimit: number; // e.g., 10,000 requests/day
  currentUsage: number;
  rateLimit: number; // requests/sec
  currentRate: number;
}

export interface Policy {
  id: string;
  name: string;
  quotaLimit: number;
  rateLimit: number;
  description: string;
}

// Mock initial data
let mockUsage = 4520;
let mockRate = 2.4;

export const quotaService = {
  getQuotaData: async (userId: string): Promise<QuotaData> => {
    // In a real app, this would be a fetch or GraphQL query
    return {
      userId,
      totalLimit: 10000,
      currentUsage: mockUsage,
      rateLimit: 10,
      currentRate: mockRate,
    };
  },

  updatePolicy: async (policy: Policy): Promise<boolean> => {
      console.log('Policy updated on backend:', policy);
      return true;
  },

  // Simulate real-time updates for telemetry
  subscribeToLiveUpdates: (callback: (data: Partial<QuotaData>) => void) => {
    const interval = setInterval(() => {
      // Simulate small fluctuations
      mockUsage += Math.floor(Math.random() * 5);
      mockRate = Math.max(0, Math.min(10, mockRate + (Math.random() - 0.5)));
      
      callback({
        currentUsage: mockUsage,
        currentRate: Number(mockRate.toFixed(2)),
      });
    }, 2000);

    return () => clearInterval(interval);
  }
};
