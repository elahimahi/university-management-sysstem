import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, BookOpen, Award, Calendar } from 'lucide-react';

interface StudentProfileCardProps {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  studentId?: string;
  gpa?: number;
  enrollmentYear?: number;
  major?: string;
  photoUrl?: string;
  joinDate?: string;
}

const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  firstName,
  lastName,
  email,
  phone,
  studentId,
  gpa = 0,
  enrollmentYear = new Date().getFullYear(),
  major = 'Engineering',
  photoUrl,
  joinDate,
}) => {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const currentYear = new Date().getFullYear();
  const yearsEnrolled = currentYear - enrollmentYear + 1;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-blue-200/30 dark:border-blue-400/20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-10 -mr-20 -mt-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-300 to-blue-300 rounded-full opacity-10 -ml-20 -mb-20 blur-3xl" />

      <div className="relative">
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex items-start justify-between mb-8"
        >
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${firstName} ${lastName}`}
                  className="w-24 h-24 rounded-xl object-cover border-4 border-blue-200/50 dark:border-blue-400/30 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 flex items-center justify-center border-4 border-blue-200/50 dark:border-blue-400/30 shadow-lg">
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
              )}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
              />
            </motion.div>

            {/* Name & Status */}
            <div>
              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold text-slate-900 dark:text-white"
              >
                {firstName} {lastName}
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1"
              >
                <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
                {major}
              </motion.p>
            </div>
          </div>

          {/* GPA Badge */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-400/20"
          >
            <Award size={24} className="text-blue-600 dark:text-blue-400" />
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{gpa.toFixed(2)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">GPA</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-500 to-transparent mb-6"
        />

        {/* Info Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {/* Student ID */}
          {studentId && (
            <motion.div variants={itemVariants} className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Student ID
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{studentId}</p>
            </motion.div>
          )}

          {/* Email */}
          {email && (
            <motion.div variants={itemVariants} className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Mail size={12} /> Email
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{email}</p>
            </motion.div>
          )}

          {/* Phone */}
          {phone && (
            <motion.div variants={itemVariants} className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Phone size={12} /> Phone
              </p>
              <p className="text-sm text-slate-900 dark:text-white">{phone}</p>
            </motion.div>
          )}

          {/* Years Enrolled */}
          <motion.div variants={itemVariants} className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={12} /> Enrollment
            </p>
            <p className="text-sm text-slate-900 dark:text-white">{yearsEnrolled} year(s)</p>
          </motion.div>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-400/20"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Active Student • Good Standing</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentProfileCard;
