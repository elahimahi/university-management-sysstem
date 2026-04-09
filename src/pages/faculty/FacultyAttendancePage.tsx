import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { Clock, Check, X } from 'lucide-react';
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

<<<<<<< HEAD
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
=======
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-navy-900 p-8"
    >
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-green-500" />
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Course Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2">Select Course</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Attendance Marks Settings */}
      {selectedCourse && (
        <div className="mb-8 rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-blue-100 dark:border-navy-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">⚙️</span>
            Attendance Marks Configuration
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Present Marks</label>
              <input
                type="number"
                value={markSettings.present_marks}
                onChange={(e) => setMarkSettings({ ...markSettings, present_marks: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Late Marks</label>
              <input
                type="number"
                value={markSettings.late_marks}
                onChange={(e) => setMarkSettings({ ...markSettings, late_marks: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Absent Marks</label>
              <input
                type="number"
                value={markSettings.absent_marks}
                onChange={(e) => setMarkSettings({ ...markSettings, absent_marks: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Students</div>
            <div className="text-2xl font-bold text-green-600">{statistics.total_students || 0}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">Present</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.present_count || 0}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">Late</div>
            <div className="text-2xl font-bold text-yellow-600">{statistics.late_count || 0}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">Absent</div>
            <div className="text-2xl font-bold text-red-600">{statistics.absent_count || 0}</div>
          </div>
        </div>
      )}

      {/* Student List */}
      {selectedCourse && (
        <div className="rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-green-100 dark:border-navy-700">
          <h2 className="text-xl font-semibold mb-4">Students</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No students enrolled in this course</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-navy-600">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-center py-3 px-4 font-semibold">Attendance</th>
                      <th className="text-center py-3 px-4 font-semibold">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={`${student.enrollment_id}-${date}-${index}`} className="border-b border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/50">
                        <td className="py-3 px-4">{student.first_name} {student.last_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAttendanceChange(student.enrollment_id, 'present')}
                              className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                                attendanceRecords.get(student.enrollment_id) === 'present'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 dark:bg-navy-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <Check size={16} className="inline mr-1" />
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(student.enrollment_id, 'late')}
                              className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                                attendanceRecords.get(student.enrollment_id) === 'late'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-gray-200 dark:bg-navy-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(student.enrollment_id, 'absent')}
                              className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                                attendanceRecords.get(student.enrollment_id) === 'absent'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 dark:bg-navy-600 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <X size={16} className="inline mr-1" />
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={attendanceMarks.get(student.enrollment_id) || 0}
                              onChange={(e) => handleMarksChange(student.enrollment_id, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">pts</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FacultyAttendancePage;
