import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Activity, AppNotification, DashboardSummary } from '@/types';
import { dashboardService } from '@/services/dashboardService';
import { transactionService, type LedgerTransaction } from '@/services/transactionService';
import { notificationService } from '@/services/notificationService';
import { getErrorMessage } from '@/services/api';

export type DashboardTransaction = LedgerTransaction;

interface DashboardState {
  summary: DashboardSummary | null;
  activities: Activity[];
  transactions: DashboardTransaction[];
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: DashboardState = {
  summary: null,
  activities: [],
  transactions: [],
  notifications: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

const DASHBOARD_STALE_MS = 25000;

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_force: boolean | undefined, { rejectWithValue }) => {
    try {
      const [summary, activityPage, transactionPage, notifications] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getActivities({ page: 1, limit: 8 }),
        transactionService.list({ page: 1, limit: 8 }),
        notificationService.getAll({ limit: 20 }),
      ]);

      return {
        summary,
        activities: activityPage.items,
        transactions: transactionPage.items,
        notifications,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (force, { getState }) => {
      const { dashboard } = getState() as { dashboard: DashboardState };
      if (dashboard.isLoading) {
        return false;
      }
      if (
        !force &&
        dashboard.lastFetchedAt &&
        Date.now() - dashboard.lastFetchedAt < DASHBOARD_STALE_MS
      ) {
        return false;
      }
      return true;
    },
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    invalidateDashboard: state => {
      state.lastFetchedAt = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDashboard.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload.summary;
        state.activities = action.payload.activities;
        state.transactions = action.payload.transactions;
        state.notifications = action.payload.notifications;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { invalidateDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;
