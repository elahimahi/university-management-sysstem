import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-primary-dark hover:shadow-hover dark:bg-brand-accent dark:hover:bg-brand-accent-dark',
    secondary:
      'bg-surface-card text-text-primary hover:bg-gray-200 dark:bg-surface-darkCard dark:text-text-dark-primary dark:hover:bg-surface-darkElevated',
    outline:
      'border-2 border-brand-primary text-brand-primary hover:bg-blue-50 dark:border-brand-accent dark:text-brand-accent-light dark:hover:bg-opacity-10',
    ghost:
      'text-brand-primary hover:bg-blue-50 dark:text-brand-accent-light dark:hover:bg-opacity-10',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
