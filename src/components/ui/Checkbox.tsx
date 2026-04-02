import React, { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  description?: string;
  error?: string;
  checkboxSize?: 'sm' | 'md' | 'lg';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      checkboxSize = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className={className}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            
            {/* Custom Checkbox */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                ${sizeClasses[checkboxSize]}
                ${error ? 'border-error-500' : 'border-navy-300 dark:border-navy-600'}
                border-2 rounded-md transition-all
                peer-checked:bg-gold-500 peer-checked:border-gold-500
                peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                peer-focus:ring-2 peer-focus:ring-gold-500 peer-focus:ring-offset-2
                flex items-center justify-center
              `}
            >
              {/* Checkmark */}
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: props.checked ? 1 : 0,
                  opacity: props.checked ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
          </div>

          <div className="flex-1">
            <span className={`
              text-navy-900 dark:text-white font-medium
              ${props.disabled ? 'opacity-50' : 'group-hover:text-gold-600'}
              transition-colors
            `}>
              {label}
            </span>
            {description && (
              <p className="text-sm text-navy-600 dark:text-navy-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </label>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 ml-8 text-sm text-error-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
