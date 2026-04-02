import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Bell,
  LogOut,
  BookOpen,
  Clock,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import StudentProgressSubmit from '../../components/student/StudentProgressSubmit';
import StudentSubmissionHistory from '../../components/student/StudentSubmissionHistory';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = getAccessToken();
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/Database_Project/Database-main/Database-main/backend';
        const response = await axios.get(`${API_BASE_URL}/student/student_stats.php`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error: any) {
        console.error('Error fetching student data:', error);
        setError(error.response?.data?.message || 'Failed to connect to server. Please try again.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  const gpaValue = parseFloat(data?.stats?.gpa || '0');
  const gpaData = [{ name: 'GPA', value: gpaValue, fill: '#FFB347' }];

  if (error) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-white">
      <Navbar
        items={[]}
        rightContent={
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20">
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

        <main className={`flex-1 transition-all duration-300 p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  Welcome Back, <span className="text-blue-400">{user?.firstName}</span>
                </motion.h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <LogOut size={18} /> Logout
              </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Current GPA</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-gold-400">{data?.stats?.gpa || '0.00'}</h3>
                  <span className="text-green-400 text-sm font-semibold">+0.04 ▲</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <p className="text-sm text-gray-400 mb-3">Credits Progress</p>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold text-green-400">Completed: {data?.stats?.completedCredits || 0}</span>
                    <span className="text-xs font-semibold text-blue-400">In Progress: {data?.stats?.inProgressCredits || 0}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((data?.stats?.completedCredits || 0) / 140) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold text-blue-400">{data?.stats?.credits || 0}</h3>
                    <span className="text-xs text-gray-400">of 140</span>
                  </div>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Overall Attendance</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-green-400">{data?.stats?.attendance || '0%'}</h3>
                  <span className="text-xs text-gray-500">Above average</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* GPA & Analytics */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold-400">
                  <LayoutDashboard size={20} /> Semester Performance
                </h3>
                <div className="flex items-center justify-around h-48">
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius="70%" outerRadius="100%" data={gpaData} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={10} maxBarSize={15} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-bold text-2xl">{data?.stats?.gpa || '0.00'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gold-400"></div>
                      <span className="text-sm text-gray-300">Current GPA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-300">Target (4.0)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Trend */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                  <Clock size={20} /> Attendance Trends
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.attendanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" hide />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Courses */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                  <BookOpen size={20} /> Enrolled Courses
                </h3>

                {/* Active Courses */}
                {data?.currentCourses && data?.currentCourses.some((c: any) => c.status === 'active') && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">Currently Active</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data?.currentCourses?.filter((c: any) => c.status === 'active').map((course: any) => (
                        <div key={course.id} className="p-4 rounded-2xl bg-white/5 border border-blue-400/30 hover:border-blue-400/60 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 font-bold group-hover:scale-110 transition-transform">
                            {course.code.split('-')[0]}
                          </div>
                          <h4 className="font-bold mb-1 truncate">{course.title}</h4>
                          <p className="text-xs text-gray-400 mb-3">{course.code} • Prof. {course.instructor}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 uppercase tracking-wider font-bold">Active</span>
                            <span className="text-xs text-gray-400">{course.credits} Credits</span>
                          </div>
                          {/* Grade Display */}
                          {course.latest_grade ? (
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/30 text-center">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Current Grade</p>
                              <p className="text-sm font-bold text-blue-300">{course.latest_grade} <span className="text-[10px] text-gray-400">({parseFloat(course.latest_grade_point || 0).toFixed(2)})</span></p>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-gray-500/10 border border-gray-500/30 text-center">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">No grade yet</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Courses */}
                {data?.currentCourses && data?.currentCourses.some((c: any) => c.status === 'completed') && (
                  <div>
                    <p className="text-xs font-bold text-green-300 uppercase tracking-wider mb-3">✓ Completed</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data?.currentCourses?.filter((c: any) => c.status === 'completed').map((course: any) => (
                        <div key={course.id} className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/40 hover:border-green-400/70 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-3 font-bold group-hover:scale-110 transition-transform">
                            ✓
                          </div>
                          <h4 className="font-bold mb-1 truncate">{course.title}</h4>
                          <p className="text-xs text-gray-400 mb-3">{course.code} • Prof. {course.instructor}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 uppercase tracking-wider font-bold">Completed</span>
                            <span className="text-xs text-green-400 font-semibold">{course.credits} Credits ✓</span>
                          </div>
                          {/* Final Grade Display */}
                          {course.latest_grade ? (
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-400/30 text-center">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Final Grade</p>
                              <p className="text-sm font-bold text-green-300">{course.latest_grade} <span className="text-[10px] text-gray-400">({parseFloat(course.latest_grade_point || 0).toFixed(2)})</span></p>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-gray-500/10 border border-gray-500/30 text-center">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">No grade recorded</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!data?.currentCourses || data?.currentCourses.length === 0) && (
                  <div className="col-span-2 text-center py-10 text-gray-500">
                    No courses enrolled yet.
                  </div>
                )}
              </div>

              {/* Payments/Fees */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-gold-400 flex items-center gap-2">
                  <CreditCard size={20} /> Pending Fees
                </h3>
                <div className="space-y-4 mb-6">
                  {data?.fees?.structure?.map((fee: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-medium">{fee.label}</p>
                        <p className="text-[10px] text-gray-500">Due in 30 days</p>
                      </div>
                      <p className="font-bold text-gold-400">${fee.amount}</p>
                    </div>
                  ))}
                  {(!data?.fees?.structure || data?.fees?.structure.length === 0) && (
                    <div className="text-center py-4 text-green-400 text-sm">
                      All fees paid! 🎉
                    </div>
                  )}
                </div>
                {data?.fees.structure.length > 0 && (
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20">
                    Pay Total Balance
                  </button>
                )}
              </div>
            </div>

            {/* Completed Courses Summary */}
            {data?.currentCourses && data?.currentCourses.some((c: any) => c.status === 'completed') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              >
                <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-green-400">Courses Completed</h3>
                    <CheckSquare className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-4xl font-bold text-green-300 mb-2">
                    {data?.currentCourses?.filter((c: any) => c.status === 'completed').length || 0}
                  </div>
                  <p className="text-sm text-gray-400">
                    {data?.stats?.completedCredits || 0} credits earned
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-blue-400">In Progress</h3>
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-4xl font-bold text-blue-300 mb-2">
                    {data?.currentCourses?.filter((c: any) => c.status === 'active').length || 0}
                  </div>
                  <p className="text-sm text-gray-400">
                    {data?.stats?.inProgressCredits || 0} credits in progress
                  </p>
                </div>
              </motion.div>
            )}

            {/* Upcoming Deadlines */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 mb-8">
              <h3 className="text-xl font-bold mb-6 text-red-400 flex items-center gap-2">
                <AlertCircle size={20} /> Upcoming Deadlines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data?.deadlines?.map((deadline: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-l-4 border-red-500/50">
                    <p className="text-xs text-red-400 font-bold mb-1 uppercase tracking-wider">{deadline.date}</p>
                    <h4 className="font-bold text-sm mb-1">{deadline.title}</h4>
                    <p className="text-[10px] text-gray-500">{deadline.type}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Progress Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Your Progress & Submissions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progress Submission Form */}
                <div>
                  {data?.currentCourses && data.currentCourses.length > 0 ? (
                    <StudentProgressSubmit
                      enrollmentId={data.currentCourses[0]?.enrollment_id || 1}
                      courseName={data.currentCourses[0]?.title || 'Course'}
                      onSubmitSuccess={() => window.location.reload()}
                    />
                  ) : (
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
                      <p className="text-gray-400">Enroll in courses to start submitting progress</p>
                    </div>
                  )}
                </div>

                {/* Submission History */}
                <div>
                  <StudentSubmissionHistory />
                </div>
              </div>
            </div>

            {/* Recent Grades */}
            {data?.recentGrades && data?.recentGrades.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 mb-8">
                <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
                  <CheckSquare size={20} /> Recent Grades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data?.recentGrades?.map((grade: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 hover:border-green-400/50 transition-all"
                    >
                      <p className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wider">Grade</p>
                      <h4 className="font-bold text-lg mb-1 truncate text-white">{grade.subject}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-400">{grade.grade}</span>
                        <span className="text-xs text-gray-400">{grade.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
