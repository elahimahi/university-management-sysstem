import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Save, Loader, AlertCircle, RefreshCw } from 'lucide-react';
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
  student_id: string;
  email: string;
}

interface CourseWithStudents {
  id: number;
  code: string;
  name: string;
  students: Student[];
}

type AttendanceStatus = 'present' | 'absent' | 'late' | null;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultyAttendancePageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [courses, setCourses] = useState<CourseWithStudents[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{ [key: number]: AttendanceStatus }>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(`/faculty/get_course_students.php?faculty_id=${user.id}`) as any;
      if (response?.data) {
        const coursesData = Array.isArray(response.data) ? response.data : response.data.courses || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }
      }
      showSuccess('Courses loaded');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  const handleAttendance = (studentId: number, status: AttendanceStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!selectedCourseData) return;
    const newData: { [key: number]: AttendanceStatus } = {};
    selectedCourseData.students.forEach(student => {
      newData[student.id] = status;
    });
    setAttendanceData(newData);
  };

  const handleSubmitAttendance = async () => {
    if (Object.keys(attendanceData).length === 0) {
      showError('No attendance marked');
      return;
    }

    try {
      setSubmitting(true);
      const records = Object.entries(attendanceData)
        .filter(([_, status]) => status)
        .map(([studentId, status]) => ({
          course_id: selectedCourse,
          student_id: parseInt(studentId),
          status: status,
          attendance_date: attendanceDate,
        }));

      await apiService.post('/faculty/mark_attendance.php', { records }) as any;
      showSuccess(`Attendance marked for ${records.length} students`);
      setAttendanceData({});
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      showError('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getAttendanceStats = () => {
    const total = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter(s => s === 'present').length;
    const absent = Object.values(attendanceData).filter(s => s === 'absent').length;
    const late = Object.values(attendanceData).filter(s => s === 'late').length;
    return { total, present, absent, late };
  };

  const stats = getAttendanceStats();

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar className="text-orange-400" size={40} />
              Mark Attendance
            </h1>
            <p className="text-gray-400">Record student attendance for today's class</p>
          </motion.div>

          {/* Date & Course Select */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Select Course</label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => {
                  setSelectedCourse(parseInt(e.target.value));
                  setAttendanceData({});
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400"
              >
                <option value="" className="bg-slate-900">Select a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id} className="bg-slate-900">
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {loading ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-16" />
              ))}
            </motion.div>
          ) : !selectedCourseData ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No course selected</h3>
              <p className="text-gray-400">Select a course to mark attendance</p>
            </motion.div>
          ) : (
            <>
              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="flex gap-2 mb-6 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkAll('present')}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg font-semibold hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Mark All Present
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMarkAll('absent')}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Mark All Absent
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAttendanceData({})}
                  className="px-4 py-2 bg-gray-500/20 border border-gray-500/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-500/30 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Clear All
                </motion.button>
              </motion.div>

              {/* Attendance Stats */}
              {stats.total > 0 && (
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-300 mb-1">Total Marked</p>
                    <p className="text-2xl font-bold text-blue-300">{stats.total}</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-300 mb-1">Present</p>
                    <p className="text-2xl font-bold text-green-300">{stats.present}</p>
                  </div>
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-300 mb-1">Absent</p>
                    <p className="text-2xl font-bold text-red-300">{stats.absent}</p>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-300 mb-1">Late</p>
                    <p className="text-2xl font-bold text-yellow-300">{stats.late}</p>
                  </div>
                </motion.div>
              )}

              {/* Students List */}
              <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedCourseData.students.map((student, idx) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-blue-300">{student.student_id}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-white">{student.firstname} {student.lastname}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{student.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAttendance(student.id, 'present')}
                                className={`p-2 rounded-full transition-all ${
                                  attendanceData[student.id] === 'present'
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                              >
                                <CheckCircle size={20} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAttendance(student.id, 'absent')}
                                className={`p-2 rounded-full transition-all ${
                                  attendanceData[student.id] === 'absent'
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                              >
                                <XCircle size={20} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAttendance(student.id, 'late')}
                                className={`p-2 rounded-full transition-all ${
                                  attendanceData[student.id] === 'late'
                                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                              >
                                <Clock size={20} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Submit Button */}
              {Object.keys(attendanceData).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitAttendance}
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Attendance ({stats.total} students)
                      </>
                    )}
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

export default FacultyAttendancePageProfessional;
