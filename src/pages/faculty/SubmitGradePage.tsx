import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiService } from '../../services/api.service';
import toast from 'react-hot-toast';

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  students: StudentEnrollment[];
}

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

const SubmitGradePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [letterGrade, setLetterGrade] = useState('');
  const [gradePoints, setGradePoints] = useState('');
  const [assessmentType, setAssessmentType] = useState('Final Score');
  const [markCompleted, setMarkCompleted] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{
        status: string;
        courses: Course[];
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

  const getStudentsForCourse = () => {
    if (!selectedCourse) return [];
    const course = courses.find((c) => c.course_id === selectedCourse);
    return course?.students || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    if (!letterGrade.trim()) {
      toast.error('Please enter a letter grade (e.g., A, B+, C)');
      return;
    }

    const gpa = parseFloat(gradePoints);
    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      toast.error('Please enter valid grade points (0.00 - 4.00)');
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiService.post<{
        status: string;
        message: string;
      }>('/grades/add', {
        enrollment_id: selectedStudent,
        grade: letterGrade,
        grade_point: gpa,
        assessment_type: assessmentType,
        mark_completed: markCompleted,
      });

      if (response.status === 'success') {
        toast.success(response.message || 'Grade submitted successfully!');

        // Reset form
        setSelectedCourse('');
        setSelectedStudent('');
        setLetterGrade('');
        setGradePoints('');
        setAssessmentType('Final Score');
        setMarkCompleted(false);

        // Refresh data
        fetchStudents();
      }
    } catch (error: any) {
      console.error('Error submitting grade:', error);
      const errorMsg =
        error?.response?.data?.message || 'Failed to submit grade';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-800 p-8 flex items-center justify-center">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  const currentStudents = getStudentsForCourse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-800 p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-gold-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Submit New Grade
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Enter grade information below to submit scores for your students.
          </p>
        </div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-navy-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-navy-700"
        >
          {/* Course & Student Selection */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Student & Course
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value ? parseInt(e.target.value) : '');
                    setSelectedStudent('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select Course...</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Enrolled Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : '')}
                  disabled={!selectedCourse}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Student...</option>
                  {currentStudents.map((student) => (
                    <option key={student.enrollment_id} value={student.enrollment_id}>
                      {student.first_name} {student.last_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grade Inputs */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Grade Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Letter Grade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Letter Grade
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, B+, C"
                  value={letterGrade}
                  onChange={(e) => setLetterGrade(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Examples: A, A-, B+, B, B-, C+, C, D, F
                </p>
              </div>

              {/* Grade Points */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Grade Points
                </label>
                <input
                  type="number"
                  min="0"
                  max="4.0"
                  step="0.01"
                  placeholder="0.00 - 4.00"
                  value={gradePoints}
                  onChange={(e) => setGradePoints(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  GPA on a 4.0 scale
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Type */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Assessment Type
            </h2>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="Final Score">Final Score</option>
              <option value="Midterm">Midterm Exam</option>
              <option value="Final Exam">Final Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Project">Project</option>
              <option value="Participation">Participation</option>
            </select>
          </div>

          {/* Mark As Completed */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={markCompleted}
                onChange={(e) => setMarkCompleted(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Mark enrollment as completed (move credits to completed status)
              </span>
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-8">
              Check this if this is the final grade and the course should be marked as completed.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-500/30"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin w-5 h-5" />
                Submitting...
              </div>
            ) : (
              'Secure Submit Grade'
            )}
          </button>
        </motion.form>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-2">Grade Submission Info:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Grade points must be between 0.00 and 4.00</li>
                <li>Grades are saved to SQL Server database</li>
                <li>Student will see grades on their dashboard</li>
                <li>GPA automatically recalculated</li>
                <li>Credits moved to completed when enrollment marked complete</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SubmitGradePage;
