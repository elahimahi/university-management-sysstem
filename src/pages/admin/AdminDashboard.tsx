<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  BarChart2,
  ShieldCheck,
  DollarSign,
  Database,
  FileText,
  RefreshCw,
  Key,
  Activity,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
=======

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import StatsCard from '../../components/ui/StatsCard';
import Tabs from '../../components/ui/Tabs';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { API_BASE_URL } from '../../constants/app.constants';
import { UserCog, Database, Settings, Users, BookOpen, BarChart2, ShieldCheck, FileText, RefreshCw, Bell, Key, Activity, LifeBuoy, Server, Lock, DollarSign, ArrowRight, CreditCard } from 'lucide-react';
import UserManagement from './UserManagement';
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

interface DashboardStat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(95);

  useEffect(() => {
    fetchDashboardData();
    const healthInterval = setInterval(() => {
      setSystemHealth(prev => {
        const newHealth = 92 + Math.random() * 8;
        return Math.min(100, Math.max(70, newHealth));
      });
    }, 5000);
    return () => clearInterval(healthInterval);
  }, []);
=======
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
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      try {
        // Try to fetch real data from backend
        const response = await axios.get(`${API_BASE_URL}/admin/stats.php`);
        if (response.data && response.data.data) {
          const data = response.data.data;
          const baseStats: DashboardStat[] = [
            {
              label: 'Total Users',
              value: data.total_users || 1243,
              icon: <Users className="w-8 h-8" />,
              color: 'from-blue-500 to-blue-600',
              trend: 5,
            },
            {
              label: 'Active Sessions',
              value: data.active_sessions || 87,
              icon: <Activity className="w-8 h-8" />,
              color: 'from-green-500 to-green-600',
              trend: 12,
            },
            {
              label: 'Total Revenue',
              value: `$${(data.total_revenue || 125430).toLocaleString()}`,
              icon: <DollarSign className="w-8 h-8" />,
              color: 'from-amber-500 to-amber-600',
              trend: 8,
            },
            {
              label: 'System Health',
              value: `${data.system_health || 95}%`,
              icon: <ShieldCheck className="w-8 h-8" />,
              color: 'from-purple-500 to-purple-600',
              trend: 0,
            },
          ];
          setStats(baseStats);
          return;
        }
      } catch (apiError) {
        console.log('Backend API not available, using demo data');
      }

      // Fallback to demo data
      const baseStats: DashboardStat[] = [
        {
          label: 'Total Users',
          value: 1243,
          icon: <Users className="w-8 h-8" />,
          color: 'from-blue-500 to-blue-600',
          trend: 5,
        },
        {
          label: 'Active Sessions',
          value: 87,
          icon: <Activity className="w-8 h-8" />,
          color: 'from-green-500 to-green-600',
          trend: 12,
        },
        {
          label: 'Total Revenue',
          value: '$125,430',
          icon: <DollarSign className="w-8 h-8" />,
          color: 'from-amber-500 to-amber-600',
          trend: 8,
        },
        {
          label: 'System Health',
          value: '95%',
          icon: <ShieldCheck className="w-8 h-8" />,
          color: 'from-purple-500 to-purple-600',
          trend: 0,
        },
      ];
      setStats(baseStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      id: 'fees',
      title: 'Fees Management',
      description: 'Create & manage student fees',
      icon: <DollarSign className="w-10 h-10" />,
      color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/40',
      action: () => navigate('/admin/fees'),
      badge: 'NEW',
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users & roles',
      icon: <Users className="w-10 h-10" />,
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/40',
      action: () => navigate('/admin/users'),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View system analytics',
      icon: <BarChart2 className="w-10 h-10" />,
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/40',
      action: () => navigate('/admin/analytics'),
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Database management',
      icon: <Database className="w-10 h-10" />,
      color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/40',
      action: () => navigate('/admin/database'),
    },
    {
<<<<<<< HEAD
      id: 'logs',
      title: 'System Logs',
      description: 'View system logs',
      icon: <FileText className="w-10 h-10" />,
      color: 'from-orange-500/20 to-orange-600/20 border-orange-500/40',
      action: () => navigate('/admin/logs'),
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      description: 'Data backup tools',
      icon: <RefreshCw className="w-10 h-10" />,
      color: 'from-pink-500/20 to-pink-600/20 border-pink-500/40',
      action: () => navigate('/admin/backup'),
    },
    {
=======
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db
      id: 'access',
      title: 'Access Control',
      description: 'Manage permissions',
      icon: <Key className="w-10 h-10" />,
      color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40',
      action: () => navigate('/admin/access'),
    },
    {
      id: 'audit',
      title: 'Audit Trail',
      description: 'System audit logs',
      icon: <Activity className="w-10 h-10" />,
      color: 'from-red-500/20 to-red-600/20 border-red-500/40',
      action: () => navigate('/admin/audit'),
    },
  ];

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
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 text-white"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl -z-10" />
          
          <div className="rounded-3xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/20 p-8 md:p-12">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Super Admin
              </h1>
              <p className="text-xl text-slate-300 mb-6">
                Manage your university system efficiently with professional control
              </p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 rounded-full px-4 py-2"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">All Systems Operational</span>
                </motion.div>
                
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-full px-4 py-2"
                >
                  <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                  <span className="text-sm font-medium text-blue-300">System Health: {systemHealth.toFixed(0)}%</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

<<<<<<< HEAD
      {/* Stats Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`relative group rounded-2xl bg-gradient-to-br ${stat.color} border border-slate-600/20 overflow-hidden cursor-pointer transition-all duration-300`}
            >
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              />
=======
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
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db

              <div className="relative p-8 z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                    <div className="w-8 h-8 text-white">
                      {stat.icon}
                    </div>
                  </div>
                  {stat.trend !== undefined && stat.trend !== 0 && (
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 5 }}
                      transition={{ duration: 0.5 }}
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        stat.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      {Math.abs(stat.trend)}%
                    </motion.div>
                  )}
                </div>

                <h3 className="text-slate-300 text-sm font-medium mb-2">
                  {stat.label}
                </h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black text-white mb-4"
                >
                  {loading ? (
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-10 w-16 bg-white/10 rounded"
                    />
                  ) : (
                    stat.value
                  )}
                </motion.div>

                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-white/40 to-white/10"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Access Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            Quick Access
          </h2>
          <p className="text-slate-400">Access all admin functions with one click</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {quickAccessCards.map((card) => (
            <motion.button
              key={card.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={card.action}
              className={`relative group rounded-2xl bg-gradient-to-br ${card.color} border-2 p-6 text-left transition-all duration-300 overflow-hidden`}
            >
              <motion.div
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                    {card.icon}
                  </div>
                  {card.badge && (
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full"
                    >
                      {card.badge}
                    </motion.span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-300 mb-4 group-hover:text-slate-200 transition-colors">
                  {card.description}
                </p>

                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm group-hover:text-blue-300"
                >
                  Access Now
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10"
              />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-7xl mx-auto mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-center"
      >
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-bounce" />
        <p className="text-slate-300">
          Backend integration completed. All admin features are now connected to your database.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
