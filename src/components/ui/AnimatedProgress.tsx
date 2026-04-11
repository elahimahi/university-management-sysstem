import React from 'react';
import { motion } from 'framer-motion';

type ProgressVariant = 'circular' | 'linear';
type ProgressColor = 'primary' | 'success' | 'warning' | 'error' | 'gold';

interface AnimatedProgressProps {
  value: number; // 0-100
  maximum?: number; // Used for calculating percentage if value > 100
  variant?: ProgressVariant;
  color?: ProgressColor;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const colorConfig = {
  primary: {
    bg: 'bg-navy-900 dark:bg-navy-700',
    light: 'bg-navy-100 dark:bg-navy-800',
    text: 'text-navy-900 dark:text-navy-100',
  },
  success: {
    bg: 'bg-success-500 dark:bg-success-600',
    light: 'bg-success-100 dark:bg-success-900',
    text: 'text-success-700 dark:text-success-300',
  },
  warning: {
    bg: 'bg-warning-500 dark:bg-warning-600',
    light: 'bg-warning-100 dark:bg-warning-900',
    text: 'text-warning-700 dark:text-warning-300',
  },
  error: {
    bg: 'bg-error-500 dark:bg-error-600',
    light: 'bg-error-100 dark:bg-error-900',
    text: 'text-error-700 dark:text-error-300',
  },
  gold: {
    bg: 'bg-gold-500 dark:bg-gold-600',
    light: 'bg-gold-100 dark:bg-gold-900',
    text: 'text-gold-700 dark:text-gold-300',
  },
};

const sizeConfig = {
  sm: { width: 60, strokeWidth: 4, fontSize: 12 },
  md: { width: 100, strokeWidth: 6, fontSize: 16 },
  lg: { width: 140, strokeWidth: 8, fontSize: 20 },
};

const CircularProgress: React.FC<AnimatedProgressProps> = ({
  value,
  maximum = 100,
  color = 'primary',
  size = 'md',
  showLabel = true,
  showPercentage = true,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min((value / maximum) * 100, 100);
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Background Circle */}
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
          style={{ position: 'absolute', inset: 0 }}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className={colorConfig[color].light}
          />
        </svg>

        {/* Progress Circle */}
        <motion.svg
          width={config.width}
          height={config.width}
          className={`transform -rotate-90 ${colorConfig[color].text}`}
          style={{ position: 'absolute', inset: 0 }}
          initial={false}
        >
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: animated ? 1 : 0,
              ease: 'easeInOut',
            }}
          />
        </motion.svg>

        {/* Center Content */}
        {showPercentage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`font-bold ${colorConfig[color].text}`}
              style={{ fontSize: `${config.fontSize}px` }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Math.round(percentage)}
              </motion.span>
              <span className="text-xs ml-0.5">%</span>
            </motion.div>
          </div>
        )}
      </div>

      {showLabel && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`mt-2 text-sm font-medium ${colorConfig[color].text}`}
        >
          Progress
        </motion.p>
      )}
    </div>
  );
};

const LinearProgress: React.FC<AnimatedProgressProps> = ({
  value,
  maximum = 100,
  color = 'primary',
  showLabel = true,
  showPercentage = true,
  animated = true,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min((value / maximum) * 100, 100);

  return (
    <div className={className}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-navy-700 dark:text-navy-300">Progress</span>
          {showPercentage && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold text-navy-900 dark:text-navy-100"
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Progress Bar Background */}
      <div className={`w-full h-2.5 rounded-full overflow-hidden ${colorConfig[color].light}`}>
        {/* Progress Fill */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: 'easeOut',
          }}
          className={`h-full rounded-full ${colorConfig[color].bg} transition-all ${
            striped ? 'bg-gradient-to-r from-transparent via-white to-transparent bg-200% animate-pulse' : ''
          }`}
        />
      </div>
    </div>
  );
};

const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  variant = 'linear',
  ...props
}) => {
  return variant === 'circular' ? (
    <CircularProgress {...props} />
  ) : (
    <LinearProgress {...props} />
  );
};

export default AnimatedProgress;
export { CircularProgress, LinearProgress };
