import React from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string | number
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-2 pr-10
              rounded-md
              border border-border-light dark:border-border-dark
              bg-surface-base dark:bg-surface-darkCard
              text-text-primary dark:text-text-dark-primary
              appearance-none
              transition-smooth
              focus-ring
              disabled:bg-gray-100 disabled:cursor-not-allowed
              cursor-pointer
              ${error ? 'border-semantic-error focus:ring-semantic-error' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
        </div>
        {error && (
          <p id={`${props.name}-error`} className="text-sm text-semantic-error mt-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
