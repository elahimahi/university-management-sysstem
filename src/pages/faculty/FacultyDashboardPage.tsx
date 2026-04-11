import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  BarChart3,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Calendar,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';
import PageTransition from '../../components/ui/PageTransition';
import StatsCard from '../../components/ui/StatsCard';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';

interface FacultyStats {
  totalCourses: number;
  totalStudents: number;
  pendingGrades: number;
  totalGradesSubmitted: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, remove, success, error: showError } = useNotifications();
  const [stats, setStats] = useState<FacultyStats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    totalGradesSubmitted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchFacultyStats();
    }
  }, [user]);

  const fetchFacultyStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/faculty/get_stats.php?faculty_id=${user?.id}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || {
          totalCourses: 0,
          totalStudents: 0,
          pendingGrades: 0,
          totalGradesSubmitted: 0,
        });
        setErrorMsg(null);
      } else {
        setErrorMsg(data.message || 'Failed to fetch stats');
        showError('Failed to load dashboard', { message: data.message });
      }
    } catch (err) {
      console.error('Error fetching faculty stats:', err);
      setErrorMsg('Network error');
      showError('Connection error', { message: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: BookOpen,
      label: 'My Courses',
      value: stats.totalCourses,
      color: 'primary',
      path: '/faculty/my-courses',
      description: 'Manage your courses',
    },
    {
      icon: Users,
      label: 'My Students',
      value: stats.totalStudents,
      color: 'success',
      path: '/faculty/my-students',
      description: 'View enrolled students',
    },
    {
      icon: ClipboardList,
      label: 'Pending Grades',
      value: stats.pendingGrades,
      color: 'warning',
      path: '/faculty/grades',
      description: 'Submit pending grades',
    },
    {
      icon: BarChart3,
      label: 'Grades Submitted',
      value: stats.totalGradesSubmitted,
      color: 'gold',
      path: '/faculty/grades',
      description: 'View submission history',
    },
  ];

  return (
    <PageTransition variant="fade">
      <NotificationContainer
        notifications={notifications}
        onClose={remove}
        position="top-right"
        maxNotifications={5}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                >
                  👨‍🏫 Faculty Portal
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-blue-200"
                >
                  Welcome, <span className="font-semibold">{user?.firstName}</span>! Manage your courses and students
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-4 rounded-lg border border-blue-400/30"
              >
                <Clock className="text-blue-300" size={20} />
                <div className="text-right">
                  <p className="text-sm text-blue-300 opacity-75">Current Time</p>
                  <p className="text-lg font-bold text-white">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: errorMsg ? 1 : 0, y: errorMsg ? 0 : 10 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            {errorMsg && (
              <div className="bg-error-500/20 border border-error-500/50 text-error-200 px-4 py-3 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                <AlertCircle size={20} />
                {errorMsg}
              </div>
            )}
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <BookOpen className="text-blue-400" size={50} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 mt-4 text-lg"
              >
                Loading your dashboard...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Stats Cards Grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(action.path)}
                      className="cursor-pointer"
                    >
                      <StatsCard
                        icon={<Icon className="w-6 h-6" />}
                        title={action.label}
                        value={action.value}
                        description={action.description}
                        color={action.color as any}
                        size="md"
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div 
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
                  >
                    <PlusCircle size={24} className="text-blue-400" />
                    Quick Actions
                  </motion.h2>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {[
                      { label: 'My Courses', icon: BookOpen, path: '/faculty/my-courses' },
                      { label: 'Mark Attendance', icon: Calendar, path: '/faculty/attendance' },
                      { label: 'Submit Grades', icon: CheckCircle, path: '/faculty/submit-grades' },
                      { label: 'View Reports', icon: BarChart3, path: '/faculty/reports' },
                      { label: 'My Students', icon: Users, path: '/faculty/my-students' },
                      { label: 'Assignments', icon: ClipboardList, path: '/faculty/assignments' },
                    ].map((action, idx) => {
                      const ActionIcon = action.icon;
                      return (
                        <motion.button
                          key={idx}
                          variants={itemVariants}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(action.path)}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600/60 to-blue-500/40 hover:from-blue-500/80 hover:to-blue-400/60 text-white font-semibold py-3 px-4 rounded-lg transition-all"
                        >
                          <ActionIcon size={18} />
                          {action.label}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Faculty Info Card */}
                <motion.div
                  variants={itemVariants}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award size={20} className="text-purple-400" />
                    Faculty Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-300 opacity-75">Name</p>
                      <p className="text-lg font-semibold text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 opacity-75">Email</p>
                      <p className="text-sm text-blue-300 break-all">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 opacity-75">Role</p>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mt-1 px-3 py-1 bg-purple-500/40 text-purple-200 rounded-full text-sm font-semibold"
                      >
                        {user?.role}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* System Status */}
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 rounded-lg p-6 backdrop-blur-sm"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle size={24} className="text-emerald-400" />
                  System Status
                </h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {[
                    { name: 'Backend API', status: 'Connected' },
                    { name: 'Database', status: 'Active' },
                    { name: 'Authentication', status: 'Verified' },
                  ].map((item, idx) => (
                    <motion.div key={idx} variants={itemVariants} transition={{ duration: 0.5 }} className="flex items-center justify-between">
                      <span className="text-gray-300 font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3 h-3 rounded-full bg-emerald-500"
                        />
                        <span className="text-sm font-semibold text-emerald-300">{item.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default FacultyDashboardPage;
