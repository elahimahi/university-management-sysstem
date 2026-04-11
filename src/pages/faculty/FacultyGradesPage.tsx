import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react';
import { apiService } from '../../services/api.service';
import toast from 'react-hot-toast';

interface StudentEnrollment {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_id: number;
  semester: string;
  enrollment_status: string;
  current_grade: number | null;
  grades_count: number;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  students: StudentEnrollment[];
}

const FacultyGradesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const totalStudents = courses.reduce((sum, course) => sum + course.students.length, 0);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{
        status: string;
        courses: Course[];
        total_students: number;
      }>('/faculty/grading-students');

      if (response.status === 'success') {
        setCourses(response.courses || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses
    .map((course) => ({
      ...course,
      students: course.students.filter(
        (student) =>
          student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((course) => course.students.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <GraduationCap className="w-16 h-16 text-cyan-400 mx-auto" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-2xl font-bold"
          >
            Loading grades...
          </motion.div>
          <p className="text-slate-400 mt-3">Collecting your course data</p>
        </div>
      </div>
    );
  }

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
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <GraduationCap className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                Grade Management
              </h1>
              <p className="text-cyan-200 mt-1 text-sm md:text-base">Manage and track student grades efficiently</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: BookOpen, label: 'Total Courses', value: courses.length, color: 'from-blue-500 to-blue-600' },
            { icon: Users, label: 'Students', value: totalStudents, color: 'from-purple-500 to-purple-600' },
            { icon: Award, label: 'Grading Status', value: 'Active', color: 'from-emerald-500 to-emerald-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
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
                  <p className="text-white text-3xl font-bold mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-10"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl px-6 py-4 focus-within:border-cyan-500 transition">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="🔍 Search by student name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-3xl"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            </motion.div>
            <p className="text-xl text-slate-300 font-semibold">
              {searchTerm ? '✨ No students found' : '📚 No enrolled students yet'}
            </p>
            <p className="text-slate-400 mt-2">{searchTerm ? 'Try adjusting your search' : 'Students will appear here'}</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div className="space-y-6">
              {filteredCourses.map((course, courseIdx) => (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: courseIdx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="relative">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />

                    {/* Main Card */}
                    <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                      {/* Course Header */}
                      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 md:px-8 py-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                              {course.course_code}
                            </h2>
                            <p className="text-blue-100 mt-1 font-semibold">{course.course_name}</p>
                          </div>
                          <div className="flex gap-3">
                            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                              <p className="text-white font-semibold">{course.credits} Credits</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <p className="text-white font-semibold">{course.students.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Students Grid */}
                      <div className="p-6 md:p-8">
                        <div className="grid gap-4">
                          {course.students.map((student, idx) => (
                            <motion.div
                              key={student.enrollment_id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ x: 8 }}
                              className="group/student relative"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover/student:opacity-100 transition duration-300" />
                              <div className="relative flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-cyan-500/50 transition">
                                {/* Student Info */}
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                      {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold truncate">
                                      {student.first_name} {student.last_name}
                                    </p>
                                    <p className="text-slate-400 text-sm truncate">{student.email}</p>
                                  </div>
                                </div>

                                {/* Semester */}
                                <div className="hidden md:block mx-4">
                                  <p className="text-slate-300 text-sm">{student.semester}</p>
                                </div>

                                {/* Grade Section */}
                                <div className="flex items-center gap-3 mx-4">
                                  <div className="text-center">
                                    {student.current_grade !== null ? (
                                      <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="flex items-center gap-2"
                                      >
                                        <span className="font-bold text-emerald-400 text-xl">
                                          {student.current_grade.toFixed(2)}
                                        </span>
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                      </motion.div>
                                    ) : (
                                      <span className="text-slate-500 text-sm font-semibold">No Grade</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyGradesPage;
