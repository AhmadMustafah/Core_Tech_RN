import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, logout, register, clearError } from '@/redux/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error } =
    useAppSelector(state => state.auth);

  const handleLogin = useCallback(
    (credentials: LoginRequest) => dispatch(login(credentials)),
    [dispatch],
  );

  const handleRegister = useCallback(
    (data: RegisterRequest) => dispatch(register(data)),
    [dispatch],
  );

  const handleLogout = useCallback(() => dispatch(logout()), [dispatch]);

  const handleClearError = useCallback(
    () => dispatch(clearError()),
    [dispatch],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
