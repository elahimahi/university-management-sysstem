import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'gold' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface FloatingBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  showOnHover?: boolean;
  floating?: boolean;
  useParallax?: boolean;
  className?: string;
}

const badgeConfig = {
  primary: {
    bg: 'bg-navy-900 dark:bg-navy-700',
    text: 'text-white',
  },
  success: {
    bg: 'bg-success-500 dark:bg-success-600',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-warning-500 dark:bg-warning-600',
    text: 'text-white',
  },
  error: {
    bg: 'bg-error-500 dark:bg-error-600',
    text: 'text-white',
  },
  gold: {
    bg: 'bg-gold-500 dark:bg-gold-600',
    text: 'text-navy-900 dark:text-navy-100',
  },
  info: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-white',
  },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  showOnHover = false,
  floating = true,
  useParallax = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(!showOnHover);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!useParallax) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [useParallax]);

  return (
    <motion.div
      initial={{ opacity: 0, y: floating ? 20 : 0 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => showOnHover && setIsVisible(true)}
      onMouseLeave={() => showOnHover && setIsVisible(false)}
      className={`inline-flex items-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all ${
        badgeConfig[variant].bg
      } ${badgeConfig[variant].text} shadow-lg ${sizeConfig[size]} ${className}`}
      style={
        useParallax
          ? { transform: `translateY(${scrollY * 0.1}px)` }
          : {}
      }
    >
      {icon && (
        <motion.span
          animate={floating ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {icon}
        </motion.span>
      )}
      <span>{label}</span>

      {/* Floating pulse effect */}
      {floating && (
        <motion.div
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`absolute inset-0 rounded-full ${badgeConfig[variant].bg}`}
          style={{ pointerEvents: 'none', zIndex: -1 }}
        />
      )}
    </motion.div>
  );
};

export default FloatingBadge;
