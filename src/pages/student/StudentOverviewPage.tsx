import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import StudentProfileCard from '../../components/student/StudentProfileCard';
import StatsCard from '../../components/ui/StatsCard';
import { LayoutDashboard, BookOpen, CheckSquare, Clock, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';

const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = getAccessToken();
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE_URL}/student/student_stats.php`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error: any) {
        console.error('Error fetching student data:', error);
        setError(error.response?.data?.message || 'Failed to load overview data');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/student/dashboard' },
    { label: 'Registration', icon: <BookOpen size={20} />, href: '/student/registration' },
    { label: 'Grades', icon: <CheckSquare size={20} />, href: '/student/grades' },
    { label: 'Attendance', icon: <Clock size={20} />, href: '/student/attendance' },
    { label: 'Fees', icon: <CreditCard size={20} />, href: '/student/fees' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-200 dark:border-blue-400 border-t-blue-600 dark:border-t-blue-200 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 text-slate-900 dark:text-white">
      <Navbar
        items={[]}
        rightContent={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        }
      />

      <div className="flex pt-16">
        <Sidebar
          items={menuItems}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className={`flex-1 transition-all duration-300 p-6 md:p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Academic Overview
              </h1>
              <p className="text-slate-600 dark:text-slate-300">Your complete academic profile and semester summary</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div variants={itemVariants}>
              <StudentProfileCard
                firstName={user?.firstName || 'Student'}
                lastName={user?.lastName || 'User'}
                email={user?.email}
                studentId={data?.studentId || 'N/A'}
                gpa={parseFloat(data?.stats?.gpa || '0')}
                major={data?.major || 'Engineering'}
                enrollmentYear={2022}
              />
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Registered Courses */}
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Registered Courses"
                  value={parseInt(data?.stats?.totalCourses || '0')}
                  icon={<BookOpen size={24} />}
                  color="blue"
                  trend={{ value: 12, isPositive: true }}
                  description="Current semester enrollment"
                />
              </motion.div>

              {/* Attendance Rate */}
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Attendance Rate"
                  value={parseFloat(data?.stats?.attendancePercentage || '0')}
                  suffix="%"
                  icon={<Clock size={24} />}
                  color="success"
                  trend={{ value: 5, isPositive: true }}
                  description="Average attendance"
                />
              </motion.div>

              {/* Submitted Grades */}
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Submitted Grades"
                  value={parseInt(data?.stats?.submittedGrades || '0')}
                  icon={<CheckSquare size={24} />}
                  color="purple"
                  trend={{ value: 8, isPositive: true }}
                  description="Grades received"
                />
              </motion.div>

              {/* Outstanding Fees */}
              <motion.div variants={itemVariants}>
                <StatsCard
                  title="Outstanding Fees"
                  value={parseFloat(data?.stats?.pendingFees || '0')}
                  prefix="$"
                  icon={<CreditCard size={24} />}
                  color="warning"
                  trend={{ value: 3, isPositive: false }}
                  description="Amount due"
                />
              </motion.div>
            </motion.div>

            {/* Additional Info Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Pending Grades */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border-2 border-blue-200/50 dark:border-blue-400/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300 rounded-full opacity-5 -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Pending Grades</h3>
                    <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data?.stats?.pendingGrades || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Grades awaiting submission</p>
                </div>
              </motion.div>

              {/* Completed Assignments */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-400/20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300 rounded-full opacity-5 -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Assignments Done</h3>
                    <CheckSquare size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data?.stats?.completedAssignments || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Successfully submitted</p>
                </div>
              </motion.div>

              {/* Status */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border-2 border-amber-200/50 dark:border-amber-400/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300 rounded-full opacity-5 -mr-16 -mt-16" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Academic Status</h3>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Good Standing</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Eligible to register</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-400/20"
              >
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default StudentOverviewPage;
