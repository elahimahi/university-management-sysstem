import React, { forwardRef, SelectHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  options: Option[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  selectSize?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      fullWidth = false,
      selectSize = 'md',
      searchable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState(props.value || '');

    const sizeClasses = {
      sm: 'h-9 text-sm',
      md: 'h-11 text-base',
      lg: 'h-13 text-lg',
    };

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === selectedValue);

    const handleSelect = (value: string) => {
      setSelectedValue(value);
      setIsOpen(false);
      setSearchTerm('');
      
      // Trigger onChange event
      const event = {
        target: { value },
      } as React.ChangeEvent<HTMLSelectElement>;
      props.onChange?.(event);
    };

    if (searchable) {
      return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className} relative`}>
          {/* Label */}
          <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">
            {label} {props.required && <span className="text-error-500">*</span>}
          </label>

          {/* Custom Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`
                w-full ${sizeClasses[selectSize]}
                ${error ? 'border-error-500' : 'border-navy-300 dark:border-navy-600 focus:border-gold-500'}
                border-2 rounded-lg px-4 pr-10
                text-left bg-white dark:bg-navy-900
                text-navy-900 dark:text-white
                outline-none transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              disabled={props.disabled}
            >
              {selectedOption?.label || 'Select an option'}
            </button>

            {/* Dropdown Icon */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-navy-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white dark:bg-navy-800 border-2 border-navy-200 dark:border-navy-700 rounded-lg shadow-xl max-h-60 overflow-hidden"
                >
                  {/* Search Input */}
                  <div className="p-2 border-b border-navy-200 dark:border-navy-700">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-navy-50 dark:bg-navy-900 border border-navy-300 dark:border-navy-600 text-navy-900 dark:text-white outline-none focus:border-gold-500"
                      autoFocus
                    />
                  </div>

                  {/* Options List */}
                  <div className="overflow-y-auto max-h-48">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          whileHover={{ backgroundColor: 'rgba(255, 179, 71, 0.1)' }}
                          className={`
                            w-full px-4 py-2 text-left transition-colors
                            ${selectedValue === option.value ? 'bg-gold-100 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400' : 'text-navy-900 dark:text-white'}
                          `}
                        >
                          {option.label}
                        </motion.button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-navy-600 dark:text-navy-400">
                        No options found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
      );
    }

    // Standard select
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">
          {label} {props.required && <span className="text-error-500">*</span>}
        </label>

        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full ${sizeClasses[selectSize]}
              ${error ? 'border-error-500' : 'border-navy-300 dark:border-navy-600 focus:border-gold-500'}
              border-2 rounded-lg px-4 pr-10
              bg-white dark:bg-navy-900
              text-navy-900 dark:text-white
              outline-none transition-all duration-200
              appearance-none cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-navy-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

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
    );
  }
);

Select.displayName = 'Select';

export default Select;
