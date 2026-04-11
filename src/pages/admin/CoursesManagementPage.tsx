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
  instructor_id?: number | null;
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
    instructor_id: null,
  });

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { filterCourses(); }, [courses, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<CoursesResponse>('/admin/courses');
      if (data?.courses) {
        setCourses(data.courses);
        setError(null);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while fetching courses');
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

  // ✅ Fixed: ignoreId parameter added
  const checkDuplicateCourse = (code: string, ignoreId?: number) => {
    const normalizedCode = normalizeCourseCode(code);
    if (!normalizedCode) {
      setDuplicateCourse(null);
      return null;
    }
    const existing = courses.find(
      c => normalizeCourseCode(c.code) === normalizedCode && c.id !== ignoreId
    );
    setDuplicateCourse(existing || null);
    return existing || null;
  };

  // ✅ Fixed: passes editingCourse?.id
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setFormData(prev => ({ ...prev, code: newCode }));
    const existing = checkDuplicateCourse(newCode, editingCourse?.id);
    if (!existing) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedCode = normalizeCourseCode(formData.code);
    const normalizedName = formData.name.trim();

    if (!normalizedCode || !normalizedName) {
      setError('Course code and name are required');
      return;
    }

    // ✅ Fixed: raw code pass, ignoreId দিয়ে নিজেকে exclude করা
    const existingDuplicate = checkDuplicateCourse(formData.code, editingCourse?.id);
    if (existingDuplicate) {
      setError(`Course code "${normalizedCode}" already exists in the system. Please use a different code.`);
      return;
    }

    try {
      const payload = { ...formData, code: normalizedCode, name: normalizedName };

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
      setError(null);
      setFormData({ code: '', name: '', credits: 3, category: 'General', level: 'Undergraduate', instructor_id: null });
      await fetchCourses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save course';
      if (err?.response?.status === 409) {
        setError(errorMessage || 'Course code already exists');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const data = await apiService.delete<CourseActionResponse>('/admin/delete-course', { data: { course_id: courseId } });
      if (data?.status === 'success') {
        setSuccess('✅ Course deleted successfully');
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data?.message || 'Failed to delete course');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while deleting course');
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
    setDuplicateCourse(null); // ✅ reset on edit open
    setError(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
            📚 Courses Management
          </h1>
          <p className="text-purple-300 font-semibold text-lg">Manage, create, and organize university courses</p>
        </motion.div>

        {/* Alert Messages - Enhanced */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 text-green-200 rounded-xl flex items-center gap-3"
          >
            <CheckCircle size={24} className="flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-900/40 to-rose-900/40 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle size={24} className="flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-xl hover:border-blue-400/50 transition-all">
            <p className="text-blue-300 text-xs font-bold uppercase">Total</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{courses.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all">
            <p className="text-cyan-300 text-xs font-bold uppercase">Undergraduate</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{courses.filter(c => c.level === 'Undergraduate').length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all">
            <p className="text-purple-300 text-xs font-bold uppercase">Graduate</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">{courses.filter(c => c.level === 'Graduate').length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-pink-900/30 to-pink-800/10 border border-pink-500/30 rounded-xl hover:border-pink-400/50 transition-all">
            <p className="text-pink-300 text-xs font-bold uppercase">Showing</p>
            <p className="text-3xl font-bold text-pink-400 mt-2">{filteredCourses.length}</p>
          </div>
        </motion.div>

        {/* Controls - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-slate-900/50 to-purple-900/30 border border-purple-500/30 rounded-xl p-4 md:p-6 mb-8 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={20} />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-600 hover:border-cyan-500/50 focus:border-cyan-400 text-white placeholder-gray-500 pl-12 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const nextShowForm = !showForm;
                setShowForm(nextShowForm);
                setError(null);
                if (!nextShowForm) {
                  setEditingCourse(null);
                  setDuplicateCourse(null);
                  setFormData({ code: '', name: '', credits: 3, category: 'General', level: 'Undergraduate', instructor_id: 0 });
                }
              }}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-cyan-500/50 w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              {showForm ? 'Cancel' : 'Add Course'}
            </motion.button>
          </div>
        </motion.div>

        {/* Form - Enhanced */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-slate-800/90 via-purple-900/40 to-slate-900/90 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-8 mb-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit}>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
                {editingCourse ? '✏️ Edit Course' : '➕ Create New Course'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Course Code (e.g., CS101)"
                    value={formData.code}
                    onChange={handleCodeChange}
                    className={`w-full bg-slate-700/60 border-2 text-white px-4 py-3 rounded-lg focus:outline-none transition-all backdrop-blur-sm ${
                      duplicateCourse
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                        : formData.code
                        ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-500/20'
                        : 'border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                    }`}
                    required
                  />
                  {duplicateCourse && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-3">
                      <AlertTriangle size={20} className="text-red-400" />
                    </motion.div>
                  )}
                  {formData.code && !duplicateCourse && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-3">
                      <Check size={20} className="text-green-400" />
                    </motion.div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Course Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700/60 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                  required
                />

                <input
                  type="number"
                  placeholder="Credits"
                  value={formData.credits}
                  onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className="bg-slate-700/60 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                  min="1"
                  max="4"
                />

                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="bg-slate-700/60 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>

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
                  disabled={duplicateCourse !== null}
                  className={`font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 ${
                    duplicateCourse
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-green-500/50'
                  }`}
                >
                  {editingCourse ? '✏️ Update' : '✅ Create'} Course
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Table Section - Enhanced */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <BookOpen size={40} className="text-cyan-400" />
            </motion.div>
            <p className="text-gray-300 font-semibold text-lg">Loading courses...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-900/60 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800/60 to-purple-900/30 border-b border-purple-500/30">
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Credits</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Level</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-cyan-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/20">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">No courses found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course, idx) => (
                      <motion.tr
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-purple-900/30 transition-all duration-200 group"
                      >
                        <td className="px-6 py-4 text-gray-200 font-bold group-hover:text-cyan-300 transition-colors">
                          <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 rounded-lg">
                            {course.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-200 group-hover:text-white transition-colors">{course.name}</td>
                        <td className="px-6 py-4 text-gray-200 group-hover:text-white transition-colors font-semibold">
                          {course.credits}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              course.level === 'Undergraduate'
                                ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30 hover:border-blue-400/50'
                                : course.level === 'Graduate'
                                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30 hover:border-purple-400/50'
                                : 'bg-green-900/40 text-green-300 border border-green-500/30 hover:border-green-400/50'
                            }`}
                          >
                            {course.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(course)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit size={20} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2, rotate: -10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(course.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={20} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }} whileHover={{ y: -6, scale: 1.01 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-violet-950/80 to-slate-900/95 p-6 shadow-[0_25px_70px_rgba(99,102,241,0.18)]">
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
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-100">
              <span className="font-semibold text-cyan-200">Live insight</span> — your full course catalog is ready for quick action.
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }} whileHover={{ y: -6, scale: 1.01 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/80 to-indigo-950/95 p-6 shadow-[0_25px_70px_rgba(79,70,229,0.16)]">
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
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-indigo-100">
              <span className="font-semibold text-indigo-200">Quick view</span> — filtered matches appear instantly as you type.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CoursesManagementPage;