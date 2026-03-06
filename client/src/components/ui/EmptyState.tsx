import React from 'react'
import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <InboxIcon className="w-12 h-12" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-text-secondary dark:text-text-dark-secondary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-secondary dark:text-text-dark-secondary mb-6 max-w-sm text-center">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
