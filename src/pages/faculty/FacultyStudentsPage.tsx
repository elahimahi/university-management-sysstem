import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { Mail, BookOpen, Users, Loader } from 'lucide-react';

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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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

  const sortedStudents = Object.values(groupedByStudent).sort((a: any, b: any) => 
    a.last_name.localeCompare(b.last_name)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-navy-900 p-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Students</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View all students enrolled in your courses.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-100 text-sm font-semibold">Total Students</p>
                <h3 className="text-3xl font-bold mt-1">{sortedStudents.length}</h3>
              </div>
              <Users size={40} className="opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">Unique Enrollments</p>
                <h3 className="text-3xl font-bold mt-1">{students.length}</h3>
              </div>
              <BookOpen size={40} className="opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-semibold">Status</p>
                <h3 className="text-3xl font-bold mt-1">Active</h3>
              </div>
              <div className="w-10 h-10 bg-emerald-400 rounded-full opacity-20" />
            </div>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader size={40} className="animate-spin text-gold-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading students...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <p className="text-red-800 dark:text-red-300 font-semibold">Error loading students</p>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Students List */}
        {!loading && !error && sortedStudents.length > 0 && (
          <div className="space-y-4">
            {sortedStudents.map((student: any, index: number) => (
              <motion.div
                key={student.student_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl shadow-md bg-gradient-to-br from-gold-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-gold-100 dark:border-navy-700 hover:border-gold-300 dark:hover:border-gold-500 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {student.first_name} {student.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                      <Mail size={16} />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 px-3 py-1 rounded-full text-xs font-semibold">
                      {student.courses.length} Course{student.courses.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div className="mt-4 pt-4 border-t border-gold-200 dark:border-navy-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Enrolled Courses:</p>
                  <div className="flex flex-wrap gap-2">
                    {student.courses.map((course: any) => (
                      <div
                        key={course.enrollment_id}
                        className="bg-white dark:bg-navy-700 border border-gold-200 dark:border-navy-600 rounded-lg px-3 py-2 text-sm"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">{course.course_code}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{course.course_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedStudents.length === 0 && (
          <div className="rounded-xl shadow-lg bg-gradient-to-br from-gold-50 to-white dark:from-navy-800 dark:to-navy-900 p-12 border border-gold-100 dark:border-navy-700 text-center">
            <Users size={48} className="mx-auto text-gold-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Students Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any students enrolled in your courses yet.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyStudentsPage;
