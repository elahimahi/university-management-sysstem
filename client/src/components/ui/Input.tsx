import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startIcon, endIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {startIcon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">{startIcon}</div>}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2
              rounded-md
              border border-border-light dark:border-border-dark
              bg-surface-base dark:bg-surface-darkCard
              text-text-primary dark:text-text-dark-primary
              placeholder-text-muted dark:placeholder-text-dark-muted
              transition-smooth
              focus-ring
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${startIcon ? 'pl-10' : ''}
              ${endIcon ? 'pr-10' : ''}
              ${error ? 'border-semantic-error focus:ring-semantic-error' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
            {...props}
          />
          {endIcon && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">{endIcon}</div>}
        </div>
        {error && (
          <p id={`${props.name}-error`} className="text-sm text-semantic-error mt-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
