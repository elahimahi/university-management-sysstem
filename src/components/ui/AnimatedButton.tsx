import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';
type AnimationType = 'ripple' | 'glow' | 'gradient-pulse' | 'shake';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animationType?: AnimationType;
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animationType = 'ripple',
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (animationType === 'ripple') {
      // Create ripple effect
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);
    } else if (animationType === 'shake') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    onClick?.(e);
  };

  const baseStyles = 'relative overflow-hidden font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-500 shadow-soft hover:shadow-lg dark:bg-navy-700 dark:hover:bg-navy-600',
    secondary: 'bg-gold-500 text-navy-900 hover:bg-gold-600 focus:ring-gold-500 shadow-soft hover:shadow-glow',
    outline: 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white focus:ring-navy-500 dark:border-gold-500 dark:text-gold-500 dark:hover:bg-gold-500 dark:hover:text-navy-900',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-soft hover:shadow-lg',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-soft hover:shadow-lg',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { 
        scale: animationType === 'glow' ? 1.05 : 1.02,
      }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      animate={animationType === 'gradient-pulse' ? { 
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      } : animationType === 'shake' && isShaking ? {
        x: [0, -8, 8, -8, 8, 0],
      } : {}}
      transition={animationType === 'gradient-pulse' ? {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      } : animationType === 'shake' ? {
        duration: 0.5,
        ease: 'easeInOut',
      } : {}}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${
        animationType === 'glow' ? 'shadow-glow hover:shadow-glow-lg' : ''
      } ${
        animationType === 'gradient-pulse' ? 'bg-gradient-to-r from-navy-900 via-navy-700 to-navy-900 bg-200%' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effect */}
      {animationType === 'ripple' && ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute rounded-full bg-white"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Glow Effect */}
      {animationType === 'glow' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        />
      )}

      {/* Content */}
      {isLoading ? (
        <>
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;
