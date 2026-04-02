import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'outlined',
      inputSize = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const sizeClasses = {
      sm: 'h-9 text-sm',
      md: 'h-11 text-base',
      lg: 'h-13 text-lg',
    };

    const variantClasses = {
      outlined: 'bg-transparent border-2 border-navy-300 dark:border-navy-600 focus:border-gold-500 dark:focus:border-gold-500',
      filled: 'bg-navy-50 dark:bg-navy-800 border-b-2 border-navy-300 dark:border-navy-600 focus:border-gold-500 dark:focus:border-gold-500',
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <div className="relative">
          {/* Input */}
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500 dark:text-navy-400">
                {leftIcon}
              </div>
            )}
            
            <input
              ref={ref}
              className={`
                w-full ${sizeClasses[inputSize]} ${variantClasses[variant]}
                ${leftIcon ? 'pl-10' : 'pl-4'}
                ${rightIcon ? 'pr-10' : 'pr-4'}
                ${error ? 'border-error-500 focus:border-error-500' : ''}
                rounded-lg outline-none transition-all duration-200
                text-navy-900 dark:text-white
                placeholder-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder={label}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleChange}
              {...props}
            />

            {rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 dark:text-navy-400">
                {rightIcon}
              </div>
            )}

            {/* Floating Label */}
            <motion.label
              initial={false}
              animate={{
                top: isFocused || hasValue ? '0' : '50%',
                y: isFocused || hasValue ? '-50%' : '-50%',
                scale: isFocused || hasValue ? 0.85 : 1,
                color: error 
                  ? '#ef4444' 
                  : isFocused 
                    ? '#FFB347' 
                    : undefined,
              }}
              className={`
                absolute ${leftIcon ? 'left-10' : 'left-4'} 
                pointer-events-none origin-left
                transition-colors duration-200
                bg-white dark:bg-navy-900 px-1
                ${error ? 'text-error-500' : 'text-navy-600 dark:text-navy-400'}
              `}
            >
              {label} {props.required && <span className="text-error-500">*</span>}
            </motion.label>
          </div>

          {/* Helper Text / Error */}
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-1 text-sm ${error ? 'text-error-500' : 'text-navy-600 dark:text-navy-400'}`}
            >
              {error || helperText}
            </motion.p>
          )}
        </div>
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
