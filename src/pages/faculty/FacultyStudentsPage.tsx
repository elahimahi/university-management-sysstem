import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import {
  Mail,
  BookOpen,
  Users,
  Loader,
  UserCheck,
  Award,
  Zap,
  ArrowRight,
  Search,
  Filter,
  GraduationCap,
} from 'lucide-react';

interface Student {
  student_id: string;
  email: string;
  first_name: string;
  last_name: string;
  course_id: string;
  course_code: string;
  course_name: string;
  enrollment_id: string;
}

const FacultyStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedByStudent, setGroupedByStudent] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        const response = await axios.get(`${API_BASE_URL}/faculty/students_by_faculty.php`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setStudents(response.data);

        // Group students by student_id to show unique students
        const grouped = response.data.reduce((acc: any, student: Student) => {
          if (!acc[student.student_id]) {
            acc[student.student_id] = {
              student_id: student.student_id,
              email: student.email,
              first_name: student.first_name,
              last_name: student.last_name,
              courses: [],
            };
          }
          acc[student.student_id].courses.push({
            course_id: student.course_id,
            course_code: student.course_code,
            course_name: student.course_name,
            enrollment_id: student.enrollment_id,
          });
          return acc;
        }, {});

        setGroupedByStudent(grouped);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch students';
        setError(errorMessage);
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudents();
    }
  }, [user]);

  const sortedStudents = Object.values(groupedByStudent)
    .sort((a: any, b: any) => a.last_name.localeCompare(b.last_name))
    .filter((student: any) => {
      const matchesSearch = 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = !filterCourse || 
        student.courses.some((c: any) => c.course_code.includes(filterCourse));
      
      return matchesSearch && matchesFilter;
    });

  const allCourses = Array.from(
    new Set(
      Object.values(groupedByStudent).flatMap((s: any) =>
        s.courses.map((c: any) => c.course_code)
      )
    )
  ).sort();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-4 md:p-8"
    >
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
              <GraduationCap className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest">Faculty Dashboard</p>
              <h1 className="text-5xl md:text-6xl font-black text-white mt-2">My Students</h1>
            </div>
          </motion.div>
          <motion.p variants={itemVariants} className="text-cyan-200/80 text-lg max-w-3xl">
            Manage and view all students enrolled in your courses. Track progress, view enrollments, and maintain communication.
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
            { icon: Users, label: 'Total Students', value: sortedStudents.length, color: 'from-blue-500 to-blue-600' },
            { icon: BookOpen, label: 'Enrollments', value: students.length, color: 'from-purple-500 to-purple-600' },
            { icon: Award, label: 'Status', value: 'Active', color: 'from-emerald-500 to-emerald-600' },
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
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-10 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
              <div className="relative flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl px-6 py-4 focus-within:border-cyan-500 transition">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="🔍 Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Filter by Course */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
              <div className="relative flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl px-6 py-4 focus-within:border-purple-500 transition">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 outline-none cursor-pointer"
                >
                  <option value="">All Courses</option>
                  {allCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mb-6"
              >
                <Users className="w-16 h-16 text-cyan-400 mx-auto" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white text-2xl font-bold"
              >
                Loading students...
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group mb-8"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/50 to-pink-500/50 rounded-3xl blur opacity-75" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-red-700 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-red-400 mb-2">Error loading students</h3>
              <p className="text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Students List */}
        {!loading && !error && sortedStudents.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {sortedStudents.map((student: any, index: number) => (
              <motion.div
                key={student.student_id}
                variants={itemVariants}
                whileHover={{ y: -4, x: 8 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />

                <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl p-6 md:p-8 hover:border-cyan-500/50 transition">
                  {/* Top animated bar */}
                  <motion.div
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                          {student.first_name} {student.last_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-slate-400">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enrollment Badge */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      {student.courses.length} Course{student.courses.length !== 1 ? 's' : ''}
                    </motion.div>
                  </div>

                  {/* Courses Section */}
                  <div className="pt-6 border-t border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enrolled Courses</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {student.courses.map((course: any, idx: number) => (
                        <motion.div
                          key={course.enrollment_id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="group/course relative"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover/course:opacity-100 blur transition" />
                          <div className="relative bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 rounded-xl px-4 py-3 transition">
                            <p className="font-bold text-emerald-300 text-sm">{course.course_code}</p>
                            <p className="text-slate-400 text-xs mt-1 line-clamp-1">{course.course_name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full md:w-auto px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedStudents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-3xl"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Users className="w-24 h-24 text-slate-500 mx-auto mb-4" />
            </motion.div>
            <p className="text-2xl font-bold text-white mb-2">
              {searchTerm || filterCourse ? '✨ No students found' : '📚 No Students Yet'}
            </p>
            <p className="text-slate-300">
              {searchTerm || filterCourse
                ? 'Try adjusting your search or filter criteria'
                : 'Students will appear here once they enroll in your courses'}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyStudentsPage;
