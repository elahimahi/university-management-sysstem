import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  CheckCircle,
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader,
  Calendar,
} from 'lucide-react';
import { getAccessToken } from '../../utils/auth.utils';
import toast, { Toaster } from 'react-hot-toast';


interface StudentSubmission {
  student_name: string;
  assignment_title: string;
  course_code: string;
  submitted_at: string;
  feedback_status: string;
  feedback_notes?: string;
}

interface DatabaseStats {
  users: number;
  courses: number;
  enrollments: number;
  assignments: number;
  submissions: number;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

const FacultyReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_assignments: 0,
    total_submissions: 0,
    pending_grading: 0,
    graded: 0,
    overall_submission_rate: 0
  });
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    users: 0,
    courses: 0,
    enrollments: 0,
    assignments: 0,
    submissions: 0
  });

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);

      const reportResponse = await fetch(`${API_BASE_URL}/debug/submission-flow-complete.php`);
      const data = await reportResponse.json();

      if (data.submissions_detail) {
        setSubmissions(data.submissions_detail);

        setStats({
          total_assignments: data.record_counts.course_assignments || 0,
          total_submissions: data.submissions_detail?.length || 0,
          pending_grading: data.grading_summary?.pending_grading || 0,
          graded: data.grading_summary?.graded || 0,
          overall_submission_rate: data.assignments_summary?.submission_rate 
            ? parseFloat(data.assignments_summary.submission_rate) 
            : 0
        });
      }

      if (data.record_counts) {
        setDbStats({
          users: data.record_counts.users || 0,
          courses: data.record_counts.courses || 0,
          enrollments: data.record_counts.enrollments || 0,
          assignments: data.record_counts.course_assignments || 0,
          submissions: data.record_counts.assignment_submissions || 0
        });
      }

      toast.success('Reports refreshed successfully');
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-4 md:p-8"
    >
      <Toaster position="top-right" />

      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <BarChart className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest">Faculty Dashboard</p>
              <h1 className="text-5xl md:text-6xl font-black text-white mt-2">Analytics & Reports</h1>
            </div>
          </motion.div>
          <motion.p variants={itemVariants} className="text-cyan-200/80 text-lg max-w-3xl">
            Comprehensive view of submissions, grading status, and database statistics. Real-time insights from SQL Server.
          </motion.p>
        </motion.div>

        {/* Main Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: FileText, label: 'Total Assignments', value: stats.total_assignments, color: 'from-blue-500 to-blue-600' },
            { icon: CheckCircle2, label: 'Submissions', value: stats.total_submissions, color: 'from-cyan-500 to-cyan-600' },
            { icon: AlertCircle, label: 'Pending Grading', value: stats.pending_grading, color: 'from-amber-500 to-amber-600' },
            { icon: TrendingUp, label: 'Submission Rate', value: `${stats.overall_submission_rate.toFixed(0)}%`, color: 'from-emerald-500 to-emerald-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ translateY: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300`} />
              <div className="relative bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Submissions Section */}
        {!loading && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-12 group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900/80 to-slate-800/60 px-8 py-6 border-b border-slate-700">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Recent Submissions</h2>
                <span className="ml-auto text-slate-400 text-sm font-semibold">
                  {submissions.length > 0 ? `Showing ${Math.min(20, submissions.length)} of ${submissions.length}` : 'No submissions'}
                </span>
              </div>

              {/* Content */}
              <div className="p-8">
                {submissions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <FileText className="w-20 h-20 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No submissions yet</p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {submissions.slice(0, 20).map((sub, idx) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ x: 8, y: -2 }}
                        className="group/submission"
                      >
                        <div className="relative bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-5 transition">
                          <motion.div
                            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.3 }}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                            {/* Student Name */}
                            <div className="lg:col-span-1">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Student</p>
                              <p className="text-white font-semibold text-sm">{sub.student_name}</p>
                            </div>

                            {/* Assignment */}
                            <div className="lg:col-span-1">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Assignment</p>
                              <p className="text-cyan-300 font-semibold text-sm truncate">{sub.assignment_title}</p>
                            </div>

                            {/* Course */}
                            <div className="lg:col-span-1">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Course</p>
                              <p className="text-blue-300 font-bold text-sm">{sub.course_code}</p>
                            </div>

                            {/* Submitted Date */}
                            <div className="lg:col-span-1">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Submitted</p>
                              <p className="text-slate-300 text-sm">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                            </div>

                            {/* Feedback Status */}
                            <div className="lg:col-span-1">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Status</p>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                  sub.feedback_status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {sub.feedback_status === 'pending' ? '⏳ Pending' : '✓ Graded'}
                              </motion.div>
                            </div>

                            {/* Notes */}
                            <div className="lg:col-span-1">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Notes</p>
                              <p className="text-slate-400 text-sm truncate">{sub.feedback_notes || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Database Stats Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="group relative mb-12"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
          <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900/80 to-slate-800/60 px-8 py-6 border-b border-slate-700">
              <BarChart className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">SQL Server Database Status</h2>
            </div>

            {/* Content */}
            <div className="p-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                {[
                  { icon: Users, label: 'Users', value: dbStats.users, color: 'from-blue-500 to-blue-600' },
                  { icon: BookOpen, label: 'Courses', value: dbStats.courses, color: 'from-emerald-500 to-emerald-600' },
                  { icon: FileText, label: 'Enrollments', value: dbStats.enrollments, color: 'from-purple-500 to-purple-600' },
                  { icon: CheckCircle2, label: 'Assignments', value: dbStats.assignments, color: 'from-amber-500 to-amber-600' },
                  { icon: TrendingUp, label: 'Submissions', value: dbStats.submissions, color: 'from-pink-500 to-pink-600' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="group/db relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-10 group-hover/db:opacity-20 transition`} />
                    <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                      <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                      <p className="text-white text-3xl font-bold">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center"
        >
          <motion.button
            onClick={loadReportData}
            disabled={loading}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-2xl transition-all shadow-lg text-lg"
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Loader className="w-6 h-6" />
                </motion.div>
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-6 h-6" />
                Refresh Reports & SQL Data
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FacultyReportsPage;
