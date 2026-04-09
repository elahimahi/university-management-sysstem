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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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
      <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-navy-900 p-8"
    >
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-green-500" />
        <h1 className="text-3xl font-bold">Attendance</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Overall Attendance Summary */}
      {stats.length > 0 && (
        <div className="mb-8">
          {(() => {
            const totalClasses = stats.reduce((sum, stat) => sum + stat.total_classes, 0);
            const totalPresent = stats.reduce((sum, stat) => sum + stat.present, 0);
            const totalAbsent = stats.reduce((sum, stat) => sum + stat.absent, 0);
            const totalLate = stats.reduce((sum, stat) => sum + stat.late, 0);
            const overallPercentage = totalClasses > 0 
              ? Math.round((totalPresent / totalClasses) * 100 * 100) / 100 
              : 0;

            return (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 border border-blue-200 dark:border-blue-700 col-span-1 md:col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Overall Attendance</h3>
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{overallPercentage}%</div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{totalPresent} out of {totalClasses} classes</p>
                    </div>
                    <div className="text-right">
                      {overallPercentage >= 75 ? (
                        <div className="text-4xl">✅</div>
                      ) : overallPercentage >= 60 ? (
                        <div className="text-4xl">⚠️</div>
                      ) : (
                        <div className="text-4xl">❌</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        overallPercentage >= 75
                          ? 'bg-green-500'
                          : overallPercentage >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 border border-green-200 dark:border-green-700"
                >
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Present</h3>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{totalPresent}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 border border-yellow-200 dark:border-yellow-700"
                >
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Late</h3>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{totalLate}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-xl shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-6 border border-red-200 dark:border-red-700"
                >
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Absent</h3>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{totalAbsent}</div>
                </motion.div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Course Attendance Stats */}
      {stats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Attendance by Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.course_code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-green-100 dark:border-navy-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{stat.course_code}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.course_name}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${
                        stat.attendance_percentage >= 75
                          ? 'text-green-600'
                          : stat.attendance_percentage >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.attendance_percentage}%
                    </div>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="h-32 mb-4">
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
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
                    <div className="text-lg font-bold text-green-600">{stat.present}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Late</div>
                    <div className="text-lg font-bold text-yellow-600">{stat.late}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Absent</div>
                    <div className="text-lg font-bold text-red-600">{stat.absent}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-navy-600 text-sm text-gray-600 dark:text-gray-400">
                  Out of {stat.total_classes} classes
                </div>
                {stat.total_attendance_marks !== undefined && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Attendance Marks</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.total_attendance_marks}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
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
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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
    </motion.div>
  );
};

export default StudentAttendancePage;
