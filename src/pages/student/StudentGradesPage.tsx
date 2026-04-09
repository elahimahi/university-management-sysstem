import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, TrendingUp, LayoutDashboard, BookOpen, Clock, CreditCard, Bell } from 'lucide-react';
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

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/student/dashboard' },
    { label: 'Registration', icon: <BookOpen size={20} />, href: '/student/registration' },
    { label: 'Grades', icon: <CheckSquare size={20} />, href: '/student/grades' },
    { label: 'Attendance', icon: <Clock size={20} />, href: '/student/attendance' },
    { label: 'Fees', icon: <CreditCard size={20} />, href: '/student/fees' },
  ];

  useEffect(() => {
    const fetchGradesData = async () => {
      try {
        const token = getAccessToken();
<<<<<<< HEAD
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
=======
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db
        
        const response = await axios.get(`${API_BASE_URL}/student/student_stats.php`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extract courses with grades
        const coursesWithGrades = response.data.currentCourses || [];
        setCourses(coursesWithGrades);
        
        // Extract recent grades
        setGrades(response.data.recentGrades || []);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching grades:', error);
        setError(error.response?.data?.message || 'Failed to fetch grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGradesData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-cyan-400"></div>
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
          <main className="p-8 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.45)] backdrop-blur-xl mb-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-3 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                      <CheckSquare size={18} />
                      My Grades
                    </div>
                    <h1 className="mt-4 text-4xl font-bold text-white">Your performance at a glance</h1>
                    <p className="mt-3 max-w-2xl text-slate-400">Track your enrolled course grades with animated charts and crisp grade summaries.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Courses</p>
                      <p className="mt-3 text-3xl font-bold text-cyan-300">{courses.length}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recent</p>
                      <p className="mt-3 text-3xl font-bold text-amber-300">{grades.length}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
                      <p className="mt-3 text-3xl font-bold text-lime-300">{courses.length ? 'Active' : 'Empty'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-200">
                {error}
              </motion.div>
            )}

            {courses.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-12 text-center text-slate-400 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
                <p className="text-xl font-semibold text-white">No course enrollments yet.</p>
                <p className="mt-3 text-slate-400">Start by registering for courses to see your grade dashboard.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
                >
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 text-cyan-300 font-semibold text-lg">
                      <TrendingUp size={24} />
                      Course Grades
                    </div>
                    <p className="text-sm text-slate-400">Sorted by your latest enrollment status for easy review.</p>
                  </div>
                  <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
                    <table className="min-w-full divide-y divide-white/5 text-sm text-slate-300">
                      <thead className="bg-slate-950/90 text-slate-400">
                        <tr>
                          <th className="py-4 px-5 text-left font-semibold uppercase tracking-[0.2em]">Course</th>
                          <th className="py-4 px-5 text-left font-semibold uppercase tracking-[0.2em]">Code</th>
                          <th className="py-4 px-5 text-left font-semibold uppercase tracking-[0.2em]">Instructor</th>
                          <th className="py-4 px-5 text-center font-semibold uppercase tracking-[0.2em]">Status</th>
                          <th className="py-4 px-5 text-center font-semibold uppercase tracking-[0.2em]">Grade</th>
                          <th className="py-4 px-5 text-center font-semibold uppercase tracking-[0.2em]">GPA</th>
                          <th className="py-4 px-5 text-center font-semibold uppercase tracking-[0.2em]">Credits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {courses.map((course: any) => (
                          <tr key={course.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-5 font-semibold text-white">{course.title}</td>
                            <td className="py-4 px-5 text-slate-400">{course.code}</td>
                            <td className="py-4 px-5 text-slate-400">Prof. {course.instructor}</td>
                            <td className="py-4 px-5 text-center">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                course.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-cyan-500/15 text-cyan-300'
                              }`}>
                                {course.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-center font-semibold text-amber-300">
                              {course.latest_grade || 'No grade'}
                            </td>
                            <td className="py-4 px-5 text-center text-cyan-300 font-semibold">
                              {course.latest_grade_point ? parseFloat(course.latest_grade_point || 0).toFixed(2) : '—'}
                            </td>
                            <td className="py-4 px-5 text-center text-white font-semibold">{course.credits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {grades.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
                  >
                    <div className="mb-6 flex items-center gap-3 text-amber-300 font-semibold text-lg">
                      <TrendingUp size={24} />
                      Recent Grades
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {grades.map((grade: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center"
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{grade.subject}</p>
                          <p className="mt-5 text-4xl font-bold text-cyan-300">{grade.grade}</p>
                          <p className="mt-3 text-xs text-slate-500">{new Date(grade.time).toLocaleDateString()}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentGradesPage;
