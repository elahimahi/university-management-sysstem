import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  TrendingUp,
  LayoutDashboard,
  BookOpen,
  Clock,
  CreditCard,
  Bell,
  Star,
  Award,
  Zap,
  GraduationCap,
  Loader,
  ArrowRight,
  Medal,
  BookMarked,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';

const StudentGradesPage: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any>([]);
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGradesData = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setIsRefreshing(true);
      }
      const token = getAccessToken();
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';
      
      const response = await axios.get(`${API_BASE_URL}/student/student_stats.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Extract courses with grades
      const coursesWithGrades = response.data.currentCourses || [];
      setCourses(coursesWithGrades);
      
      // Extract recent grades
      setGrades(response.data.recentGrades || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      if (!isSilent) {
        setError(error.response?.data?.message || 'Failed to fetch grades');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGradesData(true);

    // Set up polling interval - refresh every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchGradesData(true);
    }, 15000); // 15 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/student/dashboard' },
    { label: 'Registration', icon: <BookOpen size={20} />, href: '/student/registration' },
    { label: 'Grades', icon: <CheckSquare size={20} />, href: '/student/grades' },
    { label: 'Attendance', icon: <Clock size={20} />, href: '/student/attendance' },
    { label: 'Fees', icon: <CreditCard size={20} />, href: '/student/fees' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <GraduationCap className="w-16 h-16 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-white">
      <Navbar
        items={[]}
        rightContent={
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-white/10">
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
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <main className="p-8 max-w-7xl mx-auto relative">
            {/* Animated background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
              <motion.div
                animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl"
              />
              <motion.div
                animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
                transition={{ duration: 18, repeat: Infinity }}
                className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 blur-3xl"
              />
            </div>

            {/* Hero Header */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <GraduationCap className="w-12 h-12 text-cyan-400" />
                  </motion.div>
                  <div>
                    <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest">Student Dashboard</p>
                    <h1 className="text-5xl md:text-6xl font-black text-white mt-2">Grade Performance</h1>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => fetchGradesData(false)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  {lastUpdated && (
                    <p className="text-xs text-slate-400">
                      {isRefreshing ? '🔄 Updating...' : `✓ ${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago`}
                    </p>
                  )}
                </div>
              </motion.div>
              <motion.p variants={itemVariants} className="text-cyan-200/80 text-lg max-w-3xl">
                Track your academic performance across all enrolled courses with detailed grade analytics and insights.
              </motion.p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
            >
              {[
                { icon: BookMarked, label: 'Enrolled Courses', value: courses.length, color: 'from-blue-500 to-blue-600' },
                { icon: Award, label: 'Recent Grades', value: grades.length, color: 'from-amber-500 to-amber-600' },
                { icon: CheckSquare, label: 'Status', value: courses.length > 0 ? 'Active' : 'No Courses', color: 'from-emerald-500 to-emerald-600' },
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

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/50 to-pink-500/50 rounded-3xl blur opacity-75" />
                <div className="relative bg-slate-900/90 backdrop-blur border border-red-700 rounded-3xl p-6 shadow-2xl">
                  <p className="text-red-300 font-semibold">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {courses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-3xl"
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <BookMarked className="w-24 h-24 text-slate-500 mx-auto mb-4" />
                </motion.div>
                <p className="text-2xl font-bold text-white mb-2">📚 No Courses Yet</p>
                <p className="text-slate-300">Register for courses to see your grade dashboard</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Course Grades */}
                <motion.div
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
                  <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900/80 to-slate-800/60 px-8 py-6 border-b border-slate-700">
                      <TrendingUp className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-2xl font-bold text-white">Course Grades</h2>
                    </div>

                    {/* Courses Grid */}
                    <div className="p-8">
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {courses.map((course: any, idx: number) => (
                          <motion.div
                            key={course.id}
                            variants={itemVariants}
                            whileHover={{ y: -4, x: 8 }}
                            className="group/course relative"
                          >
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover/course:opacity-100 blur transition duration-300" />

                            <div className="relative bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 rounded-3xl p-6 transition">
                              <motion.div
                                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                              />

                              {/* Course Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white group-hover/course:text-cyan-300 transition mb-2">
                                    {course.title}
                                  </h3>
                                  <p className="text-sm text-slate-400">{course.code}</p>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className="p-2 bg-cyan-500/20 rounded-xl"
                                >
                                  <Star className="w-5 h-5 text-cyan-400" />
                                </motion.div>
                              </div>

                              {/* Divider */}
                              <div className="h-px bg-gradient-to-r from-slate-700 to-transparent mb-4" />

                              {/* Course Details */}
                              <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-400">Instructor</span>
                                  <span className="text-sm font-semibold text-white">Prof. {course.instructor}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-400">Status</span>
                                  <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                      course.status === 'completed'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-cyan-500/20 text-cyan-300'
                                    }`}
                                  >
                                    {course.status}
                                  </motion.span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-400">Credits</span>
                                  <span className="text-sm font-semibold text-white">{course.credits}</span>
                                </div>
                              </div>

                              {/* Grade Section */}
                              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
                                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-2">Letter Grade</p>
                                <p className="text-4xl font-black text-amber-300 mb-2">
                                  {course.latest_grade || '—'}
                                </p>
                                <p className="text-sm text-amber-200">
                                  GPA: {course.latest_grade_point ? parseFloat(course.latest_grade_point || 0).toFixed(2) : '—'}
                                </p>
                              </div>

                              {/* View Details Button */}
                              <motion.button
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Grades */}
                {grades.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="group relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
                    <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900/80 to-slate-800/60 px-8 py-6 border-b border-slate-700">
                        <Award className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-white">Recent Grades</h2>
                      </div>

                      {/* Grades Grid */}
                      <div className="p-8">
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                          {grades.map((grade: any, idx: number) => (
                            <motion.div
                              key={idx}
                              variants={itemVariants}
                              whileHover={{ scale: 1.08, y: -4 }}
                              className="group/grade relative"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover/grade:opacity-100 transition" />
                              <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">{grade.subject}</p>
                                <p className="text-5xl font-black text-amber-300 mb-3">{grade.grade}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(grade.time).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentGradesPage;
