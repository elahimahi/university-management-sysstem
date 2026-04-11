import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { Clock, AlertCircle, TrendingUp, BookOpen, User, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8"
    >
      <Toaster position="top-right" />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-blue-900/40 to-slate-900/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl mb-12"
        >
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -left-20 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 px-5 py-3 mb-6"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                  <Clock className="w-5 h-5 text-cyan-300" />
                </motion.div>
                <span className="text-sm font-semibold text-cyan-200">Attendance Dashboard</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-4">
                Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Attendance</span> Story
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                Track your presence across all courses with detailed analytics, visual insights, and performance trends in real-time.
              </p>
            </motion.div>

            {/* Animated Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4 md:gap-6 sm:grid-cols-3 flex-shrink-0"
            >
              {[
                { label: 'Courses', value: stats.length, icon: '📚', color: 'from-blue-500 to-cyan-500' },
                { label: 'Records', value: recent.length, icon: '📋', color: 'from-emerald-500 to-blue-500' },
                { label: 'Status', value: 'Active', icon: '✨', color: 'from-amber-500 to-orange-500' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ translateY: -8, scale: 1.05 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-300`} />
                  <div className="relative rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-700 p-6 text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <p className="text-sm uppercase tracking-widest text-slate-400 font-semibold">{stat.label}</p>
                    <p className="mt-3 text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-900/10 backdrop-blur p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </motion.div>
              </div>
              <div>
                <p className="font-bold text-red-200">Something went wrong</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Course Statistics Cards */}
        {stats.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Course Attendance Analytics</h2>
              <p className="text-slate-400">Monitor your attendance performance across all enrolled courses</p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.course_code}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ translateY: -8 }}
                  className="group relative overflow-hidden rounded-3xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all duration-300" />
                  <div className="relative border border-cyan-500/20 group-hover:border-cyan-500/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur p-8 shadow-xl transition-all duration-300">
                    {/* Course Header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">{stat.course_code}</h3>
                        <p className="text-sm text-slate-400 mt-1">{stat.course_name}</p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className={`rounded-full px-4 py-2 font-bold text-sm whitespace-nowrap ${
                          stat.attendance_percentage >= 75
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : stat.attendance_percentage >= 60
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {stat.attendance_percentage}%
                      </motion.div>
                    </div>

                    {/* Pie Chart */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="mb-6 h-40 rounded-2xl bg-slate-800/50 p-4 border border-slate-700/50"
                    >
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
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Present', value: stat.present, color: 'from-emerald-500/20 to-emerald-600/20', textColor: 'text-emerald-300', icon: '✓' },
                        { label: 'Late', value: stat.late, color: 'from-amber-500/20 to-amber-600/20', textColor: 'text-amber-300', icon: '⏱' },
                        { label: 'Absent', value: stat.absent, color: 'from-red-500/20 to-red-600/20', textColor: 'text-red-300', icon: '✕' },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className={`rounded-2xl bg-gradient-to-br ${item.color} border border-slate-600/50 p-4 text-center hover:border-slate-500 transition-colors`}
                        >
                          <p className="text-2xl mb-2">{item.icon}</p>
                          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{item.label}</p>
                          <p className={`mt-2 text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Recent Attendance Records - Enhanced Table */}
        {recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Recent Attendance Records</h2>
              <p className="text-slate-400">Your attendance history from the last 30 days</p>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="overflow-x-auto relative z-10"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Date
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Course
                        </span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Status</span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Marks</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {recent.map((record, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <Calendar className="w-5 h-5 text-cyan-300" />
                              </motion.div>
                              <span className="text-slate-200 font-medium">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-semibold">{record.course_code}</p>
                              <p className="text-sm text-slate-400">{record.course_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${
                                record.status === 'present'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : record.status === 'absent'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : record.status === 'late'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                              }`}
                            >
                              {record.status ? record.status.toUpperCase() : 'N/A'}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {record.attendance_marks !== undefined ? (
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-bold text-sm border border-cyan-500/30"
                              >
                                {record.attendance_marks} pts
                              </motion.span>
                            ) : (
                              <span className="text-slate-500 font-medium">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {stats.length === 0 && recent.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/50 to-slate-950/50 backdrop-blur"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mb-6">
              <Clock className="w-16 h-16 text-slate-500 mx-auto" />
            </motion.div>
            <p className="text-xl font-semibold text-slate-300">No attendance records yet</p>
            <p className="text-slate-500 mt-2">Your attendance will be displayed here once faculty marks it</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentAttendancePage;
