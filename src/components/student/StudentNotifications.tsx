import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../constants/app.constants';

interface NotificationItem {
  id: number;
  message: string;
  payment_method: string;
  notification_type?: string;
  status: string;
  created_at: string;
  created_at_formatted: string;
}

const StudentNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_BASE_URL}/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetched: NotificationItem[] = response.data.notifications || [];
      setNotifications(fetched);
      setUnreadCount(fetched.filter((item) => item.status === 'unread').length);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.error || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      const token = getAccessToken();
      await axios.post(
        `${API_BASE_URL}/student/notifications/read`,
        { notification_id: notificationId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, status: 'read' } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const navigate = useNavigate();

  const handleItemClick = (item: NotificationItem) => {
    if (item.status === 'unread') {
      markAsRead(item.id);
    }

    if (item.notification_type === 'assignment') {
      navigate('/student/assignments');
      setIsOpen(false);
      return;
    }

    // For other notifications, keep the default behavior
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] max-w-full rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl text-sm text-slate-100 z-50">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-100">
              <Clock size={16} />
              <span className="font-semibold">Recent Activity</span>
            </div>
            <button
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1 rounded-xl bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-400">Loading notifications...</div>
            ) : error ? (
              <div className="p-6 text-center text-rose-400">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No recent notifications</div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-4 text-left transition-colors hover:bg-white/5 ${item.status === 'unread' ? 'bg-white/5' : 'bg-transparent'}`}
                >
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-100">{item.message}</span>
                      {item.notification_type && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                          {item.notification_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{item.created_at_formatted}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
