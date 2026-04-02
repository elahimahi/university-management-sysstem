import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api.service';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category?: string;
  level?: string;
  instructor_id?: number;
  first_name?: string;
  last_name?: string;
  enrolled_count?: number;
}

interface EnrolledCourse extends Course {
  semester: string;
  status: string;
  enrolled_at: string;
}

const StudentRegistrationPage: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [semester, setSemester] = useState<string>('Spring 2024');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch available courses
      const availableResponse = await apiService.get<{ status: string; courses: Course[] }>(
        '/courses/available'
      );
      if (availableResponse.status === 'success') {
        setAvailableCourses(availableResponse.courses || []);
      }

      // Fetch enrolled courses
      const enrolledResponse = await apiService.get<{ status: string; courses: EnrolledCourse[] }>(
        '/student/courses'
      );
      if (enrolledResponse.status === 'success') {
        setEnrolledCourses(enrolledResponse.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    if (!semester.trim()) {
      toast.error('Please select a semester');
      return;
    }

    try {
      setEnrolling(courseId);
      const response = await apiService.post<{ status: string; message?: string; enrollment?: any }>(
        '/student/enroll',
        { course_id: courseId, semester }
      );

      if (response.status === 'success') {
        toast.success('Course enrollment successful!');
        fetchCourses();
      } else {
        toast.error(response.message || 'Failed to enroll in course');
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to enroll in course';
      toast.error(errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrolledCourses.some(
      (course) => course.id === courseId && course.status === 'active'
    );
  };

  const filteredCourses = availableCourses.filter((course) =>
    course.code.toLowerCase().includes(filter.toLowerCase()) ||
    course.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 p-8 flex items-center justify-center">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-navy-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold">Course Registration</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Register for your courses. Browse available courses below and enroll for your desired semester.
        </p>

        {/* Current Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 bg-blue-50 dark:bg-navy-800 rounded-xl border border-blue-200 dark:border-blue-900"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-300">
            Your Enrolled Courses ({enrolledCourses.length})
          </h2>
          {enrolledCourses.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">You haven't enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white dark:bg-navy-700 rounded-lg border-2 border-blue-500 shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{course.code}</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Semester: {course.semester}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Credits: {course.credits}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Status: {course.status}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Course Registration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Select Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
              >
                <option value="">Choose a semester...</option>
                <option value="Spring 2024">Spring 2024</option>
                <option value="Summer 2024">Summer 2024</option>
                <option value="Fall 2024">Fall 2024</option>
                <option value="Winter 2024">Winter 2024</option>
                <option value="Spring 2025">Spring 2025</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Search Courses</label>
              <input
                type="text"
                placeholder="Search by course code or name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-navy-700 dark:border-navy-600"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Available Courses ({filteredCourses.length})</h2>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-navy-800 rounded-lg">
              <p className="text-lg text-gray-500 dark:text-gray-400 italic">
                No courses found. {filter && 'Try adjusting your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const enrolled = isEnrolled(course.id);
                return (
                  <motion.div
                    key={course.id}
                    whileHover={{ scale: 1.03 }}
                    className={`p-6 rounded-xl shadow-lg border-2 transition-all ${
                      enrolled
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-gradient-to-br from-primary-50 to-white dark:from-navy-800 dark:to-navy-900 border-gray-200 dark:border-navy-700 hover:border-blue-500'
                    }`}
                  >
                    <div className="mb-3">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {course.code}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{course.name}</h3>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <p>
                        <span className="font-semibold">Credits:</span> {course.credits}
                      </p>
                      {course.category && (
                        <p>
                          <span className="font-semibold">Category:</span> {course.category}
                        </p>
                      )}
                      {course.level && (
                        <p>
                          <span className="font-semibold">Level:</span> {course.level}
                        </p>
                      )}
                      {course.first_name && (
                        <p>
                          <span className="font-semibold">Instructor:</span> {course.first_name} {course.last_name}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Enrolled:</span> {course.enrolled_count || 0} students
                      </p>
                    </div>

                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolled || enrolling === course.id}
                      className={`w-full py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                        enrolled
                          ? 'bg-green-500 text-white cursor-not-allowed opacity-75'
                          : enrolling === course.id
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      }`}
                    >
                      <Plus size={18} />
                      {enrolled ? 'Already Enrolled' : enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentRegistrationPage;
