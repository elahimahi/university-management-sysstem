import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  Edit2,
  Save,
  X,
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gradeInputs, setGradeInputs] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleGradeChange = (enrollmentId: number, value: string) => {
    setGradeInputs({
      ...gradeInputs,
      [enrollmentId]: value,
    });
  };

  const submitGrade = async (enrollmentId: number) => {
    const gradeValue = parseFloat(gradeInputs[enrollmentId]);

    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 4.0) {
      toast.error('Please enter a valid GPA (0-4.0)');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.post<{
        status: string;
        message: string;
        grade_point: number;
      }>('/grades/add', {
        enrollment_id: enrollmentId,
        grade: gradeValue >= 3.7 ? 'A' : gradeValue >= 3.3 ? 'A-' : gradeValue >= 3.0 ? 'B+' : gradeValue >= 2.7 ? 'B' : gradeValue >= 2.3 ? 'B-' : gradeValue >= 2.0 ? 'C+' : 'C',
        grade_point: gradeValue,
        assessment_type: 'Final Score',
      });

      if (response.status === 'success') {
        toast.success('Grade recorded successfully!');
        setEditingId(null);
        setGradeInputs({
          ...gradeInputs,
          [enrollmentId]: '',
        });
        // Refresh data
        fetchStudents();
      }
    } catch (error: any) {
      console.error('Error submitting grade:', error);
      const errorMsg =
        error?.response?.data?.message || 'Failed to record grade';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
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
      <div className="min-h-screen bg-white dark:bg-navy-900 p-8 flex items-center justify-center">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-800 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold">Grade Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Mark grades for your students. Enter GPA (0-4.0) to record final scores.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-lg dark:bg-navy-800 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Courses and Students */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-navy-800 rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No students found matching your search.' : 'No students enrolled in your courses yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.course_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-gray-100 dark:border-navy-700 overflow-hidden"
              >
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                  <h2 className="text-xl font-bold">
                    {course.course_code} - {course.course_name}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {course.credits} Credits • {course.students.length} Student{course.students.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-700">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Email
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Semester
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Current Grade
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.students.map((student) => (
                        <tr
                          key={student.enrollment_id}
                          className="border-b border-gray-100 dark:border-navy-700 hover:bg-blue-50 dark:hover:bg-navy-700/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {student.student_id}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                            {student.semester}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {editingId === student.enrollment_id ? (
                              <input
                                type="number"
                                min="0"
                                max="4.0"
                                step="0.01"
                                placeholder="0.00"
                                value={gradeInputs[student.enrollment_id] || ''}
                                onChange={(e) =>
                                  handleGradeChange(
                                    student.enrollment_id,
                                    e.target.value
                                  )
                                }
                                className="w-24 px-3 py-2 border rounded-lg dark:bg-navy-700 dark:border-navy-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            ) : (
                              <div className="text-center">
                                {student.current_grade !== null ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                      {student.current_grade.toFixed(2)}
                                    </span>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {editingId === student.enrollment_id ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() =>
                                    submitGrade(student.enrollment_id)
                                  }
                                  disabled={submitting}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                  <Save className="w-4 h-4 inline mr-1" />
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg text-sm font-semibold transition-colors"
                                >
                                  <X className="w-4 h-4 inline" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingId(student.enrollment_id)
                                }
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 mx-auto"
                              >
                                <Edit2 className="w-4 h-4" />
                                Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyGradesPage;
