import axios from 'axios';
import {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  VerifyOTPData,
  ResetPasswordData,
  User,
  AuthTokens,
} from '../types/auth.types';
import { getAccessToken, getRefreshToken } from '../utils/auth.utils';

// API base URL - Points to backend server
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

/**
 * Decode a JWT token payload without verifying signature.
 */
const decodeJWT = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.warn('[auth.service] decodeJWT failed', error);
    return null;
  }
};

/**
 * Generate a mock JWT token for testing.
 */
const generateMockJWT = (
  expiresInSeconds: number = 3600,
  payloadOverrides: Record<string, any> = {}
): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const defaultPayload = {
    sub: '1',
    email: 'user@example.com',
    role: 'student',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const payload = btoa(JSON.stringify({
    ...defaultPayload,
    ...payloadOverrides,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }));
  const signature = btoa('mock_signature');
  return `${header}.${payload}.${signature}`;
};

// Create axios instance
console.debug('[auth.service] using API_BASE_URL =', API_BASE_URL);
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor mainly for debugging network issues
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // log full error object for investigation
    console.error('[auth.service] network error or response error:', error);
    // rethrow to let caller handle formatting
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Login user with credentials
 */
export const loginUser = async (
  credentials: LoginCredentials
): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    console.debug('[auth.service] loginUser credentials', credentials);
    const response = await authApi.post(
      '/auth/login',
      credentials
    );
    // Convert snake_case to camelCase
    const user = response.data.user;
    const mappedUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      profilePicture: user.profile_picture,
      isEmailVerified: user.is_email_verified,
      approvalStatus: user.approval_status,
      rejectionReason: user.rejection_reason,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
    const tokens = response.data.tokens;
    const mappedTokens: AuthTokens = {
      accessToken: tokens.access_token || tokens.accessToken,
      refreshToken: tokens.refresh_token || tokens.refreshToken,
      expiresIn: tokens.expires_in || tokens.expiresIn,
    };
    return { user: mappedUser, tokens: mappedTokens };
  } catch (error: any) {
    console.error('[auth.service] loginUser failed', {
      message: error.message,
      response: error.response,
      request: error.request,
    });
    throw error;
  }
};

/**
 * Register new user
 */
export const registerUser = async (
  data: RegisterData
): Promise<{ user: User; tokens: AuthTokens | null; message?: string }> => {
  try {
    console.debug('[auth.service] registerUser data', data);
    const response = await authApi.post(
      '/auth/register',
      data
    );
    // Convert snake_case to camelCase
    const user = response.data.user;
    const mappedUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      profilePicture: user.profile_picture,
      isEmailVerified: user.is_email_verified,
      approvalStatus: user.approval_status,
      rejectionReason: user.rejection_reason,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
    const tokens = response.data.tokens;
    const mappedTokens: AuthTokens | null = tokens
      ? {
          accessToken: tokens.access_token || tokens.accessToken,
          refreshToken: tokens.refresh_token || tokens.refreshToken,
          expiresIn: tokens.expires_in || tokens.expiresIn,
        }
      : null;
    return {
      user: mappedUser,
      tokens: mappedTokens,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('[auth.service] registerUser failed', {
      message: error.message,
      response: error.response,
      request: error.request,
    });
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  data: ForgotPasswordData
): Promise<{ message: string }> => {
  try {
    // const response = await authApi.post('/auth/forgot-password', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      message: 'Password reset OTP sent to your email',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP for password reset
 */
export const verifyOTP = async (data: VerifyOTPData): Promise<{ valid: boolean }> => {
  try {
    // const response = await authApi.post('/auth/verify-otp', data);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation - accept 123456 as valid OTP
    return {
      valid: data.otp === '123456',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (
  data: ResetPasswordData
): Promise<{ message: string }> => {
  try {
    // const response = await authApi.post('/auth/reset-password', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      message: 'Password reset successfully',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (): Promise<AuthTokens> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const existingPayload = decodeJWT(refreshToken);
    const sub = existingPayload?.sub || existingPayload?.user_id || '1';
    const email = existingPayload?.email || 'user@example.com';
    const role = existingPayload?.role || 'student';

    // const response = await authApi.post('/auth/refresh', { refreshToken });
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      accessToken: generateMockJWT(3600, { sub, email, role }), // 1 hour
      refreshToken: generateMockJWT(604800, { sub, email, role }), // 7 days
      expiresIn: 3600,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // const response = await authApi.post('/auth/logout');
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout error:', error);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    // Use the correct backend endpoint for current user profile
    const response = await authApi.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Social authentication (Google/Facebook)
 */
export const socialAuth = async (
  provider: 'google' | 'facebook',
  token: string
): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    // const response = await authApi.post(`/auth/${provider}`, { token });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      user: {
        id: '3',
        email: 'social@example.com',
        firstName: 'Social',
        lastName: 'User',
        role: 'student',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: generateMockJWT(3600), // 1 hour
        refreshToken: generateMockJWT(604800), // 7 days
        expiresIn: 3600,
      },
    };
  } catch (error) {
    throw error;
  }
};
