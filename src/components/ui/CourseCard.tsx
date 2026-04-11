import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Bookmark } from 'lucide-react';

interface CourseCardProps {
  title: string;
  code: string;
  instructor: string;
  duration: string;
  students: number;
  image?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  onClick?: () => void;
  status?: 'active' | 'completed' | 'upcoming';
  progress?: number; // 0-100
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
  status = 'active',
  progress = 0,
}) => {
  const levelColors = {
    Beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  };

  const statusColors = {
    active: 'border-emerald-500/50 bg-emerald-500/5',
    completed: 'border-slate-500/50 bg-slate-500/5',
    upcoming: 'border-blue-500/50 bg-blue-500/5',
  };

  const statusBadgeColors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    completed: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -10 }}
      whileTap={{ scale: 0.98 }}
      className={`card-hover cursor-pointer group relative overflow-hidden border-2 ${statusColors[status]}`}
      onClick={onClick}
      layout
    >
      {/* Animated background gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image Section */}
      <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-slate-600 to-navy-800">
        {image ? (
          <motion.img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
            <BookOpen size={64} className="text-white/30" />
          </div>
        )}
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Level Badge */}
        <motion.div 
          className="absolute top-3 right-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${levelColors[level]}`}>
            {level}
          </span>
        </motion.div>

        {/* Status Badge */}
        <motion.div 
          className="absolute top-3 left-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
        >
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm capitalize ${statusBadgeColors[status]}`}>
            {status}
          </span>
        </motion.div>

        {/* Course Code */}
        <div className="absolute bottom-3 left-3 bg-navy-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg">
          <span className="text-xs font-bold text-white">{code}</span>
        </div>
      </div>

      {/* Content Section */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Title */}
        <motion.h3 
          className="font-bold text-lg text-navy-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          whileHover={{ x: 5 }}
        >
          {title}
        </motion.h3>

        {/* Instructor */}
        <motion.p 
          className="text-sm text-navy-600 dark:text-navy-300 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-blue-500">👨‍🏫</span> {instructor}
        </motion.p>

        {/* Progress Bar */}
        {status === 'active' && (
          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-600 dark:text-navy-400">Progress</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-navy-200 dark:bg-navy-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div 
          className="flex items-center justify-between pt-3 border-t border-navy-200 dark:border-navy-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4 text-xs text-navy-600 dark:text-navy-400">
            <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Users size={14} strokeWidth={3} />
              <span>{students}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Clock size={14} strokeWidth={3} />
              <span>{duration}</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors"
          >
            <Bookmark size={16} className="group-hover:fill-current" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CourseCard;
