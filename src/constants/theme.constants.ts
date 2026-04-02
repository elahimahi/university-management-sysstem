/**
 * Theme Constants
 * Central configuration for theme-related values
 */

export const THEME = {
  MODES: {
    LIGHT: 'light' as const,
    DARK: 'dark' as const,
  },
  STORAGE_KEY: 'theme',
} as const;

export const COLORS = {
  // Brand Colors
  NAVY: {
    50: '#e8edf5',
    100: '#c2d1e4',
    200: '#9ab4d3',
    300: '#7297c2',
    400: '#4a7ab1',
    500: '#225ca0',
    600: '#1a4780',
    700: '#133560',
    800: '#0d2440',
    900: '#0A1929',
    950: '#050c15',
  },
  GOLD: {
    50: '#fffbf0',
    100: '#fff4d6',
    200: '#ffecb3',
    300: '#ffe390',
    400: '#ffdb6d',
    500: '#FFB347',
    600: '#ff9f1a',
    700: '#f58700',
    800: '#c26b00',
    900: '#8f4f00',
    950: '#5c3300',
  },
  // Semantic Colors
  SUCCESS: {
    light: '#22c55e',
    dark: '#16a34a',
  },
  WARNING: {
    light: '#f59e0b',
    dark: '#d97706',
  },
  ERROR: {
    light: '#ef4444',
    dark: '#dc2626',
  },
  INFO: {
    light: '#3b82f6',
    dark: '#2563eb',
  },
} as const;

export const FONTS = {
  SANS: "'Inter', system-ui, -apple-system, sans-serif",
  DISPLAY: "'Poppins', system-ui, sans-serif",
  MONO: "'Monaco', 'Courier New', monospace",
} as const;

export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const TRANSITIONS = {
  FAST: '150ms',
  BASE: '300ms',
  SLOW: '500ms',
} as const;

export const SHADOWS = {
  SOFT: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  SOFT_LG: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
  GLOW: '0 0 20px rgba(255, 179, 71, 0.3)',
  GLOW_NAVY: '0 0 20px rgba(10, 25, 41, 0.3)',
} as const;

export const GRADIENTS = {
  UNIVERSITY: 'linear-gradient(135deg, #0A1929 0%, #225ca0 100%)',
  GOLD: 'linear-gradient(135deg, #FFB347 0%, #ff9f1a 100%)',
  RADIAL: 'radial-gradient(circle at center, var(--tw-gradient-stops))',
} as const;

export const ANIMATIONS = {
  DURATIONS: {
    FAST: 300,
    BASE: 500,
    SLOW: 700,
  },
  EASINGS: {
    IN: 'ease-in',
    OUT: 'ease-out',
    IN_OUT: 'ease-in-out',
    LINEAR: 'linear',
  },
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

export const CONTAINER = {
  MAX_WIDTH: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
    FULL: '100%',
  },
  PADDING: {
    SM: '1rem',
    MD: '1.5rem',
    LG: '2rem',
  },
} as const;

export const SPACING = {
  SECTION: {
    SM: '4rem',
    MD: '6rem',
    LG: '8rem',
    XL: '10rem',
  },
  CARD: {
    SM: '1rem',
    MD: '1.5rem',
    LG: '2rem',
  },
} as const;

export const BORDER_RADIUS = {
  SM: '0.375rem',
  MD: '0.5rem',
  LG: '0.75rem',
  XL: '1rem',
  '2XL': '1.5rem',
  FULL: '9999px',
} as const;

// Theme-specific values
export const LIGHT_THEME = {
  bg: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },
  text: {
    primary: '#0A1929',
    secondary: '#475569',
    tertiary: '#94a3b8',
  },
  border: {
    default: '#e2e8f0',
    hover: '#cbd5e1',
  },
} as const;

export const DARK_THEME = {
  bg: {
    primary: '#0A1929',
    secondary: '#0d2440',
    tertiary: '#133560',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
  },
  border: {
    default: '#1e293b',
    hover: '#334155',
  },
} as const;

// Utility function to get current theme values
export const getThemeColors = (isDark: boolean) => {
  return isDark ? DARK_THEME : LIGHT_THEME;
};

// Export types
export type ThemeMode = typeof THEME.MODES[keyof typeof THEME.MODES];
export type ColorShade = keyof typeof COLORS.NAVY;
export type Breakpoint = keyof typeof BREAKPOINTS;
export type TransitionDuration = keyof typeof TRANSITIONS;
