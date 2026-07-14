import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Activity, DashboardSummary } from '@/types';
import { dashboardService } from '@/services/dashboardService';
import { getErrorMessage } from '@/services/api';

interface DashboardState {
  summary: DashboardSummary | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  activities: [],
  isLoading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const [summary, activities] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getActivities(),
      ]);
      return { summary, activities };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
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
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
