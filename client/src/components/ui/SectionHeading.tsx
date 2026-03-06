import React from 'react'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-text-secondary dark:text-text-dark-secondary">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
