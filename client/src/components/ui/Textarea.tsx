import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            {label}
            {props.required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}
        <textarea
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
            resize-vertical
            ${error ? 'border-semantic-error focus:ring-semantic-error' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />
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

Textarea.displayName = 'Textarea'
