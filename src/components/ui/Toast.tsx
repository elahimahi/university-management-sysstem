import React from 'react';
import { toast as hotToast, Toaster, ToastOptions } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Custom Toast Component
const CustomToast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
}> = ({ message, type, icon }) => {
  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const colors = {
    success: 'text-success-600',
    error: 'text-error-600',
    warning: 'text-warning-600',
    info: 'text-info-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-4 bg-white dark:bg-navy-800 rounded-lg shadow-xl border border-navy-200 dark:border-navy-700"
    >
      <div className={colors[type]}>
        {icon || icons[type]}
      </div>
      <p className="text-navy-900 dark:text-white font-medium">
        {message}
      </p>
    </motion.div>
  );
};

// Toast Wrapper Functions
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      <CustomToast message={message} type="success" />,
      { ...defaultOptions, ...options }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      <CustomToast message={message} type="error" />,
      { ...defaultOptions, ...options }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      <CustomToast message={message} type="warning" />,
      { ...defaultOptions, ...options }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    hotToast.custom(
      <CustomToast message={message} type="info" />,
      { ...defaultOptions, ...options }
    );
  },

  loading: (message: string, options?: ToastOptions) => {
    return hotToast.loading(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...defaultOptions,
        ...options,
        style: {
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        },
      }
    );
  },

  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },
};

// Toast Provider Component
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
};

export default toast;
