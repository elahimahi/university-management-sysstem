import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BarChart, CheckCircle } from 'lucide-react';
import { getAccessToken } from '../../utils/auth.utils';
import toast from 'react-hot-toast';


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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 p-8 flex items-center justify-center">
        <p className="text-lg">Loading report data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-navy-900 dark:to-navy-800 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 mb-10 shadow-[0_35px_120px_rgba(79,70,229,0.2)]">
          <div className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-24 -bottom-10 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-3">📊 Faculty Reports</h1>
            <p className="text-slate-200">Submission and grading analytics from SQL Server, presented in a modern, animated dashboard.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Assignments</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total_assignments}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Submissions</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total_submissions}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending Grading</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.pending_grading}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Submission Rate</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.overall_submission_rate.toFixed(0)}%</p>
          </motion.div>
        </div>

        {/* Submissions Table */}
        <Card className="shadow-2xl border border-slate-200 dark:border-navy-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="text-center text-gray-500">No submissions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Student</th>
                      <th className="text-left py-2">Assignment</th>
                      <th className="text-left py-2">Course</th>
                      <th className="text-left py-2">Submitted At</th>
                      <th className="text-left py-2">Feedback Status</th>
                      <th className="text-left py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 20).map((sub, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-gray-50 dark:hover:bg-navy-800"
                      >
                        <td className="py-3">{sub.student_name}</td>
                        <td className="py-3">{sub.assignment_title}</td>
                        <td className="py-3">{sub.course_code}</td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={sub.feedback_status === 'pending' ? 'secondary' : 'default'}
                            className={
                              sub.feedback_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {sub.feedback_status === 'pending' ? 'Pending' : 'Graded'}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600 max-w-xs truncate">
                          {sub.feedback_notes || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SQL Server Database Stats */}
        <Card className="mt-8 shadow-2xl border border-slate-200 dark:border-navy-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart size={20} />
              🗄️ SQL Server Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-3xl font-bold text-blue-600">{dbStats.users}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-3xl font-bold text-green-600">{dbStats.courses}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <p className="text-sm text-gray-600">Enrollments</p>
                <p className="text-3xl font-bold text-purple-600">{dbStats.enrollments}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-3xl font-bold text-yellow-600">{dbStats.assignments}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-pink-50 rounded-lg border border-pink-200"
              >
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-3xl font-bold text-pink-600">{dbStats.submissions}</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={loadReportData} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            🔄 Refresh Reports & SQL Data
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyReportsPage;
