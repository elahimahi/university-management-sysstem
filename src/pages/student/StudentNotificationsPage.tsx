import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronLeft,
  Clock,
  RefreshCw,
  BookOpen,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Award,
  BookMarked,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';

interface NotificationItem {
  id: number;
  message: string;
  payment_method: string;
  notification_type?: string;
  status: string;
  created_at_formatted: string;
}

const StudentNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Get icon and colors based on notification type
  const getNotificationStyle = (type: string) => {
    const styles: any = {
      grade: {
        icon: <Award size={24} />,
        bgColor: 'from-emerald-500/20 to-green-500/20',
        borderColor: 'border-emerald-400/50',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-200',
        badgeLabel: 'GRADE',
        accentColor: 'text-emerald-300',
        glowColor: 'shadow-emerald-500/30',
      },
      enrollment: {
        icon: <BookMarked size={24} />,
        bgColor: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-400/50',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-200',
        badgeLabel: 'ENROLLMENT',
        accentColor: 'text-blue-300',
        glowColor: 'shadow-blue-500/30',
      },
      assignment: {
        icon: <BookOpen size={24} />,
        bgColor: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-400/50',
        badgeBg: 'bg-purple-500/20',
        badgeText: 'text-purple-200',
        badgeLabel: 'ASSIGNMENT',
        accentColor: 'text-purple-300',
        glowColor: 'shadow-purple-500/30',
      },
      fee: {
        icon: <DollarSign size={24} />,
        bgColor: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber-400/50',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-200',
        badgeLabel: 'FEE',
        accentColor: 'text-amber-300',
        glowColor: 'shadow-amber-500/30',
      },
    };
    return styles[type] || styles.enrollment;
  };

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/student/dashboard' },
    { label: 'Registration', icon: <BookOpen size={20} />, href: '/student/registration' },
    { label: 'Grades', icon: <CheckSquare size={20} />, href: '/student/grades' },
    { label: 'Attendance', icon: <Clock size={20} />, href: '/student/attendance' },
    { label: 'Assignments', icon: <BookOpen size={20} />, href: '/student/assignments' },
    { label: 'Fees', icon: <CreditCard size={20} />, href: '/student/fees' },
  ];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        'http://localhost/SD_Project/university-management-sysstem/backend';
      const response = await axios.get(`${API_BASE_URL}/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      const token = getAccessToken();
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        'http://localhost/SD_Project/university-management-sysstem/backend';
      await axios.post(
        `${API_BASE_URL}/student/notifications/read`,
        { notification_id: notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, status: 'read' } : item))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }

    if (notification.notification_type === 'assignment') {
      navigate('/student/assignments');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b18] via-[#0a1428] to-[#0f1a2e] text-white overflow-hidden">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
      <Navbar
        items={[]}
        rightContent={
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            </div>
          </div>
        }
      />

      <div className="flex pt-16">
        <Sidebar items={menuItems} isCollapsed={false} onToggle={() => {}} />
        <main className="flex-1 p-8 ml-64">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600/30 to-blue-500/30 px-6 py-3 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 backdrop-blur-md">
                  <Bell size={20} className="text-blue-300" />
                  <span className="font-bold text-lg">Notifications</span>
                </div>
                <p className="mt-4 text-sm text-slate-300 max-w-md">
                  Stay updated with all your course activities, grades, and important announcements.
                </p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsRefreshing(true);
                  fetchNotifications();
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/50 bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-4 py-2 text-sm text-blue-200 hover:from-blue-500/30 hover:to-blue-600/30 transition backdrop-blur-sm"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
              </motion.button>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-8 text-center text-slate-300 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin mx-auto mb-3"></div>
                  Loading notifications...
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-red-400/30 bg-gradient-to-r from-red-500/10 to-rose-500/10 p-8 text-center text-red-300 backdrop-blur-sm flex items-center gap-3 justify-center"
                >
                  <AlertCircle size={20} />
                  {error}
                </motion.div>
              ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-slate-400/20 bg-gradient-to-r from-slate-500/10 to-slate-600/10 p-12 text-center text-slate-400 backdrop-blur-sm"
                >
                  <Bell size={32} className="mx-auto mb-3 opacity-50" />
                  No recent notifications yet. Check back later!
                </motion.div>
              ) : (
                notifications.map((notification, index) => {
                  const notifType = notification.notification_type || notification.payment_method;
                  const style = getNotificationStyle(notifType.toLowerCase());
                  
                  return (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full rounded-3xl border backdrop-blur-sm p-6 text-left transition-all duration-300 ${
                        notification.status === 'unread'
                          ? `border-l-4 ${style.borderColor} bg-gradient-to-r ${style.bgColor} shadow-lg ${style.glowColor} hover:shadow-xl`
                          : 'border-slate-400/20 bg-gradient-to-r from-slate-500/5 to-slate-600/5 hover:from-slate-500/10 hover:to-slate-600/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className={`flex-shrink-0 p-3 rounded-xl bg-white/5 ${style.accentColor}`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-white break-words">
                                {notification.message}
                              </p>
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`rounded-full ${style.badgeBg} ${style.badgeText} px-3 py-1 text-xs font-bold uppercase tracking-wider flex-shrink-0`}
                              >
                                {style.badgeLabel}
                              </motion.span>
                            </div>
                            <p className="text-sm text-slate-400 flex items-center gap-1">
                              <Clock size={14} />
                              {notification.created_at_formatted}
                            </p>
                          </div>
                        </div>
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className={`rounded-full px-4 py-2 text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                            notification.status === 'unread'
                              ? 'bg-gradient-to-r from-blue-400/40 to-blue-500/40 text-blue-100 border border-blue-300/30'
                              : 'bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {notification.status === 'unread' ? '● Unread' : '✓ Read'}
                        </motion.span>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
