
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import StatsCard from '../../components/ui/StatsCard';
import Tabs from '../../components/ui/Tabs';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { API_BASE_URL } from '../../constants/app.constants';
import { UserCog, Database, Settings, Users, BookOpen, BarChart2, ShieldCheck, FileText, RefreshCw, Bell, Key, Activity, LifeBuoy, Server, Lock, DollarSign, ArrowRight, CreditCard } from 'lucide-react';
import UserManagement from './UserManagement';


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('users');
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    pendingApprovals: 0,
    totalCourses: 0,
    totalFees: 0,
    totalPayments: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError(null);

        const [usersRes, coursesRes, pendingRes, feesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/get_users_stats.php`),
          fetch(`${API_BASE_URL}/admin/get_courses_stats.php`),
          fetch(`${API_BASE_URL}/admin/get_pending_registrations.php`),
          fetch(`${API_BASE_URL}/admin/get_fees_stats.php`),
        ]);

        const usersData = usersRes.ok ? (await usersRes.json()) as any : {};
        const coursesData = coursesRes.ok ? (await coursesRes.json()) as any : {};
        const pendingData = pendingRes.ok ? (await pendingRes.json()) as any : { users: [] };
        const feesData = feesRes.ok ? (await feesRes.json()) as any : {};

        setStatsData({
          totalUsers: usersData?.total || usersData?.totalUsers || 0,
          totalStudents: usersData?.students || usersData?.totalStudents || 0,
          totalFaculty: usersData?.faculty || usersData?.totalFaculty || 0,
          pendingApprovals: pendingData?.count || pendingData?.users?.length || 0,
          totalCourses: coursesData?.total || coursesData?.totalCourses || 0,
          totalFees: feesData?.totalFees || feesData?.total || 0,
          totalPayments: feesData?.paidFees || feesData?.payments || 0,
        });
      } catch (error) {
        console.error('Dashboard load failed', error);
        setDashboardError('Unable to load dashboard metrics.');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats: import('../../components/ui/StatsCard').StatsCardProps[] = [
    { title: 'Total Users', value: statsData.totalUsers, icon: <Users />, color: 'gold' },
    { title: 'Students', value: statsData.totalStudents, icon: <UserCog />, color: 'success' },
    { title: 'Faculty', value: statsData.totalFaculty, icon: <BookOpen />, color: 'navy' },
    { title: 'Pending Approvals', value: statsData.pendingApprovals, icon: <Bell />, color: 'warning' },
    { title: 'Total Courses', value: statsData.totalCourses, icon: <Database />, color: 'gold' },
    { title: 'Total Fees', value: statsData.totalFees, icon: <DollarSign />, color: 'success' },
    { title: 'Total Payments', value: statsData.totalPayments, icon: <CreditCard />, color: 'error' },
  ];

  // Example tabs for admin features
  const adminTabs = [
    {
      id: 'users',
      label: 'User Management',
      icon: <Users />,
      content: <UserManagement />,
    },
    {
      id: 'fees',
      label: 'Fees Management',
      icon: <DollarSign />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><DollarSign className="inline-block w-6 h-6 text-green-500 animate-pulse" /> Fees Management</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Manage student fees, create new fees, track payments, and view collection statistics.</p>
          <Link to="/admin/fees">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-green-500/20 transition-all"
            >
              <DollarSign className="w-5 h-5" />
              Go to Fees Management
            </motion.button>
          </Link>
        </div>
      ),
    },
    {
      id: 'payments',
      label: 'Payment Records',
      icon: <CreditCard />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><CreditCard className="inline-block w-6 h-6 text-indigo-500 animate-pulse" /> Payment Records</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">View all payment transactions stored in SQL Server database.</p>
          <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 border border-indigo-500/20 p-6 shadow-lg">
            {React.createElement(require('../../components/PaymentsViewer').default)}
          </div>
        </div>
      ),
    },
    {
      id: 'database',
      label: 'Database Editor',
      icon: <Database />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Database className="inline-block w-6 h-6 text-blue-500 animate-spin-slow" /> Database Editor</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Full access to view, edit, and manage all database tables and records.</p>
          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/20 p-6 shadow-lg">
            {React.createElement(require('../DatabaseViewer').default)}
          </div>
        </div>
      ),
    },
    {
      id: 'logs',
      label: 'SMS Logs',
      icon: <FileText />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FileText className="inline-block w-6 h-6 text-orange-500 animate-pulse" /> SMS Logs</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Monitor SMS notifications and payment confirmations.</p>
          <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-700/20 border border-orange-500/20 p-6 shadow-lg">
            {React.createElement(require('../../components/SMSLogsViewer').default)}
          </div>
        </div>
      ),
    },
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: <RefreshCw />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><RefreshCw className="inline-block w-6 h-6 text-cyan-500 animate-spin" /> Backup & Restore</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Backup and restore the database with progress animations.</p>
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 border border-cyan-500/20 p-6 shadow-lg animate-fade-in text-center text-gray-400">[Backup and restore tools coming soon]</div>
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart2 />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><BarChart2 className="inline-block w-6 h-6 text-purple-500 animate-bounce" /> Analytics</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Animated graphs and charts for system usage, growth, and more.</p>
          <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/20 p-6 shadow-lg animate-fade-in text-center text-gray-400">[Analytics and charts coming soon]</div>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Settings className="inline-block w-6 h-6 text-green-500 animate-spin-slow" /> Settings</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Manage system settings, theme, security, and notifications.</p>
          <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/20 p-6 shadow-lg animate-fade-in text-center text-gray-400">[Settings panel coming soon]</div>
        </div>
      ),
    },
    {
      id: 'access',
      label: 'Access Control',
      icon: <Key />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Key className="inline-block w-6 h-6 text-yellow-500 animate-pulse" /> Access Control</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">Manage roles and permissions visually.</p>
          <div className="rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border border-yellow-500/20 p-6 shadow-lg animate-fade-in text-center text-gray-400">[Access control tools coming soon]</div>
        </div>
      ),
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: <Activity />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Activity className="inline-block w-6 h-6 text-red-500 animate-bounce" /> Audit Trail</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">See who changed what and when.</p>
          <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/20 p-6 shadow-lg animate-fade-in text-center text-gray-400">[Audit trail coming soon]</div>
        </div>
      ),
    },
    {
      id: 'support',
      label: 'Support & Feedback',
      icon: <LifeBuoy />,
      content: (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><LifeBuoy className="inline-block w-6 h-6 text-sky-500 animate-bounce" /> Support & Feedback</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-4">View and respond to user feedback and support requests.</p>
          <div className="rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-700/20 border border-sky-500/20 p-6 shadow-lg animate-fade-in text-center text-gray-400">[Support and feedback tools coming soon]</div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#0a1a38_0%,_#0d213a_35%,_#040812_100%)] p-0 md:p-8 flex flex-col text-white"
    >
      {/* Breadcrumbs */}
      <div className="pt-8 px-4 md:px-0">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/', icon: <Database className="w-4 h-4" /> },
            { label: 'Admin', href: '/admin/dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
            { label: 'Dashboard' },
          ]}
        />
      </div>

      {/* Quick Access Section - Moved to top for visibility */}
      <div className="mt-6 px-4 md:px-0">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white/10 border border-cyan-300/20 backdrop-blur-xl p-6 md:p-10 shadow-2xl shadow-cyan-950/40">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-extrabold text-white mb-2">Super Admin</h2>
            <p className="text-cyan-100 text-lg">Welcome back! Manage your university system efficiently with one click.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/fees')}
              className="w-full p-8 rounded-2xl bg-gradient-to-br from-green-500/25 via-cyan-500/20 to-blue-500/20 border border-white/20 hover:border-white/30 text-white transition-all flex flex-col items-center gap-4 group shadow-[0_20px_50px_rgba(14,116,144,0.35)]"
            >
              <div className="p-4 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all">
                <DollarSign className="w-10 h-10" />
              </div>
              <span className="font-bold text-lg text-center">Fees Management</span>
              <span className="text-sm text-green-400 group-hover:text-green-300">Create & manage student fees</span>
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity mt-2" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('users')}
              className="w-full p-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 hover:border-blue-400/60 text-blue-300 hover:text-blue-200 transition-all flex flex-col items-center gap-4 group shadow-lg hover:shadow-blue-500/20"
            >
              <div className="p-4 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all">
                <Users className="w-10 h-10" />
              </div>
              <span className="font-bold text-lg text-center">User Management</span>
              <span className="text-sm text-blue-400 group-hover:text-blue-300">Manage users & roles</span>
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity mt-2" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('analytics')}
              className="w-full p-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 transition-all flex flex-col items-center gap-4 group shadow-lg hover:shadow-purple-500/20"
            >
              <div className="p-4 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all">
                <BarChart2 className="w-10 h-10" />
              </div>
              <span className="font-bold text-lg text-center">Analytics</span>
              <span className="text-sm text-purple-400 group-hover:text-purple-300">View system analytics</span>
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity mt-2" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('database')}
              className="w-full p-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-cyan-200 transition-all flex flex-col items-center gap-4 group shadow-lg hover:shadow-cyan-500/20"
            >
              <div className="p-4 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all">
                <Database className="w-10 h-10" />
              </div>
              <span className="font-bold text-lg text-center">Database</span>
              <span className="text-sm text-cyan-400 group-hover:text-cyan-300">Database management</span>
              <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity mt-2" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('logs')}
              className="w-full p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 hover:border-orange-400/60 text-orange-300 hover:text-orange-200 transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-all">
                <FileText className="w-8 h-8" />
              </div>
              <span className="font-bold text-center">System Logs</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('backup')}
              className="w-full p-6 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 hover:border-pink-400/60 text-pink-300 hover:text-pink-200 transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-all">
                <RefreshCw className="w-8 h-8" />
              </div>
              <span className="font-bold text-center">Backup & Restore</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('access')}
              className="w-full p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 hover:border-yellow-400/60 text-yellow-300 hover:text-yellow-200 transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-all">
                <Key className="w-8 h-8" />
              </div>
              <span className="font-bold text-center">Access Control</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('audit')}
              className="w-full p-6 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 hover:border-red-400/60 text-red-300 hover:text-red-200 transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-all">
                <Activity className="w-8 h-8" />
              </div>
              <span className="font-bold text-center">Audit Trail</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </div>
      </div>

{dashboardError && (
            <div className="mb-6 rounded-xl border border-orange-400/20 bg-orange-500/10 px-4 py-3 text-orange-100">
              {dashboardError}
            </div>
          )}
          {dashboardLoading && (
            <div className="mb-6 rounded-xl border border-slate-600/30 bg-slate-900/80 px-4 py-6 text-center text-slate-200">
              Loading dashboard metrics...
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 px-4 md:px-0">
            {stats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

      <div className="mt-12 px-4 md:px-0 border-t border-gray-700/30"></div>
      <div className="mt-8 px-4 md:px-0">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Management Center</h2>
          <p className="text-gray-400">Detailed management tools for all admin functions</p>
        </div>
        <Tabs tabs={adminTabs} variant="pills" activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
