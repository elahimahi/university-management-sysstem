import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, BarChart3, FileText, LogOut, Bell, BarChart2, FileTextIcon, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  pendingGrades: number;
  submittedGrades: number;
}

const FacultyDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    submittedGrades: 0,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;

        const response = await apiService.get(`/faculty/get_stats.php?faculty_id=${user.id}`) as any;
        
        // Handle both response structures
        const data = response?.data?.stats || response?.data?.data;
        
        if (data) {
          setStats({
            totalCourses: data.totalCourses || 0,
            totalStudents: data.totalStudents || 0,
            pendingGrades: data.pendingGrades || 0,
            submittedGrades: data.totalGradesSubmitted || data.submittedGrades || 0,
          });
        }
        showSuccess('Dashboard loaded successfully');
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use fallback data on error
        setStats({
          totalCourses: 4,
          totalStudents: 142,
          pendingGrades: 23,
          submittedGrades: 12,
        });
        showError('Using sample data - Backend unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, showSuccess, showError]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to logout');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <BarChart3 size={20} />, href: '/faculty/dashboard' },
    { label: 'Courses', icon: <BookOpen size={20} />, href: '/faculty/courses' },
    { label: 'Students', icon: <Users size={20} />, href: '/faculty/students' },
    { label: 'Grades', icon: <FileText size={20} />, href: '/faculty/grades' },
  ];

  const statsData = [
    { label: 'Courses Teaching', value: stats.totalCourses, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Students', value: stats.totalStudents, color: 'from-emerald-500 to-teal-500' },
    { label: 'Pending Grades', value: stats.pendingGrades, color: 'from-orange-500 to-red-500' },
    { label: 'Assignments', value: stats.submittedGrades, color: 'from-purple-500 to-pink-500' },
  ];

  // Quick actions with routes
  const quickActions = [
    { label: 'Upload Grades', icon: '📊', onClick: () => navigate('/faculty/grades'), description: 'Submit grade scores' },
    { label: 'View Students', icon: '👥', onClick: () => navigate('/faculty/students'), description: 'Manage student records' },
    { label: 'Post Assignment', icon: '📝', onClick: () => navigate('/faculty/assignments'), description: 'Create assignments' },
    { label: 'Send Message', icon: '💬', onClick: () => navigate('/faculty/messages'), description: 'Message students' },
  ];

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white">
        <Navbar
          items={[]}
          rightContent={
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.1 }} className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </motion.button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-400 hover:text-red-300"
                  title="Logout"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            </div>
          }
        />

        <div className="flex pt-16">
          <Sidebar
            items={menuItems}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          <main className={`flex-1 transition-all duration-300 p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-7xl mx-auto"
            >
              <motion.h1 variants={itemVariants} className="text-5xl font-bold text-white mb-8">
                Welcome Back, Prof. {user?.lastName}! 📚
              </motion.h1>

              {/* Stats Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
              >
                {statsData.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-10 backdrop-blur hover:border-white/20 transition-all`}
                  >
                    <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                    <h3 className="text-4xl font-bold text-white">{loading ? '...' : stat.value}</h3>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.onClick}
                      className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all text-center group"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{action.icon}</div>
                      <p className="text-white font-semibold">{action.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {['Grades uploaded for Data Structures', 'Assignment submissions reviewed', 'New student enrollment confirmed'].map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <p className="text-white">{activity}</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </main>
        </div>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${
                showLogoutModal ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              onClick={() => setShowLogoutModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: showLogoutModal ? 1 : 0.95, opacity: showLogoutModal ? 1 : 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <LogOut className="text-red-400" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">Logout Confirmation</h3>
                <p className="text-gray-400 text-center mb-6">
                  Are you sure you want to logout? You'll need to log in again to access your dashboard.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-semibold"
                  >
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default FacultyDashboard;
