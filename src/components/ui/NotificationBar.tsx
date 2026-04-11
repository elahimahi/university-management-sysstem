import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';
type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface NotificationBarProps {
  id: string;
  type?: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  position?: NotificationPosition;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  position = 'top-right',
  onClose,
  action,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      border: 'border-success-200 dark:border-success-700',
      icon: CheckCircle,
      iconColor: 'text-success-600 dark:text-success-400',
      title: 'text-success-900 dark:text-success-100',
      text: 'text-success-700 dark:text-success-200',
      action: 'text-success-700 dark:text-success-300 hover:text-success-900 dark:hover:text-success-100',
    },
    error: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      border: 'border-error-200 dark:border-error-700',
      icon: AlertCircle,
      iconColor: 'text-error-600 dark:text-error-400',
      title: 'text-error-900 dark:text-error-100',
      text: 'text-error-700 dark:text-error-200',
      action: 'text-error-700 dark:text-error-300 hover:text-error-900 dark:hover:text-error-100',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      border: 'border-warning-200 dark:border-warning-700',
      icon: AlertTriangle,
      iconColor: 'text-warning-600 dark:text-warning-400',
      title: 'text-warning-900 dark:text-warning-100',
      text: 'text-warning-700 dark:text-warning-200',
      action: 'text-warning-700 dark:text-warning-300 hover:text-warning-900 dark:hover:text-warning-100',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100',
      text: 'text-blue-700 dark:text-blue-200',
      action: 'text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100',
    },
  };

  const IconComponent = typeConfig[type].icon;

  const getPositionStyles = (): { [key: string]: string } => {
    const baseClasses = 'fixed pointer-events-auto z-[9999]';
    const positions: Record<NotificationPosition, string> = {
      'top-left': `${baseClasses} top-4 left-4`,
      'top-center': `${baseClasses} top-4 left-1/2 -translate-x-1/2`,
      'top-right': `${baseClasses} top-4 right-4`,
      'bottom-left': `${baseClasses} bottom-4 left-4`,
      'bottom-center': `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`,
      'bottom-right': `${baseClasses} bottom-4 right-4`,
    };
    return positions;
  };

  const isTop = position.startsWith('top');

  return (
    <motion.div
      initial={{ opacity: 0, y: isTop ? -20 : 20, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: isTop ? -20 : 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${getPositionStyles()[position]} w-full max-w-sm`}
    >
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${typeConfig[type].bg} ${typeConfig[type].border} shadow-lg backdrop-blur-sm`}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className={`flex-shrink-0 mt-0.5 ${typeConfig[type].iconColor}`}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex-1"
        >
          <h3 className={`font-semibold text-sm ${typeConfig[type].title}`}>{title}</h3>
          {message && (
            <p className={`text-xs mt-0.5 ${typeConfig[type].text}`}>{message}</p>
          )}
          {action && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={`text-xs font-medium mt-2 transition-colors ${typeConfig[type].action}`}
            >
              {action.label}
            </motion.button>
          )}
        </motion.div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClose(id)}
          className={`flex-shrink-0 p-1 transition-colors ${typeConfig[type].action}`}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-1 mt-2 rounded-full origin-left ${
            type === 'success'
              ? 'bg-success-500'
              : type === 'error'
              ? 'bg-error-500'
              : type === 'warning'
              ? 'bg-warning-500'
              : 'bg-blue-500'
          }`}
          style={{ opacity: 0.6 }}
        />
      )}
    </motion.div>
  );
};

export default NotificationBar;
