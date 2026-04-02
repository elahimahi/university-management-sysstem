import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'navy' | 'gold' | 'success' | 'warning' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  suffix = '',
  prefix = '',
  icon,
  trend,
  color = 'navy',
}) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();

  const colorClasses = {
    navy: 'from-navy-500 to-navy-700',
    gold: 'from-gold-500 to-gold-700',
    success: 'from-success-500 to-success-700',
    warning: 'from-warning-500 to-warning-700',
    error: 'from-error-500 to-error-700',
  };

  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 },
    });

    // Counting animation
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.min(Math.round(increment * currentStep), value));
      } else {
        clearInterval(timer);
        setCount(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, controls]);

  return (
    <motion.div
      animate={controls}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="card relative overflow-hidden"
    >
      {/* Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`} />

      {/* Content */}
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-navy-600 dark:text-navy-400">{title}</p>
            <motion.div
              className="text-4xl font-display font-bold text-navy-900 dark:text-white mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {prefix}{count.toLocaleString()}{suffix}
            </motion.div>
          </div>
          
          {icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <span className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}>
              {trend.isPositive ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {trend.value}%
            </span>
            <span className="text-sm text-navy-600 dark:text-navy-400">vs last month</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
