/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#1e40af',     // University blue
          'primary-dark': '#1e3a8a',
          'primary-light': '#3b82f6',
          accent: '#0d9488',      // Academic teal
          'accent-dark': '#115e59',
          'accent-light': '#14b8a6',
          amber: '#f59e0b',       // Highlight
          'amber-dark': '#d97706',
        },
        // Surface colors
        surface: {
          base: '#ffffff',
          card: '#f9fafb',
          elevated: '#ffffff',
          darkBase: '#0f172a',
          darkCard: '#1e293b',
          darkElevated: '#334155',
        },
        // Text colors
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          muted: '#9ca3af',
          'dark-primary': '#f1f5f9',
          'dark-secondary': '#cbd5e1',
          'dark-muted': '#94a3b8',
        },
        // Border colors
        border: {
          light: '#e5e7eb',
          dark: '#e2e8f0',
          'dark-dark': '#475569',
        },
        // Semantic colors
        semantic: {
          success: '#10b981',
          'success-dark': '#059669',
          warning: '#f59e0b',
          'warning-dark': '#d97706',
          error: '#ef4444',
          'error-dark': '#dc2626',
          info: '#3b82f6',
          'info-dark': '#2563eb',
        },
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
        '3xl': '3.5rem',
        '4xl': '4rem',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hover': '0 15px 25px -5px rgba(0, 0, 0, 0.15)',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
