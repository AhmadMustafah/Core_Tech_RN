import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  CurrencyDisplay,
  DateFormat,
  Language,
  SessionTimeout,
} from '@/types';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

export type AppPreferences = {
  notifySales: boolean;
  notifyPurchases: boolean;
  notifyLowStock: boolean;
  notifyOrders: boolean;
  biometricLock: boolean;
  lockOnBackground: boolean;
  sessionTimeout: SessionTimeout;
  compactLists: boolean;
  confirmDeletes: boolean;
  hapticsEnabled: boolean;
  dateFormat: DateFormat;
  currencyFormat: CurrencyDisplay;
};

interface SettingsState {
  notificationsEnabled: boolean;
  language: Language;
  hydrated: boolean;
  preferences: AppPreferences;
}

export const defaultAppPreferences: AppPreferences = {
  notifySales: true,
  notifyPurchases: true,
  notifyLowStock: true,
  notifyOrders: true,
  biometricLock: false,
  lockOnBackground: true,
  sessionTimeout: '30',
  compactLists: false,
  confirmDeletes: true,
  hapticsEnabled: true,
  dateFormat: 'dmy',
  currencyFormat: 'code',
};

const initialState: SettingsState = {
  notificationsEnabled: true,
  language: 'en',
  hydrated: false,
  preferences: defaultAppPreferences,
};

const normalizeLanguage = (value: unknown): Language =>
  value === 'ur' ? 'ur' : 'en';

const isSessionTimeout = (value: unknown): value is SessionTimeout =>
  value === '15' || value === '30' || value === '60';

const isDateFormat = (value: unknown): value is DateFormat =>
  value === 'dmy' || value === 'mdy' || value === 'ymd';

const isCurrencyDisplay = (value: unknown): value is CurrencyDisplay =>
  value === 'symbol' || value === 'code';

const mergePreferences = (value: unknown): AppPreferences => {
  if (!value || typeof value !== 'object') {
    return defaultAppPreferences;
  }

  const incoming = value as Partial<AppPreferences>;
  return {
    notifySales: incoming.notifySales ?? defaultAppPreferences.notifySales,
    notifyPurchases: incoming.notifyPurchases ?? defaultAppPreferences.notifyPurchases,
    notifyLowStock: incoming.notifyLowStock ?? defaultAppPreferences.notifyLowStock,
    notifyOrders: incoming.notifyOrders ?? defaultAppPreferences.notifyOrders,
    biometricLock: incoming.biometricLock ?? defaultAppPreferences.biometricLock,
    lockOnBackground: incoming.lockOnBackground ?? defaultAppPreferences.lockOnBackground,
    sessionTimeout: isSessionTimeout(incoming.sessionTimeout)
      ? incoming.sessionTimeout
      : defaultAppPreferences.sessionTimeout,
    compactLists: incoming.compactLists ?? defaultAppPreferences.compactLists,
    confirmDeletes: incoming.confirmDeletes ?? defaultAppPreferences.confirmDeletes,
    hapticsEnabled: incoming.hapticsEnabled ?? defaultAppPreferences.hapticsEnabled,
    dateFormat: isDateFormat(incoming.dateFormat)
      ? incoming.dateFormat
      : defaultAppPreferences.dateFormat,
    currencyFormat: isCurrencyDisplay(incoming.currencyFormat)
      ? incoming.currencyFormat
      : defaultAppPreferences.currencyFormat,
  };
};

export const loadSettingsPreferences = createAsyncThunk(
  'settings/loadPreferences',
  async () => {
    const [language, notificationsEnabled, preferences] = await Promise.all([
      storage.getItem<Language>(STORAGE_KEYS.LANGUAGE),
      storage.getItem<boolean>(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
      storage.getItem<Partial<AppPreferences>>(STORAGE_KEYS.SETTINGS_PREFERENCES),
    ]);

    return {
      language: normalizeLanguage(language),
      notificationsEnabled: notificationsEnabled ?? true,
      preferences: mergePreferences(preferences),
    };
  },
);

export const updateAppPreferences = createAsyncThunk(
  'settings/updateAppPreferences',
  async (patch: Partial<AppPreferences>, { getState }) => {
    const current = (getState() as { settings: SettingsState }).settings.preferences;
    const next = mergePreferences({ ...current, ...patch });
    await storage.setItem(STORAGE_KEYS.SETTINGS_PREFERENCES, next);
    return next;
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
      state.preferences = action.payload.preferences;
      state.hydrated = true;
    });
    builder.addCase(loadSettingsPreferences.rejected, state => {
      state.hydrated = true;
    });
    builder.addCase(updateAppPreferences.fulfilled, (state, action) => {
      state.preferences = action.payload;
    });
  },
});

export const { setNotificationsEnabled, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
