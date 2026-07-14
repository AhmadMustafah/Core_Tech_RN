import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '@/types';

interface SettingsState {
  notificationsEnabled: boolean;
  language: Language;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  language: 'en',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
  },
});

export const { setNotificationsEnabled, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
