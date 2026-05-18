import { configureStore } from '@reduxjs/toolkit';
import referralReducer from './slices/referralSlice';

export const store = configureStore({
  reducer: {
    referral: referralReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
