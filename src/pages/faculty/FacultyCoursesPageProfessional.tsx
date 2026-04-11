import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, X, Users, Award, Clock, Search, Loader, AlertCircle, CheckCircle, Edit, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester?: string;
  students_count?: number;
  status?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultyCoursesPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '3',
    semester: 'Spring 2026',
  });

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(`/faculty/get_faculty_courses.php?faculty_id=${user.id}`) as any;
      if (response?.data) {
        setCourses(Array.isArray(response.data) ? response.data : response.data.courses || []);
      }
      showSuccess('Courses loaded');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      setCreating(true);
      const response = await apiService.post('/faculty/create_course.php', {
        ...formData,
        credits: parseInt(formData.credits),
      }) as any;

      if (response?.data?.status === 'success' || response?.data?.success) {
        showSuccess('Course created successfully');
        setFormData({ code: '', name: '', credits: '3', semester: 'Spring 2026' });
        setShowCreateModal(false);
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      showError('Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiService.post('/faculty/delete_course.php', { course_id: courseId }) as any;
      showSuccess('Course deleted');
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      showError('Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                <BookOpen className="inline mr-3 text-blue-400" size={40} />
                My Courses
              </h1>
              <p className="text-gray-400">Manage and organize your courses</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Plus size={20} />
              Create Course
            </motion.button>
          </motion.div>

          {/* Search & Filter */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
            >
              <option value="all" className="bg-slate-900">All Semesters</option>
              <option value="Spring 2026" className="bg-slate-900">Spring 2026</option>
              <option value="Fall 2025" className="bg-slate-900">Fall 2025</option>
            </select>
          </motion.div>

          {/* Courses Grid */}
          {loading ? (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-64" />
              ))}
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
              <p className="text-gray-400 mb-6">Create your first course or adjust your search filters</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-500 rounded-lg text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                Create Course
              </motion.button>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur hover:border-blue-400/50 transition-all"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/10 group-hover:to-blue-500/5 transition-all" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{course.code}</h3>
                        <p className="text-sm text-gray-300">{course.name}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                        {course.credits} Credits
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users size={16} />
                        <span>{course.students_count || 0} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={16} />
                        <span>{course.semester || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/faculty/courses/${course.id}`)}
                        className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex-1 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Create Course Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowCreateModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Create New Course</h2>
                    <motion.button
                      whileHover={{ rotate: 90 }}
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={24} />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Course Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g., CS101"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Course Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Data Structures"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Credits</label>
                        <input
                          type="number"
                          value={formData.credits}
                          onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                          min="1"
                          max="6"
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Semester</label>
                        <select
                          value={formData.semester}
                          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                        >
                          <option className="bg-slate-900">Spring 2026</option>
                          <option className="bg-slate-900">Fall 2025</option>
                        </select>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateCourse}
                      disabled={creating || !formData.code || !formData.name}
                      className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Create Course
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyCoursesPageProfessional;
