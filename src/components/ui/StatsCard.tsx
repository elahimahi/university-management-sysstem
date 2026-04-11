import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  color?: 'navy' | 'gold' | 'success' | 'warning' | 'error' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  suffix = '',
  prefix = '',
  icon,
  trend,
  color = 'navy',
  size = 'md',
  description,
}) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();

  const colorClasses = {
    navy: 'from-slate-600 via-navy-600 to-navy-800',
    gold: 'from-amber-500 via-yellow-500 to-orange-600',
    success: 'from-emerald-500 via-green-500 to-teal-600',
    warning: 'from-orange-500 via-amber-500 to-orange-700',
    error: 'from-red-500 via-rose-500 to-red-700',
    blue: 'from-blue-500 via-cyan-500 to-blue-700',
    purple: 'from-purple-500 via-indigo-500 to-purple-700',
  };

  const sizeClasses = {
    sm: { icon: 24, titleSize: 'text-sm', valueSize: 'text-2xl', padding: 'p-4' },
    md: { icon: 32, titleSize: 'text-base', valueSize: 'text-3xl', padding: 'p-6' },
    lg: { icon: 40, titleSize: 'text-lg', valueSize: 'text-4xl', padding: 'p-8' },
  };

  const sizeConfig = sizeClasses[size];

  useEffect(() => {
    controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.6, ease: 'easeInOut' },
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
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}
              style={{ fontSize: `${sizeConfig.icon}px` }}
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
            className={`flex items-center gap-2 ${sizeConfig.titleSize}`}
          >
            <span className={`flex items-center gap-1 font-semibold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {trend.isPositive ? (
                <TrendingUp size={16} strokeWidth={3} />
              ) : (
                <TrendingDown size={16} strokeWidth={3} />
              )}
              {trend.value}%
            </span>
            <span className="text-navy-500 dark:text-navy-400">vs last month</span>
          </motion.div>
        )}

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-navy-500 dark:text-navy-400 mt-2"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Card Border Animation */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </motion.div>
  );
};

export default StatsCard;
