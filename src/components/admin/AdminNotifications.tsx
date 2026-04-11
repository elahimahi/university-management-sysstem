import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../constants/app.constants';
import {
  Bell,
  CheckCircle,
  Clock,
  User,
  DollarSign,
  Filter,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  student_id: number;
  student_name: string;
  email: string;
  phone: string;
  notification_type?: 'payment' | 'registration' | 'account_creation';
  message?: string;
  fee_id?: number;
  amount?: number;
  fee_amount?: number;
  total_paid?: number;
  payment_status?: 'full' | 'partial' | 'unpaid';
  payment_method?: string;
  fee_description?: string;
  transaction_id?: string | null;
  user_role?: 'faculty' | 'student' | 'admin' | string;
  status: string;
  created_at: string;
  created_at_formatted: string;
}

interface Stats {
  unread_count: number;
  total_count: number;
}

interface AdminNotificationsProps {
  type?: 'all' | 'payment' | 'registration' | 'account_creation'; // Context-aware filter
  title?: string;
  subtitle?: string;
}

interface LiveAlert {
  id: string;
  type: 'payment' | 'registration' | 'fee_overdue' | 'assignment';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({ 
  type = 'all',
  title,
  subtitle
} ) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({ unread_count: 0, total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [liveMode, setLiveMode] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    
    let liveInterval: NodeJS.Timeout;
    if (liveMode) {
      fetchLiveAlerts();
      liveInterval = setInterval(fetchLiveAlerts, 3000);
    }
    
    return () => {
      clearInterval(interval);
      if (liveInterval) clearInterval(liveInterval);
    };
  }, [statusFilter, type, liveMode]);

  const fetchLiveAlerts = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/admin/live-activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const activities = response.data.activities || [];
      const newAlerts: LiveAlert[] = activities.map((activity: any, idx: number) => {
        let icon = '📋';
        let color = 'from-blue-500 to-cyan-500';
        
        if (activity.type === 'payment') {
          icon = '💳';
          color = 'from-green-500 to-emerald-500';
        } else if (activity.type === 'registration') {
          icon = '👥';
          color = 'from-purple-500 to-pink-500';
        } else if (activity.type === 'fee_overdue') {
          icon = '⚠️';
          color = 'from-red-500 to-orange-500';
        } else if (activity.type === 'assignment') {
          icon = '📝';
          color = 'from-indigo-500 to-blue-500';
        }

        return {
          id: `${activity.type}-${idx}-${Date.now()}`,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: new Date(activity.timestamp),
          icon,
          color,
        };
      });

      setLiveAlerts(newAlerts.slice(0, 10));
    } catch (err) {
      console.error('Error fetching live alerts:', err);
    }
  };


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();

      if (!token) {
        setError('Access token missing. Please sign in again.');
        setLoading(false);
        return;
      }

      // Always fetch ALL notifications from backend, do filtering on client-side
      const response = await axios.get(`${API_BASE_URL}/admin/notifications`, {
        params: {
          type: type, // Pass the context-aware type filter
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      let allNotifications = response.data.notifications || [];
      
      // Client-side filtering based on status filter
      let filteredNotifications = allNotifications;
      if (statusFilter === 'unread') {
        filteredNotifications = allNotifications.filter((n: Notification) => n.status === 'unread');
      } else if (statusFilter === 'read') {
        filteredNotifications = allNotifications.filter((n: Notification) => n.status === 'read');
      }

      setNotifications(filteredNotifications);
      setStats({
        unread_count: allNotifications.filter((n: Notification) => n.status === 'unread').length,
        total_count: allNotifications.length,
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const token = getAccessToken();
      if (!token) {
        toast.error('Access token missing. Please sign in again.');
        return;
      }
      const notif = notifications.find(n => n.id === notificationId);
      const notificationType = notif?.notification_type || 'payment';
      
      const response = await axios.post(
        `${API_BASE_URL}/admin/mark-notification-read`,
        { 
          notification_id: notificationId,
          notification_type: notificationType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state immediately
      if (response.data.success || response.status === 200) {
        // Update notification status in local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, status: 'read' } : notif
          )
        );
        
        // Update stats - decrement unread
        setStats(prev => ({
          unread_count: Math.max(0, prev.unread_count - 1),
          total_count: prev.total_count
        }));

        // If on unread filter, remove the notification from view
        if (statusFilter === 'unread') {
          setNotifications(prevNotifications =>
            prevNotifications.filter(notif => notif.id !== notificationId)
          );
        }
        
        toast.success('✅ Marked as read');
        // Refresh to ensure sync
        setTimeout(() => fetchNotifications(), 500);
      }
    } catch (err: any) {
      console.error('Error marking notification:', err);
      toast.error('Failed to update notification');
      // Refresh on error
      fetchNotifications();
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return '💳';
      case 'nagad':
        return '💰';
      case 'rocket':
        return '🚀';
      case 'card':
        return '💳';
      case 'registration':
        return '📝';
      case 'overdue':
        return '⚠️';
      case 'reminder':
        return '⏰';
      case 'penalty':
        return '🚨';
      default:
        return '💵';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'nagad':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'rocket':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'card':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'registration':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'reminder':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'penalty':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'unread'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const getMessageColor = (message: string) => {
    const lowerMessage = message?.toLowerCase() || '';
    if (lowerMessage.includes('approved') || lowerMessage.includes('approve')) {
      return {
        bg: 'bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/30',
        border: 'border-green-300/50 dark:border-green-700/40',
        text: 'text-green-700 dark:text-green-300',
        icon: '✅'
      };
    } else if (lowerMessage.includes('rejected') || lowerMessage.includes('reject')) {
      return {
        bg: 'bg-gradient-to-br from-red-100 to-rose-50 dark:from-red-900/40 dark:to-rose-900/30',
        border: 'border-red-300/50 dark:border-red-700/40',
        text: 'text-red-700 dark:text-red-300',
        icon: '❌'
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-cyan-100 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/30',
        border: 'border-cyan-300/50 dark:border-cyan-700/40',
        text: 'text-cyan-700 dark:text-cyan-300',
        icon: '📋'
      };
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative"
    >
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl"
        />
      </div>

      {/* Header with Stats - Enhanced Design */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl shadow-2xl p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border border-purple-300/40 dark:from-indigo-900/60 dark:via-purple-900/60 dark:to-pink-900/60 dark:border-purple-600/40"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="p-3 bg-white/20 backdrop-blur-lg rounded-full border border-white/30"
              >
                <Bell className="w-8 h-8 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-black text-white drop-shadow-lg"
                >
                  {title || (
                    type === 'registration' 
                      ? '📋 Registration Alerts'
                      : type === 'payment'
                      ? '💳 Payment Notifications'
                      : type === 'account_creation'
                      ? '👥 Account Creation Alerts'
                      : '🔔 Admin Alerts Center'
                  )}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-purple-100 text-base mt-2 font-semibold"
                >
                  {subtitle || (
                    type === 'registration'
                      ? 'Pending faculty & student registrations • ' + stats.total_count + ' Alerts'
                      : type === 'payment'
                      ? 'Real-time student payment tracking • ' + stats.total_count + ' Transactions'
                      : type === 'account_creation'
                      ? 'New faculty and student account creations • ' + stats.total_count + ' Alerts'
                      : 'Payment activity & pending registration approvals • ' + stats.total_count + ' Alerts'
                  )}
                </motion.p>
              </div>
            </div>

            {/* Unread Count Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4, bounce: 0.6 }}
              className="text-right bg-white/20 backdrop-blur-lg px-8 py-4 rounded-2xl border border-white/30 shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl font-black text-white drop-shadow-lg"
              >
                {stats.unread_count}
              </motion.div>
              <p className="text-white/90 text-sm mt-2 font-bold uppercase tracking-wider">Unread</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filter and Stats - Enhanced Design */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-2"
      >
        {[
          { label: 'Total', value: stats.total_count, icon: Zap, color: 'from-indigo-500 to-indigo-600', bgColor: 'from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20', textColor: 'text-indigo-700 dark:text-indigo-300', accentColor: 'from-indigo-400 to-indigo-600' },
          { label: 'Unread', value: stats.unread_count, icon: Bell, color: 'from-amber-500 to-amber-600', bgColor: 'from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20', textColor: 'text-amber-700 dark:text-amber-300', accentColor: 'from-amber-400 to-amber-600' },
          { label: 'Read', value: Math.max(0, stats.total_count - stats.unread_count), icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bgColor: 'from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20', textColor: 'text-emerald-700 dark:text-emerald-300', accentColor: 'from-emerald-400 to-emerald-600' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ translateY: -6, scale: 1.05 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-300`} />
              <div className={`relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border-2 border-white/60 dark:border-white/10 rounded-2xl p-5 text-center shadow-lg group-hover:shadow-2xl transition-all`}>
                <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className={`text-xs font-bold ${stat.textColor} uppercase tracking-widest mb-2`}>
                  {stat.label}
                </p>
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-4xl font-black bg-gradient-to-r ${stat.accentColor} text-transparent bg-clip-text`}
                >
                  {stat.value}
                </motion.p>
              </div>
            </motion.div>
          );
        })}

        {/* Live Toggle Button Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ translateY: -6, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLiveMode(!liveMode)}
          className="group relative cursor-pointer"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${
            liveMode ? 'from-pink-500 to-pink-600' : 'from-gray-400 to-gray-500'
          } rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-300`} />
          <div className={`relative bg-gradient-to-br ${
            liveMode 
              ? 'from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/20' 
              : 'from-gray-100 to-gray-50 dark:from-gray-900/40 dark:to-gray-800/20'
          } backdrop-blur-xl border-2 border-white/60 dark:border-white/10 rounded-2xl p-5 text-center shadow-lg group-hover:shadow-2xl transition-all`}>
            <div className={`bg-gradient-to-br ${
              liveMode ? 'from-pink-500 to-pink-600' : 'from-gray-400 to-gray-500'
            } w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <motion.div
                animate={liveMode ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <p className={`text-xs font-bold ${
              liveMode ? 'text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-gray-300'
            } uppercase tracking-widest mb-2`}>
              Status
            </p>
            <motion.p
              animate={liveMode ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`text-4xl font-black bg-gradient-to-r ${
                liveMode ? 'from-pink-400 to-pink-600' : 'from-gray-400 to-gray-600'
              } text-transparent bg-clip-text`}
            >
              {liveMode ? '🔴' : '◯'}
            </motion.p>
            <p className={`text-xs mt-2 ${
              liveMode ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-400'
            } font-bold`}>
              {liveMode ? 'LIVE ON' : 'OFF'}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filter and Refresh */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center p-5 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-lg"
      >
        <div className="flex gap-2 flex-wrap">
          {['all', 'unread', 'read'].map((filter, idx) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(filter as 'all' | 'read' | 'unread')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`px-5 py-3 rounded-xl font-bold transition-all backdrop-blur text-sm uppercase tracking-wider border-2 ${
                statusFilter === filter
                  ? filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/40'
                    : filter === 'unread'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-lg shadow-amber-500/40'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-emerald-600 shadow-lg shadow-green-500/40'
                  : 'bg-white/40 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60 border-slate-300 dark:border-slate-600'
              }`}
            >
              {filter === 'all' ? `All (${stats.total_count})` : filter === 'unread' ? `Unread (${stats.unread_count})` : `Read (${stats.total_count - stats.unread_count})`}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchNotifications}
          className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 justify-center sm:ml-auto shadow-lg hover:shadow-xl uppercase tracking-wider text-sm border-2 border-purple-700/50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
          Refresh
        </motion.button>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Live Alert Stream - Shows when Live Mode is ON */}
      <AnimatePresence>
        {liveMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-2 border-pink-500/50 p-6 shadow-2xl shadow-pink-500/20 overflow-hidden"
          >
            {/* Animated background effect */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-pink-500 rounded-full shadow-lg shadow-pink-500"
                />
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  🔴 LIVE ACTIVITY STREAM
                  <span className="text-xs bg-pink-500/30 px-2 py-1 rounded-lg text-pink-200">REAL-TIME</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {liveAlerts.length > 0 ? (
                  liveAlerts.map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg border-l-4 border-l-pink-500 bg-white/5 backdrop-blur hover:bg-white/10 transition flex items-start gap-3 group cursor-pointer`}
                    >
                      <span className="text-2xl flex-shrink-0 mt-1">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm line-clamp-1">{alert.title}</p>
                        <p className="text-gray-300 text-xs line-clamp-2 mt-1">{alert.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {Math.floor((Date.now() - alert.timestamp.getTime()) / 1000) < 60
                            ? 'Just now'
                            : `${Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago`}
                        </p>
                      </div>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-pink-400 flex-shrink-0"
                      >
                        →
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No live activity yet...</p>
                    <p className="text-gray-500 text-xs mt-2">Waiting for real-time updates</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List - with loading overlay */}
      <div className="relative">
        {loading && notifications.length > 0 && (
          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-2xl backdrop-blur-sm z-40 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full"
            />
          </div>
        )}

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`group rounded-2xl p-6 border-2 transition-all backdrop-blur relative overflow-hidden cursor-pointer ${
                notif.status === 'unread'
                  ? 'bg-gradient-to-br from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-400/80 dark:border-yellow-500/50 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40'
                  : 'bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-800/60 dark:to-gray-900/60 border-gray-200/80 dark:border-gray-700/80 shadow-md hover:shadow-lg'
              }`}
            >
              {/* Animated background glow for unread */}
              {notif.status === 'unread' && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
              )}

              <div className="relative z-10 flex items-start justify-between gap-4 flex-col md:flex-row">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-5">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`p-3 rounded-xl shadow-lg ${
                        notif.notification_type === 'registration'
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                          : notif.notification_type === 'account_creation'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      }`}
                    >
                      <User className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        {notif.student_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {notif.notification_type === 'registration' 
                          ? '📋 Registration Alert'
                          : notif.notification_type === 'account_creation'
                          ? `👤 ${notif.user_role ? (notif.user_role === 'faculty' ? '👨‍🏫 Faculty' : notif.user_role === 'student' ? '👨‍🎓 Student' : '') : 'Account'} Created`
                          : `${notif.email} • ${notif.phone}`
                        }
                      </p>
                    </div>
                  </div>

                  {(notif.notification_type === 'registration' || notif.notification_type === 'account_creation') ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className={`mt-5 p-5 rounded-2xl border shadow-lg ${
                        notif.notification_type === 'account_creation'
                          ? 'bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/30 border-green-300/50 dark:border-green-700/40'
                          : getMessageColor(notif.message || '').bg + ' ' + getMessageColor(notif.message || '').border
                      }`}
                    >
                      <p className={`text-sm font-bold leading-relaxed ${
                        notif.notification_type === 'account_creation'
                          ? 'text-green-700 dark:text-green-300'
                          : getMessageColor(notif.message || '').text
                      }`}>
                        {notif.notification_type === 'account_creation' 
                          ? `✅ ${notif.student_name} - ${notif.user_role === 'faculty' ? 'Faculty' : notif.user_role === 'student' ? 'Student' : 'User'} account created successfully`
                          : `${getMessageColor(notif.message || '').icon} ${notif.message}`
                        }
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg p-5 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 shadow-lg"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 rounded-xl border border-purple-300/50 dark:border-purple-700/40 group"
                      >
                        <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold mb-2">Fee Description</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                          {notif.fee_description}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-xl border border-emerald-300/50 dark:border-emerald-700/40 group"
                      >
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Amount Paid
                        </p>
                        <p className="font-black text-emerald-700 dark:text-emerald-300 text-2xl group-hover:text-emerald-600 dark:group-hover:text-emerald-200 transition-colors">
                          ৳{notif.amount?.toLocaleString() || '0'}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20 rounded-xl border border-indigo-300/50 dark:border-indigo-700/40"
                      >
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold mb-2">Payment Method</p>
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`px-4 py-2 rounded-xl inline-flex items-center gap-2 text-sm font-bold shadow-md ${getMethodColor(notif.payment_method || '')}`}
                        >
                          <span className="text-lg">{getMethodIcon(notif.payment_method || '')}</span>
                          <span>{notif.payment_method}</span>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-col md:flex-row gap-3 md:gap-4 mt-5"
                  >
                    {notif.notification_type === 'payment' && (
                      <>
                        {notif.payment_status === 'full' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 dark:from-emerald-900/40 dark:to-emerald-800/20 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/50 shadow-md">
                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            ✅ Fully Paid
                          </div>
                        )}
                        {notif.payment_status === 'partial' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 dark:from-yellow-900/40 dark:to-yellow-800/20 dark:text-yellow-300 border border-yellow-300/50 dark:border-yellow-700/50 shadow-md">
                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                            ⏳ Partial Payment
                          </div>
                        )}
                        {notif.payment_status === 'unpaid' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900/40 dark:to-red-800/20 dark:text-red-300 border border-red-300/50 dark:border-red-700/50 shadow-md">
                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            ❌ Unpaid
                          </div>
                        )}
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold bg-slate-50/80 dark:bg-slate-900/50 px-4 py-2.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                          Fee: <span className="font-bold text-gray-900 dark:text-white">৳{notif.fee_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span> | Paid: <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{notif.total_paid?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                        </div>
                      </>
                    )}
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400 font-semibold bg-slate-50/80 dark:bg-slate-900/50 px-4 py-2.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 w-fit"
                  >
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {notif.created_at_formatted}
                  </motion.div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                  <motion.span 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 backdrop-blur-lg shadow-lg flex-1 md:flex-none justify-center md:justify-start border-2 ${getStatusBadge(notif.status)}`}
                  >
                    {notif.status === 'unread' ? (
                      <>
                        <motion.span 
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2.5 h-2.5 rounded-full bg-yellow-600 dark:bg-yellow-400"
                        />
                        🆕 NEW
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        ✓ READ
                      </>
                    )}
                  </motion.span>

                  {notif.status === 'unread' && (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg flex-1 md:flex-none"
                    >
                      Mark Read
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700/50 shadow-lg"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bell className="w-20 h-20 text-purple-300 mx-auto mb-4 opacity-80" />
            </motion.div>
            <p className="text-gray-700 dark:text-gray-300 font-bold text-xl">
              {statusFilter === 'all' ? '✨ All quiet!' : `No ${statusFilter} notifications`}
            </p>
            <p className="text-gray-600 dark:text-gray-500 text-base mt-3 max-w-md mx-auto">
              Payments will appear here as students make them. Stay tuned!
            </p>
          </motion.div>
        )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminNotifications;
