import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import {
  Clock,
  Check,
  X,
  Users,
  Calendar,
  Settings,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  Save,
  Loader,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Student {
  enrollment_id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  attendance_status: string | null;
}

interface AttendanceRecord {
  enrollment_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  attendance_marks?: number;
}

interface AttendanceMarks {
  present_marks: number;
  late_marks: number;
  absent_marks: number;
}

const FacultyAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<number, string>>(new Map());
  const [attendanceMarks, setAttendanceMarks] = useState<Map<number, number>>(new Map());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [markSettings, setMarkSettings] = useState<AttendanceMarks>({
    present_marks: 1,
    late_marks: 0.5,
    absent_marks: 0
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

  // Fetch faculty courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getAccessToken();
        const response = await axios.get(`${API_BASE_URL}/faculty/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  // Fetch students when course changes
  useEffect(() => {
    if (selectedCourse && user?.id) {
      fetchStudents();
    }
  }, [selectedCourse, date]);

  const fetchStudents = async () => {
    if (!selectedCourse || !user?.id) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `${API_BASE_URL}/faculty/course-students?course_id=${selectedCourse}&faculty_id=${user.id}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(response.data.students || []);
      setStatistics(response.data.statistics || null);

      // Initialize attendance records with existing status or 'present'
      const newRecords = new Map<number, string>();
      response.data.students.forEach((student: Student) => {
        newRecords.set(student.enrollment_id, student.attendance_status || 'present');
      });
      setAttendanceRecords(newRecords);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (enrollment_id: number, status: string) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(enrollment_id, status);
    setAttendanceRecords(newRecords);

    // Calculate and set marks based on status
    const newMarks = new Map(attendanceMarks);
    if (status === 'present') {
      newMarks.set(enrollment_id, markSettings.present_marks);
    } else if (status === 'late') {
      newMarks.set(enrollment_id, markSettings.late_marks);
    } else if (status === 'absent') {
      newMarks.set(enrollment_id, markSettings.absent_marks);
    }
    setAttendanceMarks(newMarks);
  };

  const handleMarksChange = (enrollment_id: number, marks: number) => {
    const newMarks = new Map(attendanceMarks);
    newMarks.set(enrollment_id, marks);
    setAttendanceMarks(newMarks);
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !user?.id) {
      toast.error('Please select a course');
      return;
    }

    const attendance_records: AttendanceRecord[] = Array.from(attendanceRecords.entries()).map(
      ([enrollment_id, status]) => ({
        enrollment_id,
        date,
        status: status as 'present' | 'absent' | 'late',
        attendance_marks: attendanceMarks.get(enrollment_id) || 0,
      })
    );

    if (attendance_records.length === 0) {
      toast.error('No students to mark attendance');
      return;
    }

    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_BASE_URL}/faculty/mark-attendance`,
        {
          faculty_id: user.id,
          course_id: selectedCourse,
          attendance_records,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.successful > 0) {
        toast.success(`Attendance marked: ${response.data.successful} student(s)`);
        fetchStudents(); // Refresh to show updated status
      }
      if (response.data.failed > 0) {
        toast.error(`Failed: ${response.data.failed} record(s)`);
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

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
      <Toaster position="top-right" />

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
              <Clock className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest">Faculty Dashboard</p>
              <h1 className="text-5xl md:text-6xl font-black text-white mt-2">Mark Attendance</h1>
            </div>
          </motion.div>
          <motion.p variants={itemVariants} className="text-cyan-200/80 text-lg max-w-3xl">
            Track student attendance across your courses with real-time statistics and intuitive marking.
          </motion.p>
        </motion.div>

        {/* Course and Date Selection */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          {/* Course Selection */}
          <div className="group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
            <div className="relative">
              <label className="block text-cyan-300 text-sm font-bold uppercase tracking-widest mb-3">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Select Course
              </label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
                className="w-full px-6 py-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl text-white font-semibold focus:outline-none focus:border-cyan-500 transition appearance-none cursor-pointer hover:border-cyan-500/50"
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selection */}
          <div className="group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
            <div className="relative">
              <label className="block text-purple-300 text-sm font-bold uppercase tracking-widest mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Attendance Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-6 py-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl text-white font-semibold focus:outline-none focus:border-purple-500 transition cursor-pointer hover:border-purple-500/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Attendance Marks Configuration */}
        {selectedCourse && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-10 group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur opacity-0 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl p-8">
              {/* Header with Settings Icon */}
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Mark Configuration</h2>
              </div>

              {/* Mark Settings Grid */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Present Marks', key: 'present_marks', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
                  { label: 'Late Marks', key: 'late_marks', icon: AlertCircle, color: 'from-amber-500 to-amber-600' },
                  { label: 'Absent Marks', key: 'absent_marks', icon: XCircle, color: 'from-red-500 to-red-600' },
                ].map((item: any, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.key}
                      variants={itemVariants}
                      className="group/mark"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl opacity-10 group-hover/mark:opacity-20 transition`} />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-5 h-5 text-slate-300" />
                          <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">{item.label}</label>
                        </div>
                        <input
                          type="number"
                          value={(markSettings as any)[item.key]}
                          onChange={(e) => setMarkSettings({ ...markSettings, [item.key]: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white font-bold text-center focus:outline-none focus:border-cyan-500 transition"
                          step="0.1"
                          min="0"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: Users, label: 'Total Students', value: statistics.total_students || 0, color: 'from-blue-500 to-blue-600' },
              { icon: CheckCircle2, label: 'Present', value: statistics.present_count || 0, color: 'from-emerald-500 to-emerald-600' },
              { icon: AlertCircle, label: 'Late', value: statistics.late_count || 0, color: 'from-amber-500 to-amber-600' },
              { icon: XCircle, label: 'Absent', value: statistics.absent_count || 0, color: 'from-red-500 to-red-600' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ translateY: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300`} />
                <div className="relative bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Student List */}
        {selectedCourse && (
          <>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-24"
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
            ) : students.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-3xl"
              >
                <Users className="w-24 h-24 text-slate-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-white mb-2">No Students Enrolled</p>
                <p className="text-slate-300">Students will appear here once they enroll in this course</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 mb-8"
              >
                {students.map((student, index) => (
                  <motion.div
                    key={`${student.enrollment_id}-${date}-${index}`}
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

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Student Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                              {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-slate-400 text-sm">{student.email}</p>
                          </div>
                        </div>

                        {/* Attendance Buttons */}
                        <div className="flex gap-3 md:gap-2 flex-wrap md:flex-nowrap md:flex-shrink-0">
                          {[
                            { status: 'present', label: 'Present', icon: Check, color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-300' },
                            { status: 'late', label: 'Late', icon: AlertCircle, color: 'from-amber-500 to-amber-600', textColor: 'text-amber-300' },
                            { status: 'absent', label: 'Absent', icon: X, color: 'from-red-500 to-red-600', textColor: 'text-red-300' },
                          ].map((btn: any) => {
                            const BtnIcon = btn.icon;
                            const isActive = attendanceRecords.get(student.enrollment_id) === btn.status;
                            return (
                              <motion.button
                                key={btn.status}
                                onClick={() => handleAttendanceChange(student.enrollment_id, btn.status)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                  isActive
                                    ? `bg-gradient-to-br ${btn.color} text-white shadow-lg`
                                    : `bg-slate-800 border border-slate-600 ${btn.textColor} hover:border-slate-500`
                                }`}
                              >
                                <BtnIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">{btn.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Marks Input */}
                        <div className="flex items-center gap-3 md:flex-shrink-0">
                          <div className="relative flex items-center gap-2 bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2">
                            <TrendingUp className="w-4 h-4 text-yellow-400" />
                            <input
                              type="number"
                              value={attendanceMarks.get(student.enrollment_id) || 0}
                              onChange={(e) => handleMarksChange(student.enrollment_id, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-transparent text-white font-bold text-center outline-none"
                              step="0.1"
                              min="0"
                            />
                            <span className="text-slate-400 text-sm font-semibold">pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Save Button */}
            {students.length > 0 && (
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg"
              >
                <Save className="w-6 h-6" />
                {loading ? 'Saving Attendance...' : 'Save Attendance'}
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyAttendancePage;
