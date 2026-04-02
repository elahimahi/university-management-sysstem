import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category: string;
  level: string;
  instructor_id: number;
  instructor_name?: string;
}

interface FormData {
  code: string;
  name: string;
  credits: number;
  category: string;
  level: string;
  instructor_id: number;
}

const CoursesManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    credits: 3,
    category: 'General',
    level: 'Undergraduate',
    instructor_id: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/get_all_courses.php`);
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

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      setError('Course code and name are required');
      return;
    }

    try {
      const url = editingCourse
        ? `${API_BASE_URL}/admin/update_course.php`
        : `${API_BASE_URL}/admin/create_course.php`;

      const body = editingCourse
        ? { ...formData, id: editingCourse.id }
        : formData;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingCourse ? '✅ Course updated!' : '✅ Course created!');
        setShowForm(false);
        setEditingCourse(null);
        setFormData({
          code: '',
          name: '',
          credits: 3,
          category: 'General',
          level: 'Undergraduate',
          instructor_id: 0,
        });
        fetchCourses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to save course');
      }
    } catch (err) {
      setError('Network error while saving course');
      console.error(err);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete_course.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('❌ Course deleted successfully');
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

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      credits: course.credits,
      category: course.category,
      level: course.level,
      instructor_id: course.instructor_id,
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📚 Courses Management</h1>
          <p className="text-purple-200">Add, edit, and manage university courses</p>
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
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (editingCourse) {
                setEditingCourse(null);
                setFormData({
                  code: '',
                  name: '',
                  credits: 3,
                  category: 'General',
                  level: 'Undergraduate',
                  instructor_id: 0,
                });
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'Add Course'}
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Course Code (e.g., CS101)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  min="1"
                  max="4"
                />
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  {editingCourse ? 'Update' : 'Create'} Course
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-300">Loading courses...</div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Credits</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No courses found
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-200 font-semibold">{course.code}</td>
                        <td className="px-6 py-4 text-gray-200">{course.name}</td>
                        <td className="px-6 py-4 text-gray-200">{course.credits}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {course.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(course)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <p className="text-sm opacity-75">Total Courses</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <p className="text-sm opacity-75">Search Results</p>
            <p className="text-2xl font-bold">{filteredCourses.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesManagementPage;
