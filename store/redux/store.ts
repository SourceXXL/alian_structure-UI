import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";
import apiMetricsReducer from "./apiMetricsSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    apiMetrics: apiMetricsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
