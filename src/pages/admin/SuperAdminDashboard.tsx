import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Bell,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/app.constants';
import { useAuth } from '../../contexts/AuthContext';

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

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setLastUpdated(new Date().toLocaleString());

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const refreshInterval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    onClick,
    delay = 0
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: number;
    color: string;
    onClick: () => void;
    delay?: number;
  }) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
      const duration = 1200;
      const increment = value / (duration / 16);
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(interval);
    }, [value]);

    return (
      <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
        whileHover={{ scale: 1.06, y: -8 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-3xl p-8 transition-all duration-300 group cursor-pointer"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/60 to-slate-950/80 backdrop-blur-lg border border-white/[0.08]" />
        
        {/* Animated glow orbs */}
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: color.includes('blue') ? 'radial-gradient(circle, rgba(59,130,246,0.3), transparent)' : 
                              color.includes('green') ? 'radial-gradient(circle, rgba(34,197,94,0.3), transparent)' :
                              color.includes('purple') ? 'radial-gradient(circle, rgba(147,51,234,0.3), transparent)' :
                              color.includes('orange') ? 'radial-gradient(circle, rgba(249,115,22,0.3), transparent)' :
                              color.includes('indigo') ? 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)' :
                              color.includes('emerald') ? 'radial-gradient(circle, rgba(16,185,129,0.3), transparent)' :
                              'radial-gradient(circle, rgba(34,211,238,0.3), transparent)' }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 group-hover:text-white/80 transition-colors">{label}</p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.3 }}
                className="mt-4 flex items-baseline gap-2"
              >
                <p className="text-5xl font-black text-white drop-shadow-lg">{displayValue}</p>
                <div className={`text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm ${color}`}>
                  +12%
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`flex h-20 w-20 items-center justify-center rounded-2xl backdrop-blur-md border border-white/10 shadow-xl ${color.replace('text-', 'text-white/40 group-hover:text-').replace('border border-', 'border ').replace('bg-', 'bg-')} group-hover:scale-110 transition-transform`}
            >
              <Icon size={32} className="text-white/70 group-hover:text-white transition-colors" />
            </motion.div>
          </div>
          
          {/* Progress bar */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden"
            style={{ originX: 0 }}
          >
            <div className={`h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full`} style={{ width: `${(displayValue / (value * 1.2)) * 100}%` }} />
          </motion.div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      
      {/* Logout Button */}
      <motion.button
        onClick={logout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/40 text-red-300 hover:text-red-200 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-rose-500/30 hover:border-red-400/60 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:shadow-red-500/20 backdrop-blur-md"
      >
        <LogOut size={20} />
        <span className="hidden sm:inline">Logout</span>
      </motion.button>
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="relative mb-16 overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-slate-800/30 via-slate-900/50 to-slate-950/70 p-12 shadow-2xl backdrop-blur-xl"
        >
          {/* Animated gradient orbs */}
          <motion.div 
            animate={{ x: [-100, 100, -100], y: [0, 50, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-transparent blur-3xl"
          />
          <motion.div 
            animate={{ x: [100, -100, 100], y: [0, -50, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-transparent blur-3xl"
          />
          
          <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="max-w-3xl"
            >
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm uppercase tracking-[0.4em] text-cyan-300/90 font-bold"
              >
                Super Administrator
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-4 text-6xl lg:text-7xl font-black text-white drop-shadow-2xl bg-clip-text"
              >
                Dashboard Overview
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 text-lg leading-relaxed text-white/70 font-medium"
              >
                A beautiful, live admin dashboard with real-time metrics, approvals, courses, fees, and payment summaries.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="rounded-full border border-cyan-400/40 bg-cyan-500/10 backdrop-blur-md px-5 py-2.5 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 shadow-lg shadow-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                >
                  ✨ Live updates every 30s
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="rounded-full border border-violet-400/40 bg-violet-500/10 backdrop-blur-md px-5 py-2.5 text-xs font-bold uppercase tracking-[0.24em] text-violet-200 shadow-lg shadow-violet-500/10 hover:bg-violet-500/20 transition-colors"
                >
                  🎨 Animated insight cards
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Top info cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full lg:w-auto"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -4 }}
                className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 p-6 text-center shadow-2xl backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                <p className="relative text-xs font-bold text-cyan-300/80 uppercase tracking-wider">Refresh Rate</p>
                <motion.p 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative mt-4 text-3xl font-black text-cyan-200"
                >
                  Every 30s
                </motion.p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -4 }}
                className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-900/40 to-purple-900/40 p-6 text-center shadow-2xl backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
                <p className="relative text-xs font-bold text-violet-300/80 uppercase tracking-wider">Pending Items</p>
                <motion.p 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="relative mt-4 text-3xl font-black text-violet-200"
                >
                  {stats.pendingApprovals}
                </motion.p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -4 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 p-6 text-center shadow-2xl backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <p className="relative text-xs font-bold text-emerald-300/80 uppercase tracking-wider">Last Update</p>
                <motion.p 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="relative mt-4 text-sm font-black text-emerald-200 line-clamp-2"
                >
                  {lastUpdated ? lastUpdated.split(',')[0] : 'Just now'}
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Clock className="text-purple-400" size={40} />
            </div>
            <p className="text-gray-300 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-blue-900/30 border border-blue-500/30 text-blue-100"
                onClick={() => navigate('/admin/users')}
                delay={0.05}
              />
              <StatCard
                icon={Users}
                label="Students"
                value={stats.totalStudents}
                color="bg-green-900/30 border border-green-500/30 text-green-100"
                onClick={() => navigate('/admin/users')}
                delay={0.12}
              />
              <StatCard
                icon={BookOpen}
                label="Faculty"
                value={stats.totalFaculty}
                color="bg-purple-900/30 border border-purple-500/30 text-purple-100"
                onClick={() => navigate('/admin/users')}
                delay={0.18}
              />
              <StatCard
                icon={Clock}
                label="Pending Approvals"
                value={stats.pendingApprovals}
                color="bg-orange-900/30 border border-orange-500/30 text-orange-100"
                onClick={() => navigate('/admin/verify')}
                delay={0.24}
              />
            </motion.div>

            {/* Second Row Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <StatCard
                icon={BookOpen}
                label="Total Courses"
                value={stats.totalCourses}
                color="bg-indigo-900/30 border border-indigo-500/30 text-indigo-100"
                onClick={() => navigate('/admin/courses')}
                delay={0.1}
              />
              <StatCard
                icon={DollarSign}
                label="Total Fees"
                value={stats.totalFees}
                color="bg-emerald-900/30 border border-emerald-500/30 text-emerald-100"
                onClick={() => navigate('/admin/fees')}
                delay={0.16}
              />
              <StatCard
                icon={TrendingUp}
                label="Total Payments"
                value={stats.totalPayments}
                color="bg-cyan-900/30 border border-cyan-500/30 text-cyan-100"
                onClick={() => navigate('/admin/reports')}
                delay={0.22}
              />
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl mb-8 p-10 borders border-purple-500/30 before:absolute before:inset-x-0 before:-top-20 before:h-64 before:rounded-full before:bg-gradient-to-b before:from-violet-500/20 before:to-transparent before:blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 50%, rgba(34,211,238,0.05) 100%)',
                border: '1px solid rgba(139,92,246,0.2)'
              }}
            >
              <div className="absolute inset-0 backdrop-blur-xl" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity size={28} className="text-violet-400" />
                  </motion.div>
                  Quick Actions
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                  <motion.button
                    onClick={() => navigate('/admin/verify')}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-2xl px-6 py-6 text-white shadow-2xl transition-all duration-300 group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249,115,22,0.9) 0%, rgba(251,146,60,0.8) 100%)',
                      border: '1px solid rgba(251,146,60,0.4)'
                    }}
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                    />
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-orange-100/70 uppercase tracking-wider mb-2">Review Applications</p>
                      <p className="text-2xl font-black text-white">
                        👥 {stats.pendingApprovals} Pending
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/admin/users')}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-2xl px-6 py-6 text-white shadow-2xl transition-all duration-300 group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(96,165,250,0.8) 100%)',
                      border: '1px solid rgba(96,165,250,0.4)'
                    }}
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
                      className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                    />
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-blue-100/70 uppercase tracking-wider mb-2">Manage Users</p>
                      <p className="text-2xl font-black text-white">
                        👤 {stats.totalUsers} Total
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/admin/courses')}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-2xl px-6 py-6 text-white shadow-2xl transition-all duration-300 group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.8) 100%)',
                      border: '1px solid rgba(168,85,247,0.4)'
                    }}
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
                      className="absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                    />
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-purple-100/70 uppercase tracking-wider mb-2">Manage Courses</p>
                      <p className="text-2xl font-black text-white">
                        📚 {stats.totalCourses} Active
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/admin/fees')}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-2xl px-6 py-6 text-white shadow-2xl transition-all duration-300 group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(52,211,153,0.8) 100%)',
                      border: '1px solid rgba(52,211,153,0.4)'
                    }}
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.9 }}
                      className="absolute -left-6 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                    />
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-emerald-100/70 uppercase tracking-wider mb-2">Manage Fees</p>
                      <p className="text-2xl font-black text-white">
                        💰 {stats.totalFees} Total
                      </p>
                    </div>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>

            {/* System Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-purple-500/30"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <BarChart3 size={28} className="text-purple-400" />
                    </motion.div>
                    System Information
                  </h2>
                  <p className="text-purple-300/80 text-sm">Real-time database and API status</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <motion.div 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-5 rounded-lg border border-blue-400/40 hover:border-blue-400/80 transition-all backdrop-blur"
                  >
                    <p className="text-xs text-blue-300/70 uppercase tracking-widest font-semibold mb-2">Database Server</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-blue-100 group-hover:text-white transition-colors"
                    >
                      DESKTOP-83A2G7T\SQLEXPRESS
                    </motion.p>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="group bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-5 rounded-lg border border-emerald-400/40 hover:border-emerald-400/80 transition-all backdrop-blur"
                  >
                    <p className="text-xs text-emerald-300/70 uppercase tracking-widest font-semibold mb-2">Database Name</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-emerald-100 group-hover:text-white transition-colors"
                    >
                      university_db
                    </motion.p>
                    <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="group bg-gradient-to-br from-orange-500/20 to-yellow-500/10 p-5 rounded-lg border border-orange-400/40 hover:border-orange-400/80 transition-all backdrop-blur"
                  >
                    <p className="text-xs text-orange-300/70 uppercase tracking-widest font-semibold mb-2">API Endpoint</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-orange-100 group-hover:text-white transition-colors"
                    >
                      localhost:8000
                    </motion.p>
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="group bg-gradient-to-br from-pink-500/20 to-rose-500/10 p-5 rounded-lg border border-pink-400/40 hover:border-pink-400/80 transition-all backdrop-blur"
                  >
                    <p className="text-xs text-pink-300/70 uppercase tracking-widest font-semibold mb-2">Last Updated</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg font-bold text-pink-100 group-hover:text-white transition-colors"
                    >
                      {lastUpdated || new Date().toLocaleString()}
                    </motion.p>
                    <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

              {/* Notifications Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-12 relative overflow-hidden rounded-xl border border-blue-500/40 dark:border-blue-600/40 bg-gradient-to-br from-slate-900/80 via-blue-900/50 to-slate-900/80 p-8"
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
                </div>

                <div className="relative z-10">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mb-6"
                  >
                    <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Bell className="w-7 h-7 text-blue-300" />
                      </motion.div>
                      Payment Notifications
                    </h3>
                    <p className="text-blue-200/80 text-sm mt-2">
                      Real-time payment notifications from students. Only SuperAdmins can view payment activity.
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-blue-400/20"
                  >
                    {React.createElement(require('../../components/admin/AdminNotifications').default)}
                  </motion.div>
                </div>
              </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
