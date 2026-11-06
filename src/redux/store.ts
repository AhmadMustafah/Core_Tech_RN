import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import settingsReducer from './slices/settingsSlice';
import dashboardReducer from './slices/dashboardSlice';
import dataSyncReducer from './slices/dataSyncSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    settings: settingsReducer,
    dashboard: dashboardReducer,
    dataSync: dataSyncReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
