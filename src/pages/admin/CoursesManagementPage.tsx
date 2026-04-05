import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.service';

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

interface CoursesResponse {
  status: string;
  courses: Course[];
}

interface CourseActionResponse {
  status: string;
  message?: string;
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
  const [duplicateCourse, setDuplicateCourse] = useState<Course | null>(null);
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
      const data = await apiService.get<CoursesResponse>('/admin/courses');
      if (data && data.courses) {
        setCourses(data.courses);
        setError(null);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while fetching courses');
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

  const normalizeCourseCode = (code: string) =>
    code.trim().replace(/\s+/g, ' ').toUpperCase();

  const checkDuplicateCourse = (code: string) => {
    const normalizedCode = normalizeCourseCode(code);

    if (!normalizedCode) {
      setDuplicateCourse(null);
      return null;
    }

    const existing = courses.find(c => normalizeCourseCode(c.code) === normalizedCode);

    // If editing, don't consider the current course as duplicate
    if (editingCourse && existing && existing.id === editingCourse.id) {
      setDuplicateCourse(null);
      return null;
    }

    setDuplicateCourse(existing || null);
    return existing || null;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setFormData({ ...formData, code: newCode });
    const existing = checkDuplicateCourse(newCode);
    if (!existing) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedCode = normalizeCourseCode(formData.code);
    const normalizedName = formData.name.trim();

    if (!normalizedCode || !normalizedName) {
      setError('Course code and name are required');
      return;
    }

    const existingDuplicate = checkDuplicateCourse(normalizedCode);

    if (existingDuplicate && !editingCourse) {
      setError(`Course code "${normalizedCode}" already exists.`);
      return;
    }

    try {
      const payload = {
        ...formData,
        code: normalizedCode,
        name: normalizedName,
      };

      if (editingCourse) {
        await apiService.post<CourseActionResponse>('/admin/update-course', { ...payload, id: editingCourse.id });
        setSuccess('✅ Course updated!');
      } else {
        await apiService.post<CourseActionResponse>('/admin/create-course', payload);
        setSuccess('✅ Course created!');
      }
      
      setShowForm(false);
      setEditingCourse(null);
      setDuplicateCourse(null);
      setFormData({
        code: '',
        name: '',
        credits: 3,
        category: 'General',
        level: 'Undergraduate',
        instructor_id: 0,
      });
      await fetchCourses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save course';
      if (err?.response?.status === 409) {
        setError(errorMessage || 'Course code already exists');
      } else {
        setError(errorMessage);
      }
      console.error('Course save error:', errorMessage, err);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const data = await apiService.delete<CourseActionResponse>('/admin/delete-course', { data: { course_id: courseId } });
      
      if (data && data.status === 'success') {
        setSuccess('✅ Course deleted successfully');
        setCourses(courses.filter(c => c.id !== courseId));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data?.message || 'Failed to delete course');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while deleting course');
      console.error('Delete error:', err);
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-900/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Action Bar */}
        <div className="mb-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const nextShowForm = !showForm;
              setShowForm(nextShowForm);
              setError(null);

              if (!nextShowForm || !editingCourse) {
                setEditingCourse(null);
                setDuplicateCourse(null);
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
          </motion.button>

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg border border-slate-600/50 rounded-xl p-8 mb-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit}>
              <h3 className="text-xl font-bold text-white mb-6">{editingCourse ? '✏️ Edit Course' : '➕ Create New Course'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Course Code with Real-time Duplicate Check */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Course Code (e.g., CS101)"
                    value={formData.code}
                    onChange={handleCodeChange}
                    className={`w-full bg-slate-700/50 border-2 text-white px-4 py-2 rounded-lg focus:outline-none transition-all ${
                      duplicateCourse && !editingCourse
                        ? 'border-red-500/50 focus:border-red-500'
                        : formData.code && !duplicateCourse
                        ? 'border-green-500/50 focus:border-green-500'
                        : 'border-slate-600 focus:border-purple-500'
                    }`}
                    required
                  />
                  {duplicateCourse && !editingCourse && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-2.5"
                    >
                      <AlertTriangle size={20} className="text-red-400" />
                    </motion.div>
                  )}
                  {formData.code && !duplicateCourse && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-2.5"
                    >
                      <Check size={20} className="text-green-400" />
                    </motion.div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Course Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                  min="1"
                  max="4"
                />
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>

              {/* Duplicate Course Warning */}
              {duplicateCourse && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-300 font-semibold">⚠️ Course Already Exists!</p>
                    <p className="text-red-300/80 text-sm mt-1">
                      The code "<strong>{duplicateCourse.code}</strong>" is already in use for "<strong>{duplicateCourse.name}</strong>"
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={duplicateCourse !== null && !editingCourse}
                  className={`font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2 ${
                    duplicateCourse && !editingCourse
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {editingCourse ? '✏️ Update' : '✅ Create'} Course
                </motion.button>
              </div>
            </form>
          </motion.div>
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-violet-950/80 to-slate-900/95 p-6 shadow-[0_25px_70px_rgba(99,102,241,0.18)]"
          >
            <div className="pointer-events-none absolute -right-10 -top-8 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Total Courses</p>
                <p className="mt-4 text-5xl font-black text-white drop-shadow-[0_8px_30px_rgba(99,102,241,0.35)]">{courses.length}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-cyan-300 shadow-[0_15px_40px_rgba(56,189,248,0.18)]">
                <BookOpen size={28} className="drop-shadow" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-100"
            >
              <span className="font-semibold text-cyan-200">Live insight</span> — your full course catalog is ready for quick action.
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/80 to-indigo-950/95 p-6 shadow-[0_25px_70px_rgba(79,70,229,0.16)]"
          >
            <div className="pointer-events-none absolute -left-10 -top-6 h-24 w-24 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-20 w-20 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Search Results</p>
                <p className="mt-4 text-5xl font-black text-white drop-shadow-[0_8px_30px_rgba(139,92,246,0.35)]">{filteredCourses.length}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-indigo-300 shadow-[0_15px_40px_rgba(168,85,247,0.16)]">
                <Search size={28} className="drop-shadow" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-indigo-100"
            >
              <span className="font-semibold text-indigo-200">Quick view</span> — filtered matches appear instantly as you type.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CoursesManagementPage;
