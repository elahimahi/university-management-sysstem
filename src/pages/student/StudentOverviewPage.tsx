import React from 'react';
import { motion } from 'framer-motion';

const StudentOverviewPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen bg-white dark:bg-navy-900 p-8"
  >
    <h1 className="text-3xl font-bold mb-4">Overview</h1>
    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Welcome to your student dashboard. Here you can see your academic summary and important updates.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div whileHover={{ scale: 1.03 }} className="rounded-xl shadow-lg bg-gradient-to-br from-primary-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-primary-100 dark:border-navy-700">
        <h2 className="text-xl font-semibold mb-2">GPA</h2>
        <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">--</p>
        <p className="text-md text-gray-600 dark:text-gray-300">Your current GPA</p>
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} className="rounded-xl shadow-lg bg-gradient-to-br from-gold-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-gold-100 dark:border-navy-700">
        <h2 className="text-xl font-semibold mb-2">Registered Courses</h2>
        <p className="text-3xl font-bold text-gold-700 dark:text-gold-300">--</p>
        <p className="text-md text-gray-600 dark:text-gray-300">Total courses this semester</p>
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-blue-100 dark:border-navy-700">
        <h2 className="text-xl font-semibold mb-2">Attendance</h2>
        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">--%</p>
        <p className="text-md text-gray-600 dark:text-gray-300">Attendance rate</p>
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} className="rounded-xl shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-purple-100 dark:border-navy-700">
        <h2 className="text-xl font-semibold mb-2">Outstanding Fees</h2>
        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">--</p>
        <p className="text-md text-gray-600 dark:text-gray-300">Fees due</p>
      </motion.div>
    </div>
  </motion.div>
);

export default StudentOverviewPage;
