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
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const tokens = await tokenStorage.getTokens();
  if (!tokens) return null;
  const user = await storage.getItem<User>(STORAGE_KEYS.USER);
  if (!user) return null;
  return user;
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

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  await tokenStorage.clearTokens();
});

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
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
