import React, { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label: string;
  options: RadioOption[];
  name: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  radioSize?: 'sm' | 'md' | 'lg';
  value?: string;
  onChange?: (value: string) => void;
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      options,
      name,
      error,
      orientation = 'vertical',
      radioSize = 'md',
      value,
      onChange,
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
        <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-3">
          {label}
        </label>

        <div className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
        `}>
          {options.map((option, index) => (
            <label
              key={option.value}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                <input
                  ref={index === 0 ? ref : undefined}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="peer sr-only"
                  {...props}
                />
                
                {/* Custom Radio */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    ${sizeClasses[radioSize]}
                    ${error ? 'border-error-500' : 'border-navy-300 dark:border-navy-600'}
                    border-2 rounded-full transition-all
                    peer-checked:border-gold-500
                    peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                    peer-focus:ring-2 peer-focus:ring-gold-500 peer-focus:ring-offset-2
                    flex items-center justify-center
                  `}
                >
                  {/* Inner Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{
                      scale: value === option.value ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`
                      ${radioSize === 'sm' ? 'w-2 h-2' : radioSize === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
                      bg-gold-500 rounded-full
                    `}
                  />
                </motion.div>
              </div>

              <div className="flex-1">
                <span className={`
                  text-navy-900 dark:text-white font-medium
                  ${props.disabled ? 'opacity-50' : 'group-hover:text-gold-600'}
                  transition-colors
                `}>
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-navy-600 dark:text-navy-400 mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-error-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
