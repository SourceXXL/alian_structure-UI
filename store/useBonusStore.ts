import { create } from 'zustand';
import { TradingBonus, BonusType, BonusBreakdown, BonusHistory } from '@/lib/types';

interface BonusNotification {
  id: string;
  message: string;
  amount: string;
  type: BonusType;
  timestamp: number;
}

interface BonusStore {
  bonuses: TradingBonus[];
  notifications: BonusNotification[];
  history: BonusHistory[];
  isLoading: boolean;
  
  // Stats
  totalEarned: string;
  totalPending: string;
  totalProjected: string;
  
  // Actions
  fetchBonuses: () => Promise<void>;
  addBonus: (bonus: TradingBonus) => void;
  removeNotification: (id: string) => void;
  simulateRealTimeBonus: () => void;
}

const MOCK_BONUSES: TradingBonus[] = [
  {
    id: '1',
    type: BonusType.REFERRAL,
    amount: '50.00',
    asset: 'XLM',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'earned',
    description: 'Referral bonus for user @astroguy',
  },
  {
    id: '2',
    type: BonusType.TRADING_VOLUME,
    amount: '125.50',
    asset: 'XLM',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'earned',
    description: 'Weekly volume milestone reached',
  },
  {
    id: '3',
    type: BonusType.STAKING,
    amount: '15.25',
    asset: 'XLM',
    timestamp: new Date().toISOString(),
    status: 'pending',
    description: 'Daily staking rewards',
  },
];

const MOCK_HISTORY: BonusHistory[] = [
  { date: '2024-04-18', amount: 45 },
  { date: '2024-04-19', amount: 52 },
  { date: '2024-04-20', amount: 48 },
  { date: '2024-04-21', amount: 70 },
  { date: '2024-04-22', amount: 65 },
  { date: '2024-04-23', amount: 90 },
  { date: '2024-04-24', amount: 85 },
];

export const useBonusStore = create<BonusStore>((set, get) => ({
  bonuses: [],
  notifications: [],
  history: MOCK_HISTORY,
  isLoading: false,
  totalEarned: '0.00',
  totalPending: '0.00',
  totalProjected: '0.00',

  fetchBonuses: async () => {
    set({ isLoading: true });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const earned = MOCK_BONUSES
      .filter(b => b.status === 'earned')
      .reduce((sum, b) => sum + parseFloat(b.amount), 0)
      .toFixed(2);
    
    const pending = MOCK_BONUSES
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + parseFloat(b.amount), 0)
      .toFixed(2);
      
    set({ 
      bonuses: MOCK_BONUSES, 
      totalEarned: earned,
      totalPending: pending,
      totalProjected: '500.00',
      isLoading: false 
    });
  },

  addBonus: (bonus: TradingBonus) => {
    set((state: BonusStore) => {
      const newBonuses = [bonus, ...state.bonuses];
      const earned = newBonuses
        .filter(b => b.status === 'earned')
        .reduce((sum, b) => sum + parseFloat(b.amount), 0)
        .toFixed(2);
      
      const newNotification: BonusNotification = {
        id: Math.random().toString(36).substr(2, 9),
        message: `New ${bonus.type} Bonus!`,
        amount: bonus.amount,
        type: bonus.type,
        timestamp: Date.now(),
      };

      return {
        bonuses: newBonuses,
        totalEarned: earned,
        notifications: [newNotification, ...state.notifications],
      };
    });
  },

  removeNotification: (id: string) => {
    set((state: BonusStore) => ({
      notifications: state.notifications.filter((n: BonusNotification) => n.id !== id),
    }));
  },

  simulateRealTimeBonus: () => {
    const types = Object.values(BonusType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomAmount = (Math.random() * 10 + 1).toFixed(2);
    
    const newBonus: TradingBonus = {
      id: Math.random().toString(36).substr(2, 9),
      type: randomType,
      amount: randomAmount,
      asset: 'XLM',
      timestamp: new Date().toISOString(),
      status: 'earned',
      description: `Randomly generated ${randomType} bonus`,
    };

    get().addBonus(newBonus);
    
    // Also update history slightly
    set((state: BonusStore) => {
      const lastDay = state.history[state.history.length - 1];
      const updatedHistory = [...state.history];
      updatedHistory[updatedHistory.length - 1] = {
        ...lastDay,
        amount: lastDay.amount + parseFloat(randomAmount)
      };
      return { history: updatedHistory };
    });
  },
}));
