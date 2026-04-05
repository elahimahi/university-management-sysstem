import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { Clock, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

interface AttendanceStats {
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  course_name: string;
  course_code: string;
  attendance_percentage: number;
  total_attendance_marks?: number;
}

interface AttendanceRecord {
  date: string;
  status: string;
  course_name: string;
  course_code: string;
  attendance_marks?: number;
}

const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendanceStats[]>([]);
  const [recent, setRecent] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const token = getAccessToken();
        const response = await axios.post(
          `${API_BASE_URL}/student/attendance-stats`,
          { student_id: user.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStats(response.data.statistics || []);
        setRecent(response.data.recent_records || []);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching attendance data:', error);
        setError(error.response?.data?.error || 'Failed to load attendance data');
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      case 'late':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8"
    >
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.55)] mb-10"
        >
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute left-10 top-16 h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                <Clock className="w-5 h-5" />
                Attendance
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white">Monitor your attendance with confidence</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                See your performance by course, track important deadlines, and stay ahead with clean analytics.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Courses</p>
                <p className="mt-3 text-3xl font-bold text-cyan-300">{stats.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Records</p>
                <p className="mt-3 text-3xl font-bold text-emerald-300">{recent.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
                <p className="mt-3 text-3xl font-bold text-amber-300">Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-semibold">Something went wrong</p>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {stats.length > 0 && (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Key insights</h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <p>Looks like your attendance is being tracked consistently across all courses.</p>
                <p>Tap each course card below to review its attendance ratio and status.</p>
                <p className="text-slate-400">Keep an eye on low-percentage classes to avoid any gaps.</p>
              </div>
            </motion.div>
          </div>
        )}

        {stats.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.course_code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{stat.course_code}</h3>
                    <p className="text-sm text-slate-400">{stat.course_name}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    stat.attendance_percentage >= 75 ? 'bg-emerald-500/15 text-emerald-300' : stat.attendance_percentage >= 60 ? 'bg-amber-500/15 text-amber-300' : 'bg-red-500/15 text-red-300'
                  }`}>
                    {stat.attendance_percentage}%
                  </span>
                </div>
                <div className="mb-5 h-36 rounded-3xl bg-slate-900/80 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: stat.present },
                          { name: 'Late', value: stat.late },
                          { name: 'Absent', value: stat.absent },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#fbbf24" />
                        <Cell fill="#ef4444" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-3 text-sm text-slate-400">
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="font-semibold text-white">Present</p>
                    <p className="mt-2 text-xl font-bold text-emerald-300">{stat.present}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="font-semibold text-white">Late</p>
                    <p className="mt-2 text-xl font-bold text-amber-300">{stat.late}</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="font-semibold text-white">Absent</p>
                    <p className="mt-2 text-xl font-bold text-red-300">{stat.absent}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      {/* Recent Attendance Records */}
      {recent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Records (Last 30 days)</h2>
          <div className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-blue-100 dark:border-navy-700 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-navy-600">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Course</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Marks</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((record, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/50"
                  >
                    <td className="py-3 px-4">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div>{record.course_code}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{record.course_name}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusBadgeColor(
                          record.status
                        )}`}
                      >
                        {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.attendance_marks !== undefined ? (
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                          {record.attendance_marks} pts
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.length === 0 && recent.length === 0 && !error && (
        <div className="rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-navy-800 dark:to-navy-900 p-8 border border-gray-200 dark:border-navy-700 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">No attendance records yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Your attendance will be displayed here once faculty marks it</p>
        </div>
      )}
      </div>
    </motion.div>
  );
};

export default StudentAttendancePage;
