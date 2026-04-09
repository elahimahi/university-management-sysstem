import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../constants/app.constants';
import { Bell, CheckCircle, Clock, User, DollarSign, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  student_id: number;
  student_name: string;
  email: string;
  phone: string;
  fee_id: number;
  amount: number;
  payment_method: string;
  fee_description: string;
  status: string;
  created_at: string;
  created_at_formatted: string;
}

interface Stats {
  unread_count: number;
  total_count: number;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({ unread_count: 0, total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_BASE_URL}/admin/notifications`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data.notifications || []);
      setStats({
        unread_count: response.data.unread_count || 0,
        total_count: response.data.total_count || 0,
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
      await axios.post(
        `${API_BASE_URL}/admin/mark-notification-read`,
        { notification_id: notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Marked as read');
      fetchNotifications();
    } catch (err: any) {
      console.error('Error marking notification:', err);
      toast.error('Failed to update notification');
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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'unread'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats - Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl shadow-2xl p-8 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 border border-blue-300/40 dark:from-blue-900/60 dark:via-blue-800/60 dark:to-cyan-900/60 dark:border-blue-600/40"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-white/20 backdrop-blur-lg rounded-full"
              >
                <Bell className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white"
                >
                  Payment Notifications
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-blue-100 text-sm mt-1"
                >
                  Track student payments in real-time
                </motion.p>
              </div>
            </div>

            {/* Unread Count Badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="text-right bg-white/20 backdrop-blur-lg px-6 py-4 rounded-lg border border-white/30"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl font-bold text-white"
              >
                {stats.unread_count}
              </motion.div>
              <p className="text-white/90 text-sm mt-1 font-semibold">Unread Notifications</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filter and Refresh */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur"
      >
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStatusFilter('all')}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all backdrop-blur text-sm uppercase tracking-wider ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40'
                : 'bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80'
            }`}
          >
            All ({stats.total_count})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStatusFilter('unread')}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all backdrop-blur text-sm uppercase tracking-wider ${
              statusFilter === 'unread'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/40'
                : 'bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80'
            }`}
          >
            Unread ({stats.unread_count})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStatusFilter('read')}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all backdrop-blur text-sm uppercase tracking-wider ${
              statusFilter === 'read'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40'
                : 'bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80'
            }`}
          >
            Read
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchNotifications}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all flex items-center gap-2 justify-center sm:ml-auto shadow-lg hover:shadow-xl uppercase tracking-wider text-sm"
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

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`rounded-xl p-6 border-2 transition-all backdrop-blur relative overflow-hidden ${
                notif.status === 'unread'
                  ? 'bg-gradient-to-br from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-400/80 dark:border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                  : 'bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-800/60 dark:to-gray-900/60 border-gray-200/80 dark:border-gray-700/80 shadow-md'
              }`}
            >
              {/* Animated background glow for unread */}
              {notif.status === 'unread' && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
              )}

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"
                    >
                      <User className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {notif.student_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notif.email} • {notif.phone}
                      </p>
                    </div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg border border-purple-200/50 dark:border-purple-700/30"
                    >
                      <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider font-bold mb-1">Fee Description</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {notif.fee_description}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/20 rounded-lg border border-green-200/50 dark:border-green-700/30"
                    >
                      <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Amount Paid
                      </p>
                      <p className="font-bold text-green-700 dark:text-green-400 text-xl">
                        ৳{notif.amount.toLocaleString()}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-lg border border-indigo-200/50 dark:border-indigo-700/30"
                    >
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-bold mb-1">Payment Method</p>
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-sm font-bold ${getMethodColor(notif.payment_method)} backdrop-blur`}
                      >
                        <span className="text-lg">{getMethodIcon(notif.payment_method)}</span>
                        {notif.payment_method}
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400 font-semibold"
                  >
                    <Clock className="w-4 h-4 text-blue-500" />
                    {notif.created_at_formatted}
                  </motion.div>
                </div>

                <div className="flex flex-col gap-3">
                  <motion.span 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1 backdrop-blur ${getStatusBadge(notif.status)}`}
                  >
                    {notif.status === 'unread' ? (
                      <>
                        <motion.span 
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2.5 h-2.5 rounded-full bg-yellow-600 dark:bg-yellow-400"
                        />
                        NEW
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        READ
                      </>
                    )}
                  </motion.span>

                  {notif.status === 'unread' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
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
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-70" />
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
              {statusFilter === 'all' ? 'No notifications yet' : `No ${statusFilter} notifications`}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Payments will appear here as students make them.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
