import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/types';
import type { ThemePreset } from '@/theme';
import { normalizeThemePreset } from '@/theme';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

interface ThemeState {
  mode: ThemeMode;
  preset: ThemePreset;
  hydrated: boolean;
}

const initialState: ThemeState = {
  mode: 'light',
  preset: 'default',
  hydrated: false,
};

const normalizeThemeMode = (value: unknown): ThemeMode => {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'light';
};

export const loadThemePreferences = createAsyncThunk(
  'theme/loadPreferences',
  async () => {
    const [mode, preset] = await Promise.all([
      storage.getItem<ThemeMode>(STORAGE_KEYS.THEME_MODE),
      storage.getItem<ThemePreset>(STORAGE_KEYS.THEME_PRESET),
    ]);

    return {
      mode: normalizeThemeMode(mode),
      preset: normalizeThemePreset(preset),
    };
  },
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
    setThemePreset: (state, action: PayloadAction<ThemePreset>) => {
      state.preset = normalizeThemePreset(action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(loadThemePreferences.fulfilled, (state, action) => {
      state.mode = action.payload.mode;
      state.preset = action.payload.preset;
      state.hydrated = true;
    });
    builder.addCase(loadThemePreferences.rejected, state => {
      state.hydrated = true;
    });
  },
});

export const { setThemeMode, setThemePreset } = themeSlice.actions;
export default themeSlice.reducer;
