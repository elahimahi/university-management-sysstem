import React from 'react'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children, className = '' }) => {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-blue-100 text-brand-primary dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-semantic-success dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-semantic-warning dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-semantic-error dark:bg-red-900 dark:text-red-200',
    info: 'bg-cyan-100 text-semantic-info dark:bg-cyan-900 dark:text-cyan-200',
    secondary: 'bg-gray-100 text-text-secondary dark:bg-gray-700 dark:text-gray-300',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
