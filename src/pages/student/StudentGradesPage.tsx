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
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
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
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <main className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                  <CheckSquare className="w-10 h-10 text-blue-400" />
                  My Grades
                </h1>
                <p className="text-gray-400">View your grades for all enrolled courses</p>
              </motion.div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                {error}
              </div>
            )}

            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No course enrollments yet. Start by registering for courses.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* All Courses Grades Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 rounded-3xl border border-white/10"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gold-400">
                    <TrendingUp size={24} /> Course Grades
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Course</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Code</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Instructor</th>
                          <th className="text-center py-3 px-4 text-gray-400 font-semibold">Status</th>
                          <th className="text-center py-3 px-4 text-gray-400 font-semibold">Latest Grade</th>
                          <th className="text-center py-3 px-4 text-gray-400 font-semibold">GPA</th>
                          <th className="text-center py-3 px-4 text-gray-400 font-semibold">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course: any) => (
                          <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-semibold text-white">{course.title}</td>
                            <td className="py-3 px-4 text-gray-400">{course.code}</td>
                            <td className="py-3 px-4 text-gray-400">Prof. {course.instructor}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                course.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {course.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {course.latest_grade ? (
                                <span className="font-bold text-lg text-gold-400">{course.latest_grade}</span>
                              ) : (
                                <span className="text-gray-500 italic">No grade</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {course.latest_grade_point ? (
                                <span className="font-bold text-blue-300">
                                  {parseFloat(course.latest_grade_point || 0).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-500 italic">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center text-white font-semibold">
                              {course.credits}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Grade Statistics */}
                {grades.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 rounded-3xl border border-white/10"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-gold-400">Recent Grades</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {grades.map((grade: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                        >
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{grade.subject}</p>
                          <p className="text-3xl font-bold text-blue-400 mb-1">{grade.grade}</p>
                          <p className="text-xs text-gray-500">{new Date(grade.time).toLocaleDateString()}</p>
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
