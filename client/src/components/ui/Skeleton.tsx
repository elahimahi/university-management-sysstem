import React from 'react'

interface SkeletonProps {
  className?: string
  count?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className} ${i > 0 ? 'mt-3' : ''}`}
        />
      ))}
    </>
  )
}

interface SkeletonCardProps {
  count?: number
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface-card dark:bg-surface-darkCard rounded-lg p-6 border border-border-light dark:border-border-dark-dark ${i > 0 ? 'mt-4' : ''}`}
        >
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-3" count={3} />
        </div>
      ))}
    </>
  )
}
