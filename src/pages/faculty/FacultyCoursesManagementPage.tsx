import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category: string;
  level: string;
  semester: string;
  students_count: number;
}

const FacultyCoursesManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    category: 'General',
    level: 'Undergraduate',
    semester: 'Fall 2024',
  });

  useEffect(() => {
    if (user?.id) {
      fetchFacultyCourses();
    }
  }, [user]);

  const fetchFacultyCourses = async () => {
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
        setError(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error while fetching courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      setError('Course code and name are required');
      return;
    }

    // Check for duplicate course in the same semester
    const isDuplicate = courses.some(
      course =>
        course.code.toUpperCase() === formData.code.toUpperCase() &&
        course.semester === formData.semester
    );

    if (isDuplicate) {
      setError('❌ Duplicate Course not allowed');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/faculty/create_course.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          instructor_id: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Course created successfully!');
        setShowForm(false);
        setFormData({
          code: '',
          name: '',
          credits: 3,
          category: 'General',
          level: 'Undergraduate',
          semester: 'Fall 2024',
        });
        fetchFacultyCourses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || data.message || 'Failed to create course');
      }
    } catch (err) {
      setError('Network error while creating course');
      console.error(err);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/faculty/delete_course.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Course deleted successfully');
        setCourses(courses.filter(c => c.id !== courseId));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to delete course');
      }
    } catch (err) {
      setError('Network error while deleting course');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📚 My Courses</h1>
          <p className="text-blue-200">Manage your courses and enrolled students</p>
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

        {/* Action Bar */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'Create New Course'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Course Code (e.g., CS301)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  min="1"
                  max="4"
                />
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Certificate">Certificate</option>
                </select>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Spring 2025">Spring 2025</option>
                  <option value="Summer 2025">Summer 2025</option>
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Summer 2026">Summer 2026</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                Create Course
              </button>
            </form>
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-300">Loading courses...</div>
        ) : (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No courses yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-blue-400 font-semibold text-sm">{course.code}</p>
                        <h3 className="text-white font-bold text-lg mt-1">{course.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <div className="flex justify-between">
                        <span className="opacity-75">Credits:</span>
                        <span className="font-semibold">{course.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Level:</span>
                        <span className="font-semibold">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Semester:</span>
                        <span className="font-semibold">{course.semester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Category:</span>
                        <span className="font-semibold">{course.category}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-300">
                          <Users size={16} />
                          <span className="text-sm">{course.students_count} Students</span>
                        </div>
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                          View →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="mt-8 bg-slate-800/50 border border-slate-600 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Courses</span>
                <span className="text-2xl font-bold text-blue-400">{courses.length}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacultyCoursesManagementPage;
