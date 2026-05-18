import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApiMetricsState {
  totalRequests: number;
  cacheHits: number;
  networkRequests: number;
  batchedRequests: number;
  lastRequestAt: string | null;
}

const initialState: ApiMetricsState = {
  totalRequests: 0,
  cacheHits: 0,
  networkRequests: 0,
  batchedRequests: 0,
  lastRequestAt: null,
};

const apiMetricsSlice = createSlice({
  name: "apiMetrics",
  initialState,
  reducers: {
    recordRequest(
      state,
      action: PayloadAction<{
        cacheHit: boolean;
        networkRequest: boolean;
        batched: boolean;
      }>
    ) {
      state.totalRequests += 1;
      if (action.payload.cacheHit) {
        state.cacheHits += 1;
      }
      if (action.payload.networkRequest) {
        state.networkRequests += 1;
      }
      if (action.payload.batched) {
        state.batchedRequests += 1;
      }
      state.lastRequestAt = new Date().toISOString();
    },
  },
});

export const { recordRequest } = apiMetricsSlice.actions;
export default apiMetricsSlice.reducer;
