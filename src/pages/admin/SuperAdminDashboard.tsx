import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  CheckCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  Server,
  LogOut,
  User,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import { API_BASE_URL } from '../../constants/app.constants';
import PageTransition from '../../components/ui/PageTransition';
import StatsCard from '../../components/ui/StatsCard';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import FloatingBadge from '../../components/ui/FloatingBadge';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  pendingApprovals: number;
  totalFees: number;
  totalPayments: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
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

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, remove, success, error: showError } = useNotifications();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    totalFees: 0,
    totalPayments: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      await logout();
      success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      showError('Logout failed', { message: 'Could not log out. Please try again.' });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Fetch all stats in parallel
      const [usersRes, coursesRes, pendingRes, feesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/get_users_stats.php`),
        fetch(`${API_BASE_URL}/admin/get_courses_stats.php`),
        fetch(`${API_BASE_URL}/admin/get_pending_registrations.php`),
        fetch(`${API_BASE_URL}/admin/get_fees_stats.php`),
      ]);

      // Parse all responses with flexible typing
      const usersData = usersRes.ok ? (await usersRes.json()) as any : {};
      const coursesData = coursesRes.ok ? (await coursesRes.json()) as any : {};
      const pendingData = pendingRes.ok ? (await pendingRes.json()) as any : { users: [] };
      const feesData = feesRes.ok ? (await feesRes.json()) as any : {};

      setStats({
        totalUsers: usersData?.total || usersData?.totalUsers || 0,
        totalStudents: usersData?.students || usersData?.totalStudents || 0,
        totalFaculty: usersData?.faculty || usersData?.totalFaculty || 0,
        totalCourses: coursesData?.total || coursesData?.totalCourses || 0,
        pendingApprovals: pendingData?.users?.length || pendingData?.count || 0,
        totalFees: feesData?.totalFees || feesData?.total || 0,
        totalPayments: feesData?.paidFees || feesData?.payments || 0,
      });

      setErrorMsg(null);
      success('Dashboard loaded successfully');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMsg('Failed to load dashboard data');
      showError('Connection error', { message: 'Could not load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'blue' as const,
      path: '/admin/users',
      description: 'All registered users',
    },
    {
      icon: Users,
      label: 'Students',
      value: stats.totalStudents,
      color: 'success' as const,
      path: '/admin/users',
      description: 'Enrolled students',
    },
    {
      icon: BookOpen,
      label: 'Faculty',
      value: stats.totalFaculty,
      color: 'purple',
      path: '/admin/users',
      description: 'Teaching staff',
    },
    {
      icon: AlertCircle,
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      color: 'warning' as const,
      path: '/admin/verify',
      description: 'Awaiting verification',
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                >
                  👑 Super Admin Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-blue-200"
                >
                  System control center - Manage users, courses, fees, and system health
                </motion.p>
              </div>
              <div className="flex flex-col gap-3">
                {/* System Status */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-4 rounded-lg border border-blue-400/30"
                >
                  <Server className="text-blue-300" size={20} />
                  <div className="text-right">
                    <p className="text-sm text-blue-300 opacity-75">System Status</p>
                    <p className="text-lg font-bold text-white">All Systems Ready</p>
                  </div>
                </motion.div>

                {/* User Info & Logout */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-3 rounded-lg border border-emerald-400/30"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center">
                    <User className="text-emerald-300" size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-300 opacity-75">
                      {user?.role ? user.role.toUpperCase() : 'Super Admin'}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLogoutModal(true)}
                    className="ml-2 p-2 hover:bg-red-500/20 transition-colors rounded-lg text-red-400 hover:text-red-300"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <FloatingBadge
                label={`${stats.totalUsers} Users`}
                variant="primary"
                icon={<Users className="w-4 h-4" />}
              />
              {stats.pendingApprovals > 0 && (
                <FloatingBadge
                  label={`${stats.pendingApprovals} Pending`}
                  variant="warning"
                  icon={<AlertCircle className="w-4 h-4" />}
                />
              )}
              <FloatingBadge
                label={`${stats.totalCourses} Courses`}
                variant="gold"
                icon={<BookOpen className="w-4 h-4" />}
              />
            </motion.div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} type="card" count={1} height="h-32" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Main Stats Grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {dashboardStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(stat.path)}
                      className="cursor-pointer"
                    >
                      <StatsCard
                        icon={<Icon className="w-6 h-6" />}
                        title={stat.label}
                        value={stat.value}
                        description={stat.description}
                        color={stat.color as any}
                        size="md"
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Secondary Stats */}
              <motion.div 
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses, color: 'indigo', path: '/admin/courses' },
                  { icon: DollarSign, label: 'Total Fees', value: stats.totalFees, color: 'success', path: '/admin/fees' },
                  { icon: TrendingUp, label: 'Total Payments', value: stats.totalPayments, color: 'gold', path: '/admin/fees' },
                ].map((stat, idx) => {
                  const IconComp = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => navigate(stat.path)}
                      className="cursor-pointer"
                    >
                      <StatsCard
                        icon={<IconComp className="w-6 h-6" />}
                        title={stat.label}
                        value={stat.value}
                        color={stat.color as any}
                        size="md"
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Quick Actions Section */}
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm"
              >
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
                >
                  <Zap size={24} className="text-blue-400" />
                  Quick Actions
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6"
                >
                  {[
                    { label: 'User Management', path: '/admin/users', icon: Users, color: 'from-blue-600 to-cyan-600' },
                    { label: 'Course Management', path: '/admin/courses', icon: BookOpen, color: 'from-purple-600 to-pink-600' },
                    { label: 'Fees Management', path: '/admin/fees', icon: DollarSign, color: 'from-emerald-600 to-teal-600' },
                    { label: 'Verify Users', path: '/admin/verify', icon: CheckCircle, color: 'from-orange-600 to-red-600' },
                    { label: 'View Reports', path: '/admin/reports', icon: BarChart3, color: 'from-indigo-600 to-blue-600' },
                    { label: 'System Settings', path: '/admin/settings', icon: Shield, color: 'from-cyan-600 to-blue-600' },
                  ].map((action, idx) => {
                    const ActionIcon = action.icon;
                    return (
                      <motion.button
                        key={idx}
                        variants={itemVariants}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(action.path)}
                        className={`flex items-center gap-2 bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all`}
                      >
                        <ActionIcon size={18} />
                        {action.label}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>

              {/* System Status Section */}
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 rounded-lg p-6 backdrop-blur-sm"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield size={24} className="text-emerald-400" />
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

        {/* Logout Confirmation Modal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showLogoutModal ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${
            showLogoutModal ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          onClick={() => setShowLogoutModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={
              showLogoutModal
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.9, y: 20 }
            }
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-400/30 rounded-lg p-6 max-w-md w-full shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-2xl font-bold text-white flex items-center gap-2"
              >
                <LogOut className="text-red-400" size={24} />
                Logout Confirmation
              </motion.h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLogoutModal(false)}
                className="p-1 hover:bg-red-500/20 transition-colors rounded-lg text-gray-400 hover:text-red-400"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* User Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-slate-900/50 border border-blue-400/20 rounded-lg p-4 mb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Logged in as:</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center">
                  <User className="text-emerald-400" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.role ? user.role.toUpperCase() : 'Super Admin'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Confirmation Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-gray-300 mb-6"
            >
              Are you sure you want to logout from the admin dashboard? You'll need to login again to access this area.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/50 text-blue-300 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </motion.div>

            {/* Footer Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-xs text-gray-500 text-center mt-4 pt-4 border-t border-gray-700"
            >
              Your session will be securely terminated
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default SuperAdminDashboard;
