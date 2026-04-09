import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Save, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';

interface AttendanceRecord {
  enrollment_id: number;
  student_name: string;
  student_id: string;
  course_id: number;
  course_code: string;
  date: string;
  status: 'present' | 'absent' | 'late' | '';
}

const FacultyAttendanceMarkingPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/faculty/get_my_courses.php?faculty_id=${user?.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
        setError(null);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error while fetching courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourse(courseId);
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/faculty/get_course_students.php?course_id=${courseId}`
      );
      const data = await response.json();

      if (response.ok) {
        const students = data.students || [];
        setAttendance(
          students.map((student: any) => ({
            enrollment_id: student.enrollment_id,
            student_name: student.name,
            student_id: student.student_id,
            course_id: courseId,
            course_code: courses.find(c => c.id === courseId)?.code || '',
            date: selectedDate,
            status: '',
          }))
        );
        setError(null);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Network error while fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (enrollmentId: number, status: string) => {
    setAttendance(
      attendance.map(record =>
        record.enrollment_id === enrollmentId
          ? { ...record, status: status as any }
          : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/faculty/save_attendance.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourse,
          date: selectedDate,
          records: attendance.filter(r => r.status),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Attendance saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save attendance');
      }
    } catch (err) {
      setError('Network error while saving attendance');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    setAttendance(attendance.map(r => ({ ...r, status: 'present' })));
  };

  const clearAll = () => {
    setAttendance(attendance.map(r => ({ ...r, status: '' })));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-900 p-8 mb-8 shadow-[0_35px_120px_rgba(14,165,233,0.15)]">
          <div className="absolute -right-20 -top-14 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-24 -bottom-10 h-64 w-64 rounded-full bg-slate-200/5 blur-3xl" />
          <div className="relative max-w-4xl">
            <h1 className="text-4xl font-extrabold text-white mb-3">📋 Mark Attendance</h1>
            <p className="text-cyan-200 text-lg">
              Record attendance with smooth controls, quick actions, and a polished faculty workflow.
            </p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Selection Bar */}
        <div className="bg-slate-900/90 border border-slate-700/70 rounded-[2.5rem] p-6 mb-8 shadow-[0_35px_120px_rgba(8,10,27,0.35)] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => handleCourseSelect(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-400"
              >
                <option value="">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-1">
                <Calendar size={16} /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Quick Actions */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Quick Actions
              </label>
              <div className="flex flex-col gap-3">
                <button
                  onClick={markAllPresent}
                  className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 px-4 py-3 rounded-2xl font-semibold transition-all shadow-xl shadow-cyan-500/20"
                >
                  All Present
                </button>
                <button
                  onClick={clearAll}
                  className="w-full bg-slate-700/80 border border-slate-600 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-slate-700 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {attendance.length > 0 ? (
          <div className="bg-slate-900/80 border border-slate-700/70 rounded-[2rem] overflow-hidden mb-8 shadow-[0_30px_90px_rgba(8,10,27,0.35)]">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-700/50 border-b border-slate-600 font-semibold text-gray-300">
              <div>Student Name</div>
              <div>Student ID</div>
              <div>Status</div>
              <div>Time</div>
              <div>Notes</div>
            </div>

            <div className="divide-y divide-slate-600 max-h-96 overflow-y-auto">
              {attendance.map((record) => (
                <div key={record.enrollment_id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center hover:bg-slate-700/30">
                  <div className="text-white font-semibold">{record.student_name}</div>
                  <div className="text-gray-300">{record.student_id}</div>
                  <div>
                    <select
                      value={record.status}
                      onChange={(e) => handleStatusChange(record.enrollment_id, e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select --</option>
                      <option value="present">✓ Present</option>
                      <option value="absent">✗ Absent</option>
                      <option value="late">⏱ Late</option>
                    </select>
                  </div>
                  <div className="text-gray-300 text-sm">
                    {new Date(selectedDate).toLocaleDateString()}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {record.status && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        record.status === 'present' ? 'bg-green-900/30 text-green-300' :
                        record.status === 'absent' ? 'bg-red-900/30 text-red-300' :
                        'bg-yellow-900/30 text-yellow-300'
                      }`}>
                        {record.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary and Save */}
            <div className="p-4 bg-slate-700/50 border-t border-slate-600">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-300">
                  <span className="text-green-400 font-semibold">
                    {attendance.filter(r => r.status === 'present').length}
                  </span>
                  {' '}Present | 
                  <span className="text-red-400 font-semibold ml-2">
                    {attendance.filter(r => r.status === 'absent').length}
                  </span>
                  {' '}Absent | 
                  <span className="text-yellow-400 font-semibold ml-2">
                    {attendance.filter(r => r.status === 'late').length}
                  </span>
                  {' '}Late
                </div>
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving || attendance.filter(r => r.status).length === 0}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-300 bg-slate-900/80 border border-slate-700/70 rounded-[2rem] shadow-[0_20px_60px_rgba(8,10,27,0.25)]">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a course and date to mark attendance</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyAttendanceMarkingPage;
