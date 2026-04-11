import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  UserCog,
  DollarSign,
  BookOpen,
  BarChart3,
  LogOut,
  User,
  X,
  FileText,
  Database,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Bell,
  Key,
  Activity,
  LifeBuoy,
  Server,
  Lock,
  CreditCard,
  Plus,
  Search,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import StatsCard from '../../components/ui/StatsCard';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import FloatingBadge from '../../components/ui/FloatingBadge';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedInput from '../../components/ui/AnimatedInput';
import UserManagement from './UserManagement';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, remove, success, error: showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 1243,
    activeSessions: 87,
    pendingApprovals: 23,
    systemHealth: 99,
    totalCourses: 45,
    totalFees: 125000,
    pendingPayments: 34000,
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      success('Admin dashboard loaded successfully');
    }, 800);
  }, [success]);

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

  const adminStats = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'blue' as const,
      description: 'All system users',
    },
    {
      icon: UserCog,
      label: 'Active Sessions',
      value: stats.activeSessions,
      color: 'success' as const,
      description: 'Currently active',
    },
    {
      icon: AlertCircle,
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      color: 'warning' as const,
      description: 'Awaiting verification',
    },
    {
      icon: Server,
      label: 'System Health',
      value: `${stats.systemHealth}%`,
      color: 'gold' as const,
      description: 'Operating normally',
    },
  ];

  const adminTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Dashboard overview',
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User management',
    },
    {
      id: 'fees',
      label: 'Fees',
      icon: DollarSign,
      description: 'Fee management',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      description: 'Course management',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'System settings',
    },
  ];

  const quickActions = [
    { id: 1, label: 'Create User', icon: Plus, color: 'from-blue-600 to-cyan-600', path: '/admin/users' },
    { id: 2, label: 'New Fee', icon: Plus, color: 'from-emerald-600 to-teal-600', path: '/admin/fees' },
    { id: 3, label: 'Add Course', icon: Plus, color: 'from-purple-600 to-pink-600', path: '/admin/courses' },
    { id: 4, label: 'Verify Users', icon: CheckCircle, color: 'from-orange-600 to-red-600', path: '/admin/verify' },
    { id: 5, label: 'View Reports', icon: BarChart3, color: 'from-indigo-600 to-blue-600', path: '/admin/reports' },
    { id: 6, label: 'Database', icon: Database, color: 'from-cyan-600 to-blue-600', path: '/admin/database' },
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
                  ⚙️ Admin Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-blue-200"
                >
                  Manage university system, users, fees, and courses efficiently
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
                      {user?.role ? user.role.toUpperCase() : 'Admin'}
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
            <div className="space-y-6">
              <LoadingSkeleton type="card" count={4} height="h-32" />
              <LoadingSkeleton type="card" count={1} height="h-96" />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Stats Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {adminStats.map((stat, idx) => {
                  const IconComp = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <StatsCard
                        icon={<IconComp className="w-6 h-6" />}
                        title={stat.label}
                        value={typeof stat.value === 'string' ? parseInt(stat.value) : stat.value}
                        description={stat.description}
                        color={stat.color as any}
                        size="md"
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Tab Navigation */}
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm"
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-2"
                >
                  {adminTabs.map((tab, idx) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        variants={itemVariants}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700/50'
                        }`}
                      >
                        <TabIcon size={18} />
                        {tab.label}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'overview' && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      {/* Quick Actions */}
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
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                        >
                          {quickActions.map((action, idx) => {
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

                      {/* System Status */}
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
                            <motion.div
                              key={idx}
                              variants={itemVariants}
                              transition={{ duration: 0.5 }}
                              className="flex items-center justify-between"
                            >
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

                  {activeTab === 'users' && (
                    <motion.div
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg p-6"
                    >
                      <h3 className="text-2xl font-bold text-white mb-4">User Management</h3>
                      <UserManagement />
                    </motion.div>
                  )}

                  {activeTab === 'fees' && (
                    <motion.div
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-lg p-6"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                          <DollarSign className="text-emerald-400" size={24} />
                          Fees Management
                        </h3>
                        <p className="text-gray-300 mb-6">Manage student fees, create new fees, and track payments.</p>
                        <AnimatedButton
                          onClick={() => navigate('/admin/fees')}
                          rightIcon={<ArrowRight size={18} />}
                        >
                          Go to Fees Management
                        </AnimatedButton>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'courses' && (
                    <motion.div
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                          <BookOpen className="text-purple-400" size={24} />
                          Courses Management
                        </h3>
                        <p className="text-gray-300 mb-6">Create, manage, and organize academic courses.</p>
                        <AnimatedButton
                          onClick={() => navigate('/admin/courses')}
                          rightIcon={<ArrowRight size={18} />}
                        >
                          Go to Courses Management
                        </AnimatedButton>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      variants={itemVariants}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/30 rounded-lg p-6"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <Settings className="text-slate-400" size={24} />
                          System Settings
                        </h3>
                        <p className="text-gray-300 mb-6">Configure system settings and preferences.</p>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          <motion.div
                            variants={itemVariants}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/30"
                          >
                            <div>
                              <p className="font-semibold text-white">Theme</p>
                              <p className="text-sm text-gray-400">Dark mode enabled</p>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full" />
                          </motion.div>
                          <motion.div
                            variants={itemVariants}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600/30"
                          >
                            <div>
                              <p className="font-semibold text-white">Notifications</p>
                              <p className="text-sm text-gray-400">All notifications enabled</p>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
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
                    {user?.role ? user.role.toUpperCase() : 'Admin'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-gray-300 mb-6"
            >
              Are you sure you want to logout? You'll need to login again to access the admin dashboard.
            </motion.p>

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

export default AdminDashboard;
