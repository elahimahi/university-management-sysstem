import React from 'react';
import { motion } from 'framer-motion';
import FeaturedProgramsSection from '../components/features/FeaturedProgramsSection';

const ProgramsPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen bg-white dark:bg-navy-900 p-8"
  >
    <h1 className="text-3xl font-bold mb-4">Programs</h1>
    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">All academic programs offered by Encrypt University are listed below.</p>
    <FeaturedProgramsSection />
  </motion.div>
);

export default ProgramsPage;
