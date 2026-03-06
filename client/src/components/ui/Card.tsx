import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverable?: boolean
  clickable?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  clickable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        bg-surface-card dark:bg-surface-darkCard
        rounded-lg
        shadow-sm dark:shadow-base
        border border-border-light dark:border-border-dark-dark
        transition-smooth
        ${hoverable ? 'hover:shadow-md hover:-translate-y-1' : ''}
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-border-light dark:border-border-dark-dark ${className}`}>
    {children}
  </div>
)

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div
    className={`px-6 py-4 border-t border-border-light dark:border-border-dark-dark flex gap-3 justify-end ${className}`}
  >
    {children}
  </div>
)
