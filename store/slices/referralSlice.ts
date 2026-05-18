import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReferralService } from '../../features/referral-sharing/services/referralService';
import { ReferralLink, ReferralStats, ReferralReward } from '../../features/referral-sharing/types';

interface ReferralState {
  stats: ReferralStats | null;
  links: ReferralLink[];
  rewards: ReferralReward[];
  loading: boolean;
  error: string | null;
}

const initialState: ReferralState = {
  stats: null,
  links: [],
  rewards: [],
  loading: false,
  error: null,
};

export const fetchReferralData = createAsyncThunk(
  'referral/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      const [stats, links, rewards] = await Promise.all([
        ReferralService.getReferralStats(userId),
        ReferralService.getUserReferralLinks(userId),
        ReferralService.getReferralRewards(userId),
      ]);
      return { stats, links, rewards };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch referral data');
    }
  }
);

export const generateLink = createAsyncThunk(
  'referral/generateLink',
  async ({ userId, reward }: { userId: string, reward?: string }, { rejectWithValue }) => {
    try {
      const newLink = await ReferralService.generateReferralLink(userId, reward);
      return newLink;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate link');
    }
  }
);

export const claimReferralReward = createAsyncThunk(
  'referral/claimReward',
  async (rewardId: string, { rejectWithValue }) => {
    try {
      const success = await ReferralService.claimReward(rewardId);
      if (!success) throw new Error('Claim failed');
      return rewardId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to claim reward');
    }
  }
);

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.links = action.payload.links;
        state.rewards = action.payload.rewards;
      })
      .addCase(fetchReferralData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateLink.fulfilled, (state, action) => {
        state.links.unshift(action.payload);
        if (state.stats) {
          state.stats.activeLinks += 1;
        }
      })
      .addCase(claimReferralReward.fulfilled, (state, action) => {
        const reward = state.rewards.find(r => r.id === action.payload);
        if (reward) {
          reward.status = 'claimed';
        }
      });
  },
});

export const { clearError } = referralSlice.actions;
export default referralSlice.reducer;
