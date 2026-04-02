import { PasswordStrength } from '../types/auth.types';

/**
 * Store authentication tokens in localStorage or sessionStorage
 */
export const storeTokens = (
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('accessToken', accessToken);
  storage.setItem('refreshToken', refreshToken);
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

/**
 * Clear all stored tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 * Returns null if token is invalid or already expired
 */
export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    const expirationTime = payload.exp * 1000;

    // Return null if already expired
    if (Date.now() >= expirationTime) {
      return null;
    }

    return expirationTime;
  } catch {
    return null;
  }
};

/**
 * Calculate password strength
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Too weak',
      color: 'bg-gray-300',
      suggestions: ['Enter a password'],
    };
  }

  // Length check
  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score++;

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else suggestions.push('Use both uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else suggestions.push('Include at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Include special characters (!@#$%^&*)');

  // Determine label and color
  const strengthMap = [
    { label: 'Too weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ];

  return {
    score,
    ...strengthMap[score],
    suggestions,
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format error messages
 */
export const formatAuthError = (error: any): string => {
  if (typeof error === 'string') return error;

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Generate OTP (for demo purposes - in production this should come from backend)
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate OTP format
 */
export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

/**
 * Get user initials from name
 */
export const getUserInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Check if session is about to expire (within 5 minutes)
 */
export const isSessionExpiringSoon = (expirationTime: number): boolean => {
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= expirationTime - fiveMinutes;
};
