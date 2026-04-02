import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'wave',
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : '100%'),
  };

  return (
    <motion.div
      className={`
        bg-navy-200 dark:bg-navy-700
        ${variantClasses[variant]}
        ${animation === 'pulse' ? 'animate-pulse' : ''}
        ${animation === 'wave' ? 'animate-shimmer bg-gradient-to-r from-navy-200 via-navy-300 to-navy-200 dark:from-navy-700 dark:via-navy-600 dark:to-navy-700 bg-[length:200%_100%]' : ''}
        ${className}
      `}
      style={style}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <Skeleton variant="rectangular" height={192} className="mb-4 rounded-lg" />
    <Skeleton variant="text" width="60%" className="mb-2" />
    <Skeleton variant="text" width="100%" className="mb-2" />
    <Skeleton variant="text" width="80%" />
    <div className="flex gap-2 mt-4">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-navy-900 rounded-lg">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" className="mb-2" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {/* Header */}
    <div className="flex gap-4 p-4 bg-navy-100 dark:bg-navy-800 rounded-lg">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" width={`${100 / columns}%`} height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4 bg-white dark:bg-navy-900 rounded-lg">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
