import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterData,
  User,
} from '../types/auth.types';
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  socialAuth,
} from '../services/auth.service';
import {
  storeTokens,
  clearTokens,
  getAccessToken,
  isTokenExpired,
  formatAuthError,
  isSessionExpiringSoon,
} from '../utils/auth.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 60000; // Check every minute
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh 5 minutes before expiry

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await loginUser(credentials);

      // Store tokens
      if (response.tokens) {
        storeTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken,
          credentials.rememberMe || false
        );
      }

      setState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success('Login successful!');
      // Record login activity for students
      if (response.user?.role === 'student' && response.tokens?.accessToken) {
        try {
          const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';
          await axios.post(`${apiUrl}/student/record-login-activity`, {}, {
            headers: {
              Authorization: `Bearer ${response.tokens.accessToken}`,
            },
          });
        } catch (err) {
          // Silently fail - don't interrupt login process if recording fails
          console.error('[AuthContext] Failed to record login activity:', err);
        }
      }
      return response;
    } catch (error) {
      const errorMessage = formatAuthError(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (data: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await registerUser(data);

      // Store tokens only if they exist (for approved users like admins)
      if (response.tokens && response.tokens.accessToken) {
        storeTokens(response.tokens.accessToken, response.tokens.refreshToken, true);
      }

      setState({
        user: response.user,
        tokens: response.tokens || null,
        isAuthenticated: !!response.tokens, // Only authenticated if tokens exist
        isLoading: false,
        error: null,
      });

      if (response.tokens && response.tokens.accessToken) {
        toast.success('Registration successful!');
      } else if (response.message) {
        toast.success(response.message);
      }
      return response;
    } catch (error) {
      const errorMessage = formatAuthError(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      toast.success('Logged out successfully');
    }
  }, []);

  /**
   * Refresh token function
   */
  const refreshToken = useCallback(async () => {
    try {
      const tokens = await refreshAccessToken();

      if (tokens) {
        storeTokens(tokens.accessToken, tokens.refreshToken, true);
      }

      setState((prev) => ({
        ...prev,
        tokens,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
    }
  }, [logout]);

  /**
   * Update user function
   */
  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updatedUser } : null,
    }));
  }, []);

  /**
   * Clear error function
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        try {
          await refreshToken();
        } catch (error) {
          clearTokens();
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
      }

      // Fetch current user
      try {
        const user = await getCurrentUser();
        setState({
          user,
          tokens: {
            accessToken: token,
            refreshToken: '',
            expiresIn: 3600,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        clearTokens();
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, [refreshToken]);

  /**
   * Setup session monitoring
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokens) return;

    const checkSession = () => {
      const token = getAccessToken();

      if (!token) {
        logout();
        return;
      }

      if (isTokenExpired(token)) {
        refreshToken();
      } else {
        // Calculate expiration time
        try {
          const parts = token.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            const expirationTime = payload.exp * 1000;

            if (isSessionExpiringSoon(expirationTime)) {
              refreshToken();
            }
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    };

    // Check session periodically
    const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, state.tokens, logout, refreshToken]);

  /**
   * Handle visibility change for token refresh
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated) {
        const token = getAccessToken();
        if (token && isTokenExpired(token)) {
          refreshToken();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isAuthenticated, refreshToken]);

  /**
   * Social Login function
   */
  const socialLogin = useCallback(async (provider: 'google' | 'facebook', token: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await socialAuth(provider, token);

      if (response.tokens) {
        storeTokens(response.tokens.accessToken, response.tokens.refreshToken, true);
      }

      setState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`);
      return response;
    } catch (error) {
      const errorMessage = formatAuthError(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    socialLogin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    export default AuthContext;
