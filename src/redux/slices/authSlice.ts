import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { LoginRequest, RegisterRequest, User } from '@/types';
import { authService } from '@/services/authService';
import { tokenStorage, storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isLoggingOut: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  isLoggingOut: false,
  error: null,
};

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const tokens = await tokenStorage.getTokens();
  if (!tokens) return null;
  try {
    const user = await authService.getProfile();
    await storage.setItem(STORAGE_KEYS.USER, user);
    return user;
  } catch {
    await tokenStorage.clearTokens();
    return null;
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const { user, tokens } = await authService.login(credentials);
      await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      await storage.setItem(STORAGE_KEYS.USER, user);
      return user;
    } catch (error) {
      return rejectWithValue(authService.getErrorMessage(error));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const { user, tokens } = await authService.register(data);
      await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      await storage.setItem(STORAGE_KEYS.USER, user);
      return user;
    } catch (error) {
      return rejectWithValue(authService.getErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      await tokenStorage.clearTokens();
    } catch (error) {
      await tokenStorage.clearTokens();
      return rejectWithValue(authService.getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { isLoggingOut } = (getState() as { auth: AuthState }).auth;
      return !isLoggingOut;
    },
  },
);

const clearSession = (state: AuthState) => {
  state.user = null;
  state.isAuthenticated = false;
  state.isLoggingOut = false;
};

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const user = await authService.updateProfile(data);
      await storage.setItem(STORAGE_KEYS.USER, user);
      return user;
    } catch (error) {
      return rejectWithValue(authService.getErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, state => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, state => {
        state.isLoggingOut = true;
      })
      .addCase(logout.fulfilled, clearSession)
      .addCase(logout.rejected, clearSession)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
