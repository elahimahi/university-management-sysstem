import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Send, RefreshCw, Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { getAccessToken } from '../../utils/auth.utils';

interface InactiveStudent {
  id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  status: 'read' | 'unread';
  created_at: string;
}

const InactiveStudentsNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<InactiveStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [notificationType, setNotificationType] = useState<'sms' | 'email'>('email');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

  useEffect(() => {
    fetchInactiveStudents();
  }, []);

  const fetchInactiveStudents = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const token = getAccessToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/get_inactive_student_notifications.php`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching inactive students:', error);
      setMessage({ type: 'error', text: 'Failed to fetch inactive students' });
    } finally {
      setLoading(false);
    }
  };

  const refreshInactiveList = async () => {
    try {
      setRefreshing(true);
      const token = getAccessToken();
      await axios.get(
        `${API_BASE_URL}/admin/notify_inactive_students.php`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchInactiveStudents(true);
      setMessage({ type: 'success', text: 'Inactive students list refreshed' });
    } catch (error) {
      console.error('Error refreshing inactive students:', error);
      setMessage({ type: 'error', text: 'Failed to refresh inactive students' });
    } finally {
      setRefreshing(false);
    }
  };

  const sendNotifications = async () => {
    if (selectedStudents.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one student' });
      return;
    }

    try {
      setSendingNotifications(true);
      const token = getAccessToken();

      for (const studentId of selectedStudents) {
        const notif = notifications.find(n => n.student_id === studentId);
        if (!notif) continue;

        const payload = {
          student_id: studentId,
          email: notif.email,
          phone: '', // Will need phone number from database
          message: `Hello ${notif.first_name}, you have not logged into the university portal yet. Please log in to access your courses and grades. If you need assistance, contact support.`,
          type: notificationType
        };

        await axios.post(
          `${API_BASE_URL}/admin/send_student_notification.php`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage({ 
        type: 'success', 
        text: `${notificationType.toUpperCase()} notifications sent to ${selectedStudents.length} student(s)` 
      });
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error sending notifications:', error);
      setMessage({ type: 'error', text: 'Failed to send notifications' });
    } finally {
      setSendingNotifications(false);
    }
  };

  const toggleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === notifications.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(notifications.map(n => n.student_id));
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="bg-gray-900/30 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
        <RefreshCw className="inline animate-spin text-gold-500 mb-4" size={24} />
        <p className="text-gray-400">Loading inactive students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            Inactive Students Notification
          </h2>
          <p className="text-gray-400 text-sm mt-1">Monitor and notify students who haven't logged in</p>
        </div>
        <button
          onClick={refreshInactiveList}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/30 rounded-lg text-gold-400 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Inactive</p>
          <h3 className="text-3xl font-bold text-red-400 mt-2">{notifications.length}</h3>
        </div>
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Unread Notifications</p>
          <h3 className="text-3xl font-bold text-yellow-400 mt-2">{unreadCount}</h3>
        </div>
        <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Selected for Notification</p>
          <h3 className="text-3xl font-bold text-green-400 mt-2">{selectedStudents.length}</h3>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={selectedStudents.length === notifications.length && notifications.length > 0}
              onChange={selectAll}
              className="w-4 h-4 accent-gold-500"
            />
            <label className="text-sm text-gray-300">
              {selectedStudents.length === notifications.length && notifications.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Notify via:</label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as 'sms' | 'email')}
              className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-white focus:border-gold-500"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <button
            onClick={sendNotifications}
            disabled={selectedStudents.length === 0 || sendingNotifications}
            className="flex items-center gap-2 px-6 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition disabled:opacity-50"
          >
            <Send size={18} />
            {sendingNotifications ? 'Sending...' : 'Send Notifications'}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-gray-900/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === notifications.length && notifications.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 accent-gold-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Notification</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr
                  key={notif.student_id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(notif.student_id)}
                      onChange={() => toggleSelectStudent(notif.student_id)}
                      className="w-4 h-4 accent-gold-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">
                      {notif.first_name} {notif.last_name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{notif.email}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-400 line-clamp-2">{notif.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      notif.status === 'unread'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {notif.status === 'unread' ? <Clock size={12} /> : <CheckCircle size={12} />}
                      {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={32} />
            <p className="text-gray-400">All students have logged in! No inactive students.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InactiveStudentsNotification;
