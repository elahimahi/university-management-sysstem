import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, ChevronLeft, RefreshCw, LayoutDashboard, CheckCircle, AlertCircle, BookOpen, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';

interface NotificationItem {
  id: number;
  message: string;
  notification_type?: string;
  status: string;
  created_at: string;
  created_at_formatted: string;
}

const FacultyNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/faculty/dashboard' },
    { label: 'My Courses', icon: <Bell size={20} />, href: '/faculty/courses' },
  ];

  const unreadCount = notifications.filter((notification) => notification.status === 'unread').length;
  const totalCount = notifications.length;

  // Get icon and colors based on notification type
  const getNotificationStyle = (type: string) => {
    const styles: any = {
      grade_submission: {
        icon: <CheckCircle size={24} />,
        bgColor: 'from-emerald-500/20 to-green-500/20',
        borderColor: 'border-emerald-400/50',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-200',
        accentColor: 'text-emerald-300',
        glowColor: 'shadow-emerald-500/30',
      },
      course_add: {
        icon: <BookOpen size={24} />,
        bgColor: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-400/50',
        badgeBg: 'bg-blue-500/20',
        badgeText: 'text-blue-200',
        accentColor: 'text-blue-300',
        glowColor: 'shadow-blue-500/30',
      },
      assignment: {
        icon: <FileText size={24} />,
        bgColor: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-400/50',
        badgeBg: 'bg-purple-500/20',
        badgeText: 'text-purple-200',
        accentColor: 'text-purple-300',
        glowColor: 'shadow-purple-500/30',
      },
      general: {
        icon: <AlertCircle size={24} />,
        bgColor: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber-400/50',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-200',
        accentColor: 'text-amber-300',
        glowColor: 'shadow-amber-500/30',
      },
    };
    return styles[type?.toLowerCase()] || styles.general;
  };

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    'http://localhost/SD_Project/university-management-sysstem/backend';

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_BASE_URL}/faculty/get_notifications.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load faculty notifications:', err);
      setError(err.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      const token = getAccessToken();
      await axios.post(
        `${API_BASE_URL}/faculty/mark_notification_read.php`,
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
    setSelectedNotification(notification);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b18] via-[#0a1428] to-[#0f1a2e] text-white overflow-hidden">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <Navbar
          items={[]}
          rightContent={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right">
                  <p className="text-sm font-semibold">Prof. {user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-navy-900 shadow-lg border-2 border-white/20">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            </div>
          }
        />

        <div className="flex pt-16">
          <Sidebar items={menuItems} isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          <main className={`flex-1 transition-all duration-300 p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]"
              >
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-navy-950/80 via-navy-900/60 to-navy-950/80 p-8 shadow-soft-lg backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm uppercase tracking-[0.24em] text-amber-300 font-semibold mb-2"
                      >
                        Faculty alerts
                      </motion.p>
                      <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-black text-white"
                      >
                        Notifications
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-3 max-w-2xl text-slate-300"
                      >
                        Every course update and system alert is collected here. Tap a notification to view details and track unread items.
                      </motion.p>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-3"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-400/30 px-5 py-4 shadow-lg shadow-emerald-500/10 flex flex-col backdrop-blur-sm"
                      >
                        <span className="text-sm text-emerald-300">Unread</span>
                        <span className="mt-2 text-3xl font-bold text-emerald-100">{unreadCount}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/30 px-5 py-4 shadow-lg shadow-blue-500/10 flex flex-col backdrop-blur-sm"
                      >
                        <span className="text-sm text-blue-300">Total alerts</span>
                        <span className="mt-2 text-3xl font-bold text-blue-100">{totalCount}</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-navy-950/80 via-navy-900/60 to-navy-950/80 p-8 shadow-soft-lg backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Quick actions</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsRefreshing(true);
                        fetchNotifications();
                      }}
                      className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-navy-950 shadow-glow hover:from-amber-400 hover:to-orange-400 transition"
                    >
                      <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                      Refresh
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/faculty/dashboard')}
                      className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                    >
                      <ChevronLeft size={18} /> Back to Dashboard
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
                <div className="space-y-4">
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-[2rem] border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-10 text-center text-slate-300 shadow-soft backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin mx-auto mb-3"></div>
                      Loading notifications...
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-[2rem] border border-red-400/30 bg-gradient-to-r from-red-500/10 to-rose-500/10 p-10 text-center text-red-300 shadow-soft backdrop-blur-sm flex items-center gap-3 justify-center"
                    >
                      <AlertCircle size={20} />
                      {error}
                    </motion.div>
                  ) : notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-[2rem] border border-slate-400/20 bg-gradient-to-r from-slate-500/10 to-slate-600/10 p-10 text-center text-slate-400 shadow-soft backdrop-blur-sm"
                    >
                      <Bell size={32} className="mx-auto mb-3 opacity-50" />
                      No notifications yet.
                    </motion.div>
                  ) : (
                    notifications.map((notification, index) => {
                      const notifType = notification.notification_type || 'general';
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
                          className={`w-full rounded-[2rem] border backdrop-blur-sm p-6 text-left transition-all duration-300 ${
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
                                    {notifType}
                                  </motion.span>
                                </div>
                                <p className="text-sm text-slate-400">
                                  {notification.created_at_formatted}
                                </p>
                              </div>
                            </div>
                            <motion.span
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              className={`rounded-full px-4 py-2 text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                                notification.status === 'unread'
                                  ? 'bg-gradient-to-r from-amber-400/40 to-orange-500/40 text-amber-100 border border-amber-300/30'
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

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-navy-950/80 via-navy-900/60 to-navy-950/80 p-6 shadow-soft-lg backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Notification Details</h2>
                      <p className="mt-1 text-sm text-slate-400">Open an alert to inspect the latest course activity.</p>
                    </div>
                    <motion.span 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300 border border-white/10"
                    >
                      {selectedNotification ? selectedNotification.status : 'NO SELECTION'}
                    </motion.span>
                  </div>
                  {selectedNotification ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="rounded-3xl border border-white/10 bg-navy-900/90 p-6 shadow-soft">
                        <div className="mb-4">
                          <p className="text-sm uppercase tracking-[0.18em] text-amber-300 font-semibold">Alert</p>
                          <h3 className="mt-3 text-xl font-bold text-white">{selectedNotification.notification_type || 'General notification'}</h3>
                        </div>
                        <p className="text-base leading-7 text-slate-300">{selectedNotification.message}</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm"
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Received</p>
                          <p className="mt-2 text-sm font-semibold text-white">{selectedNotification.created_at_formatted}</p>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm"
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                          <p className="mt-2 text-sm font-semibold text-white capitalize">{selectedNotification.status}</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-3xl border border-dashed border-white/10 bg-navy-900/80 p-10 text-center text-slate-500"
                    >
                      <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
                      Select a notification to see the course add details.
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FacultyNotificationsPage;
