import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'text' | 'avatar' | 'mixed';
  height?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 1, type = 'card', height = 'h-20' }) => {
  const shimmerVariants = {
    animate: {
      backgroundPosition: ['200% 0%', '-200% 0%'],
    },
  };

  const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg';

  const renderSkeleton = () => {
    switch (type) {
      case 'avatar':
        return (
          <motion.div
            initial={{ backgroundPosition: '200% 0%' }}
            animate={{ backgroundPosition: '-200% 0%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={`${baseClasses} w-12 h-12 rounded-full`}
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        );

      case 'text':
        return (
          <motion.div 
            variants={shimmerVariants} 
            animate="animate" 
            className="space-y-3"
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`${baseClasses} h-4 ${i === count - 1 ? 'w-3/4' : 'w-full'}`}
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </motion.div>
        );

      case 'mixed':
        return (
          <motion.div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${baseClasses} ${height}`}
                style={{
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </motion.div>
        );

      default:
        return (
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            className="space-y-3"
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`${baseClasses} ${i === 0 ? 'h-32' : 'h-4'} ${i > 0 && i !== count - 1 ? '' : 'w-3/4'}`}
              />
            ))}
          </motion.div>
        );
    }
  };

  return <div>{renderSkeleton()}</div>;
};

export default LoadingSkeleton;
