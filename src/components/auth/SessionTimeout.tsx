import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getTokenExpiryTime } from '../../utils/auth.utils';

const SessionTimeout: React.FC = () => {
  const { tokens, refreshToken, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!tokens?.accessToken) return;

    const checkTokenExpiry = () => {
      if (!tokens?.accessToken) return;
      const expiryTime = getTokenExpiryTime(tokens.accessToken);

      // Token is invalid or already expired
      if (!expiryTime) {
        logout();
        return;
      }

      const timeUntilExpiry = expiryTime - Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Show warning if less than 5 minutes remaining
      if (timeUntilExpiry > 0 && timeUntilExpiry <= fiveMinutes) {
        setShowWarning(true);
        setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every 10 seconds
    const interval = setInterval(checkTokenExpiry, 10000);

    return () => clearInterval(interval);
  }, [tokens, logout]);

  useEffect(() => {
    if (!showWarning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, timeLeft, logout]);

  const handleRefreshSession = async () => {
    try {
      await refreshToken();
      setShowWarning(false);
    } catch (error) {
      // Error will be handled by auth context
    }
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleLogout}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl z-50"
          >
            <div className="text-center">
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="inline-block p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4"
              >
                <svg
                  className="w-12 h-12 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">
                Session Expiring Soon
              </h3>

              {/* Time Display */}
              <div className="my-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-3xl font-mono font-bold text-yellow-600 dark:text-yellow-400">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your session will expire soon. Do you want to continue?
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                >
                  Logout
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefreshSession}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg transition-all"
                >
                  Continue Session
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeout;
