import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StudentAttendancePage: React.FC = () => {
  const { notifications, remove } = useNotifications();

  const attendance = [
    { course: 'Data Structures', present: 32, absent: 2, late: 1, percentage: 94 },
    { course: 'Web Development', present: 28, absent: 3, late: 2, percentage: 88 },
    { course: 'Database Design', present: 35, absent: 1, late: 0, percentage: 97 },
    { course: 'Algorithms', present: 30, absent: 4, late: 1, percentage: 86 },
  ];

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Clock size={32} className="text-blue-400" /> Attendance
            </h1>
            <p className="text-gray-400">Track your class attendance</p>
          </motion.div>

          {/* Overall Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Overall Attendance', value: '92%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
              { label: 'Classes Present', value: '125', icon: CheckCircle, color: 'from-blue-500 to-cyan-500' },
              { label: 'Classes Absent', value: '10', icon: AlertCircle, color: 'from-red-500 to-pink-500' },
              { label: 'Classes Late', value: '4', icon: Clock, color: 'from-yellow-500 to-orange-500' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-10 backdrop-blur`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                    </div>
                    <Icon size={32} className="opacity-20" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Attendance by Course */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {attendance.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{item.course}</h3>
                  <span className={`px-4 py-2 rounded-lg font-bold ${item.percentage >= 85 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {item.percentage}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Present</p>
                    <p className="text-2xl font-bold text-green-400">{item.present}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Absent</p>
                    <p className="text-2xl font-bold text-red-400">{item.absent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Late</p>
                    <p className="text-2xl font-bold text-yellow-400">{item.late}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentAttendancePage;
