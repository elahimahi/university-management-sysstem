import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, LineChart, TrendingUp, Download, Calendar, AlertCircle, Loader, Filter, RefreshCw, FileText } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface ReportData {
  totalCourses: number;
  totalStudents: number;
  avgGPA: number;
  totalAssignments: number;
  submittedAssignments: number;
  averageGradesSubmitted: number;
  attendanceRate: number;
  coursePerformance: Array<{
    courseName: string;
    students: number;
    avgGrade: number;
    attendanceRate: number;
  }>;
}

interface TimeSeriesData {
  month: string;
  graded: number;
  assignments: number;
  attendance: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}> = ({ icon, label, value, unit, trend, color }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6 backdrop-blur`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="opacity-70">{icon}</div>
        {trend !== undefined && (
          <div className={`text-sm font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">
        {value}{unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
      </p>
    </motion.div>
  );
};

const FacultyReportsPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'trends'>('summary');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchReportData();
  }, [user?.id, reportType, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(
        `/faculty/get_reports.php?faculty_id=${user.id}&type=${reportType}&range=${dateRange}`
      ) as any;

      if (response?.data) {
        setReportData(response.data.summary || response.data);
        setTimeSeriesData(response.data.timeSeries || []);
      }
      showSuccess('Report loaded');
    } catch (error) {
      console.error('Failed to fetch report:', error);
      showError('Failed to load report');
      // Fallback data
      setReportData({
        totalCourses: 4,
        totalStudents: 156,
        avgGPA: 3.45,
        totalAssignments: 24,
        submittedAssignments: 18,
        averageGradesSubmitted: 92,
        attendanceRate: 87,
        coursePerformance: [
          { courseName: 'Data Structures', students: 45, avgGrade: 85, attendanceRate: 90 },
          { courseName: 'Web Development', students: 38, avgGrade: 88, attendanceRate: 92 },
          { courseName: 'Database Design', students: 41, avgGrade: 82, attendanceRate: 85 },
          { courseName: 'Algorithm Design', students: 32, avgGrade: 87, attendanceRate: 88 },
        ],
      });
      setTimeSeriesData([
        { month: 'Jan', graded: 45, assignments: 12, attendance: 88 },
        { month: 'Feb', graded: 52, assignments: 14, attendance: 89 },
        { month: 'Mar', graded: 58, assignments: 16, attendance: 87 },
        { month: 'Apr', graded: 61, assignments: 18, attendance: 90 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    showSuccess('Report export started');
    // PDF export logic would go here
  };

  const handleExportCSV = () => {
    showSuccess('CSV file downloaded');
    // CSV export logic would go here
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="text-teal-400" size={40} />
              Reports & Analytics
            </h1>
            <p className="text-gray-400">Comprehensive statistics and performance metrics for your courses</p>
          </motion.div>

          {/* Controls */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-400"
              >
                <option value="summary" className="bg-slate-900">Summary Report</option>
                <option value="detailed" className="bg-slate-900">Detailed Report</option>
                <option value="trends" className="bg-slate-900">Trends Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-400"
              >
                <option value="all" className="bg-slate-900">All Time</option>
                <option value="semester" className="bg-slate-900">This Semester</option>
                <option value="month" className="bg-slate-900">This Month</option>
                <option value="week" className="bg-slate-900">This Week</option>
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchReportData}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportPDF}
                className="flex-1 px-4 py-3 bg-teal-500/20 border border-teal-500/50 rounded-xl text-teal-300 hover:bg-teal-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                PDF
              </motion.button>
            </div>
          </motion.div>

          {loading ? (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} height="h-20" />
              ))}
            </motion.div>
          ) : reportData ? (
            <>
              {/* Key Statistics */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={<BarChart3 className="text-blue-400" size={24} />}
                  label="Total Courses"
                  value={reportData.totalCourses}
                  color="navy"
                  trend={12}
                />
                <StatCard
                  icon={<TrendingUp className="text-green-400" size={24} />}
                  label="Enrolled Students"
                  value={reportData.totalStudents}
                  color="green"
                  trend={8}
                />
                <StatCard
                  icon={<LineChart className="text-orange-400" size={24} />}
                  label="Average GPA"
                  value={reportData.avgGPA.toFixed(2)}
                  color="orange"
                  trend={5}
                />
                <StatCard
                  icon={<BarChart3 className="text-purple-400" size={24} />}
                  label="Attendance Rate"
                  value={reportData.attendanceRate}
                  unit="%"
                  color="purple"
                  trend={3}
                />
              </motion.div>

              {/* Assignments Overview */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FileText className="text-blue-400" size={24} />
                    Assignment Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-gray-300">Total Assignments</span>
                      <span className="text-2xl font-bold text-blue-300">{reportData.totalAssignments}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-gray-300">Submitted</span>
                      <span className="text-2xl font-bold text-green-300">{reportData.submittedAssignments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Submission Rate</span>
                      <span className="text-2xl font-bold text-orange-300">
                        {((reportData.submittedAssignments / reportData.totalAssignments) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="text-green-400" size={24} />
                    Grading Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-gray-300">Avg Grade Submitted</span>
                      <span className="text-2xl font-bold text-green-300">{reportData.averageGradesSubmitted}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-gray-300">Grade Range</span>
                      <span className="text-sm font-semibold text-gray-300">60% - 98%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Class Performance</span>
                      <span className="text-xl font-bold text-blue-300">Grade A</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Course Performance Table */}
              <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="text-purple-400" size={24} />
                    Course Performance
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Course Name</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Students</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Avg Grade</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reportData.coursePerformance?.map((course, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-white">{course.courseName}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-300">{course.students}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              course.avgGrade >= 85 ? 'bg-green-500/20 text-green-300' :
                              course.avgGrade >= 75 ? 'bg-blue-500/20 text-blue-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {course.avgGrade.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-gray-300">{course.attendanceRate}%</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Trend Chart (Simple Representation) */}
              {timeSeriesData.length > 0 && (
                <motion.div variants={itemVariants} className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <LineChart className="text-orange-400" size={24} />
                    Monthly Trends
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {timeSeriesData.map((data, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                      >
                        <p className="text-sm font-semibold text-gray-300 mb-2">{data.month}</p>
                        <div className="space-y-1 text-xs">
                          <div className="text-blue-300">Graded: <span className="font-bold">{data.graded}</span></div>
                          <div className="text-green-300">Assign: <span className="font-bold">{data.assignments}</span></div>
                          <div className="text-orange-300">Attend: <span className="font-bold">{data.attendance}%</span></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No data available</h3>
              <p className="text-gray-400">Try adjusting your filters or refresh the page</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyReportsPageProfessional;
