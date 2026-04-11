import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, BarChart3, FileText, Settings, Clock, AlertCircle } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StudentGradesPage: React.FC = () => {
  const { notifications, remove } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const grades = [
    { course: 'Data Structures', grade: 'A', points: 4.0, semester: 'Fall 2024' },
    { course: 'Web Development', grade: 'A-', points: 3.7, semester: 'Fall 2024' },
    { course: 'Database Design', grade: 'B+', points: 3.3, semester: 'Spring 2025' },
    { course: 'Algorithms', grade: 'A', points: 4.0, semester: 'Spring 2025' },
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'from-green-500 to-emerald-500';
    if (grade.startsWith('B')) return 'from-blue-500 to-cyan-500';
    if (grade.startsWith('C')) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen size={32} className="text-yellow-400" /> My Grades
            </h1>
            <p className="text-gray-400">View your academic performance</p>
          </motion.div>

          {/* GPA Summary */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              { label: 'Current GPA', value: '3.75', color: 'from-green-500 to-emerald-500' },
              { label: 'Semester GPA', value: '3.85', color: 'from-blue-500 to-cyan-500' },
              { label: 'Credits Earned', value: '45', color: 'from-purple-500 to-pink-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-10 backdrop-blur`}
              >
                <p className="text-gray-400 mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </motion.div>
            ))}
          </motion.div>

          {/* Grades Table */}
          {loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {grades.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{item.course}</h3>
                      <p className="text-sm text-gray-400">{item.semester}</p>
                    </div>
                    <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getGradeColor(item.grade)} text-white font-black text-2xl`}>
                      {item.grade}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Grade Points</p>
                      <p className="text-2xl font-bold text-white">{item.points}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentGradesPage;
