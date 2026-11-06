import { createSlice } from '@reduxjs/toolkit';
import { invalidateDashboard } from './dashboardSlice';

interface DataSyncState {
  revision: number;
}

const initialState: DataSyncState = {
  revision: 0,
};

const dataSyncSlice = createSlice({
  name: 'dataSync',
  initialState,
  reducers: {
    bumpData: state => {
      state.revision += 1;
    },
  },
});

export const { bumpData } = dataSyncSlice.actions;

export const markAppDataStale = () => (dispatch: (action: unknown) => void) => {
  dispatch(bumpData());
  dispatch(invalidateDashboard());
};

export default dataSyncSlice.reducer;
