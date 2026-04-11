import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Search, Save, AlertCircle, CheckCircle, Loader, Download } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  student_id: string;
  current_grade?: number | null;
}

interface Course {
  id: number;
  code: string;
  name: string;
  students: Student[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultyGradesPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeUpdates, setGradeUpdates] = useState<{ [key: number]: number }>({});

  // Fetch courses and students
  useEffect(() => {
    fetchCoursesAndStudents();
  }, [user?.id]);

  const fetchCoursesAndStudents = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(`/faculty/get_grading_students.php?faculty_id=${user.id}`) as any;
      if (response?.data) {
        const coursesData = Array.isArray(response.data) ? response.data : response.data.courses || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }
      }
      showSuccess('Grades interface loaded');
    } catch (error) {
      console.error('Failed to fetch:', error);
      showError('Failed to load grades data');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: number, grade: number) => {
    setGradeUpdates({ ...gradeUpdates, [studentId]: grade });
  };

  const handleSubmitGrades = async () => {
    if (Object.keys(gradeUpdates).length === 0) {
      showError('No grades to submit');
      return;
    }

    try {
      setSubmitting(true);
      const updates = Object.entries(gradeUpdates).map(([studentId, grade]) => ({
        student_id: parseInt(studentId),
        grade: grade,
        course_id: selectedCourse,
      }));

      await apiService.post('/faculty/submit_grades.php', { grades: updates }) as any;
      showSuccess('Grades submitted successfully!');
      setGradeUpdates({});
      fetchCoursesAndStudents();
    } catch (error) {
      console.error('Failed to submit grades:', error);
      showError('Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const filteredStudents = selectedCourseData?.students.filter(s =>
    s.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getGradeColor = (grade: number | null | undefined) => {
    if (!grade) return 'bg-gray-500/20 text-gray-300';
    if (grade >= 90) return 'bg-green-500/20 text-green-300';
    if (grade >= 80) return 'bg-blue-500/20 text-blue-300';
    if (grade >= 70) return 'bg-yellow-500/20 text-yellow-300';
    if (grade >= 60) return 'bg-orange-500/20 text-orange-300';
    return 'bg-red-500/20 text-red-300';
  };

  const getGradeLetter = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="text-purple-400" size={40} />
              Grade Management
            </h1>
            <p className="text-gray-400">Submit and manage student grades</p>
          </motion.div>

          {/* Course Select */}
          {!loading && courses.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-sm font-semibold text-gray-300 mb-3">Select Course</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {courses.map((course) => (
                  <motion.button
                    key={course.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCourse(course.id);
                      setGradeUpdates({});
                    }}
                    className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                      selectedCourse === course.id
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">{course.code}</div>
                    <div className="text-xs opacity-75">{course.name}</div>
                    <div className="text-xs opacity-50 mt-1">{course.students.length} students</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {loading ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-16" />
              ))}
            </motion.div>
          ) : !selectedCourseData ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No courses available</h3>
              <p className="text-gray-400">You don't have any courses to grade</p>
            </motion.div>
          ) : (
            <>
              {/* Search */}
              <motion.div variants={itemVariants} className="mb-6 relative">
                <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
              </motion.div>

              {/* Students Table */}
              <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Current Grade</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">New Grade</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Letter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student, idx) => (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-blue-300">{student.student_id}</td>
                            <td className="px-6 py-4 text-sm text-white font-semibold">{student.firstname} {student.lastname}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{student.email}</td>
                            <td className="px-6 py-4 text-sm">
                              {student.current_grade ? (
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getGradeColor(student.current_grade)}`}>
                                  {student.current_grade}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={gradeUpdates[student.id] ?? ''}
                                onChange={(e) => handleGradeChange(student.id, parseInt(e.target.value) || 0)}
                                placeholder="0-100"
                                className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              {gradeUpdates[student.id] >= 0 && (
                                <span className={`inline-block px-2 py-1 rounded font-bold text-sm ${getGradeColor(gradeUpdates[student.id])}`}>
                                  {getGradeLetter(gradeUpdates[student.id])}
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Submit Button */}
              {Object.keys(gradeUpdates).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitGrades}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Submit {Object.keys(gradeUpdates).length} Grade(s)
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGradeUpdates({})}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    Clear
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyGradesPageProfessional;
