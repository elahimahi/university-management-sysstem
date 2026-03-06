import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  color = 'primary',
}) => {
  const iconColors = {
    primary: 'text-brand-primary dark:text-brand-accent-light',
    accent: 'text-brand-accent dark:text-brand-accent-light',
    success: 'text-semantic-success dark:text-green-400',
    warning: 'text-semantic-warning dark:text-yellow-400',
    error: 'text-semantic-error dark:text-red-400',
  }

  return (
    <div
      className={`
        bg-surface-card dark:bg-surface-darkCard
        rounded-lg
        p-6
        border border-border-light dark:border-border-dark-dark
        shadow-sm
        transition-smooth
        hover:shadow-md hover:-translate-y-1
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary dark:text-text-dark-secondary text-sm font-medium mb-2">
            {label}
          </p>
          <h3 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            {value}
          </h3>
          {change && (
            <p
              className={`text-sm ${
                change.trend === 'up' ? 'text-semantic-success' : 'text-semantic-error'
              }`}
            >
              {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}% from last period
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-20 ${iconColors[color]}`}>
          {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement, {
            className: `w-6 h-6 ${iconColors[color]}`,
          })}
        </div>
      </div>
    </div>
  )
}
