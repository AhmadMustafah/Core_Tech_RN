import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '@/types';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

interface SettingsState {
  notificationsEnabled: boolean;
  language: Language;
  hydrated: boolean;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  language: 'en',
  hydrated: false,
};

const normalizeLanguage = (value: unknown): Language =>
  value === 'ur' ? 'ur' : 'en';

export const loadSettingsPreferences = createAsyncThunk(
  'settings/loadPreferences',
  async () => {
    const [language, notificationsEnabled] = await Promise.all([
      storage.getItem<Language>(STORAGE_KEYS.LANGUAGE),
      storage.getItem<boolean>(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
    ]);

    return {
      language: normalizeLanguage(language),
      notificationsEnabled: notificationsEnabled ?? true,
    };
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = normalizeLanguage(action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(loadSettingsPreferences.fulfilled, (state, action) => {
      state.language = action.payload.language;
      state.notificationsEnabled = action.payload.notificationsEnabled;
      state.hydrated = true;
    });
    builder.addCase(loadSettingsPreferences.rejected, state => {
      state.hydrated = true;
    });
  },
});

export const { setNotificationsEnabled, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
