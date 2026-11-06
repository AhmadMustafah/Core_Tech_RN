import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/types';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
}

const initialState: ThemeState = {
  mode: 'light',
  hydrated: false,
};

const normalizeThemeMode = (value: unknown): ThemeMode =>
  value === 'dark' ? 'dark' : 'light';

export const loadThemePreferences = createAsyncThunk('theme/loadPreferences', async () => {
  const mode = await storage.getItem<string>(STORAGE_KEYS.THEME_MODE);
  return { mode: normalizeThemeMode(mode) };
});

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = normalizeThemeMode(action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(loadThemePreferences.fulfilled, (state, action) => {
      state.mode = action.payload.mode;
      state.hydrated = true;
    });
    builder.addCase(loadThemePreferences.rejected, state => {
      state.hydrated = true;
    });
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
