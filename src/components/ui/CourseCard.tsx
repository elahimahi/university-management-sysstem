import React from 'react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  title: string;
  code: string;
  instructor: string;
  duration: string;
  students: number;
  image?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  code,
  instructor,
  duration,
  students,
  image,
  level = 'Beginner',
  onClick,
}) => {
  const levelColors = {
    Beginner: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-100',
    Intermediate: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-100',
    Advanced: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-100',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="card-hover cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gradient-university">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl text-gold-500">📚</span>
          </div>
        )}
        
        {/* Level Badge */}
        <div className="absolute top-3 right-3">
          <span className={`badge ${levelColors[level]}`}>{level}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-navy-600 dark:text-navy-400 font-semibold">{code}</p>
          <h3 className="text-xl font-display font-bold text-navy-900 dark:text-white group-hover:text-gold-600 transition-colors">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{instructor}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-navy-200 dark:border-navy-700">
          <div className="flex items-center gap-1 text-sm text-navy-600 dark:text-navy-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-navy-600 dark:text-navy-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{students}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
