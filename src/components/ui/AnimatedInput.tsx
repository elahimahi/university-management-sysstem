import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

type InputType = 'text' | 'email' | 'password' | 'number' | 'search';
type InputSize = 'sm' | 'md' | 'lg';

interface AnimatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  placeholder?: string;
  type?: InputType;
  size?: InputSize;
  error?: string;
  success?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  (
    {
      label,
      placeholder,
      type = 'text',
      size = 'md',
      error,
      success,
      showCharCount,
      maxLength,
      leftIcon,
      rightIcon,
      onChange,
      className = '',
      value = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const charCount = String(value).length;

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const labelSizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    const hasValue = value && String(value).length > 0;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        <div className="relative">
          {/* Background */}
          <motion.div
            initial={false}
            animate={{
              backgroundColor: isFocused
                ? 'rgb(var(--color-navy-50))'
                : 'rgb(var(--color-navy-100))',
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-lg"
          />

          {/* Border */}
          <motion.div
            initial={false}
            animate={{
              borderColor: error
                ? 'rgb(var(--color-error-500))'
                : success
                ? 'rgb(var(--color-success-500))'
                : isFocused
                ? 'rgb(var(--color-navy-900))'
                : 'rgb(var(--color-navy-200))',
              boxShadow: isFocused
                ? '0 0 0 3px rgba(14, 16, 48, 0.1)'
                : 'none',
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-lg border-2 pointer-events-none"
          />

          {/* Left Icon Container */}
          {leftIcon && (
            <motion.div
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-navy-600 dark:text-navy-400"
              animate={{
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {leftIcon}
            </motion.div>
          )}

          {/* Animated Label */}
          {label && (
            <motion.label
              animate={{
                scale: isFocused || hasValue ? 0.85 : 1,
                y: isFocused || hasValue ? -24 : 0,
                x: leftIcon ? 8 : 0,
              }}
              transition={{ duration: 0.2 }}
              className={`absolute left-4 origin-left pointer-events-none font-medium transition-colors ${
                isFocused || hasValue ? 'text-navy-900 dark:text-navy-100' : 'text-navy-600 dark:text-navy-400'
              } ${labelSizeStyles[size]}`}
            >
              {label}
            </motion.label>
          )}

          {/* Input */}
          <input
            ref={(el) => {
              if (ref) {
                if (typeof ref === 'function') ref(el);
                else ref.current = el;
              }
              inputRef.current = el;
            }}
            type={inputType}
            placeholder={isFocused ? placeholder : ''}
            value={value}
            maxLength={maxLength}
            disabled={disabled}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`relative w-full rounded-lg border-0 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${
              leftIcon ? 'pl-10' : ''
            } ${error ? 'text-error-600 dark:text-error-400' : 'text-navy-900 dark:text-navy-100'} placeholder:-text-navy-400 dark:placeholder:text-navy-500 bg-transparent ${className}`}
            {...props}
          />

          {/* Right Icon / Password Toggle / Success Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {success && !error && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-success-500 dark:text-success-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            {isPassword && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPassword(!showPassword)}
                className="text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-navy-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            )}

            {rightIcon && !isPassword && (
              <motion.div
                animate={{
                  scale: isFocused ? 1.1 : 1,
                }}
                className="text-navy-600 dark:text-navy-400"
              >
                {rightIcon}
              </motion.div>
            )}
          </div>
        </div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: error ? 1 : 0, y: error ? 0 : -10 }}
          transition={{ duration: 0.2 }}
          className="h-5 mt-1 text-sm text-error-600 dark:text-error-400 font-medium"
        >
          {error}
        </motion.div>

        {/* Character Count */}
        {showCharCount && maxLength && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end mt-1"
          >
            <span className="text-xs text-navy-600 dark:text-navy-400">
              {charCount} / {maxLength}
            </span>
          </motion.div>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
