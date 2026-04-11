import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

interface Course {
  id: number;
  code: string;
  title: string;
  instructor_id: number;
  credits: number;
  semester: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CoursesManagementPage: React.FC = () => {
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, semesterFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/get_all_courses.php`);
      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
        showSuccess('Courses loaded');
      } else {
        showError(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      showError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (semesterFilter !== 'all') {
      filtered = filtered.filter(c => c.semester === semesterFilter);
    }
    setFilteredCourses(filtered);
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete_course.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });
      if (response.ok) {
        showSuccess('Course deleted');
        setCourses(courses.filter(c => c.id !== courseId));
      } else {
        showError('Failed to delete');
      }
    } catch (err) {
      showError('Network error');
    }
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-2">📚 Courses Management</h1>
            <p className="text-gray-400">Manage all university courses</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <motion.div variants={itemVariants} className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur">
              <p className="text-gray-400 mb-2">Total Courses</p>
              <h3 className="text-4xl font-bold text-white">{courses.length}</h3>
            </motion.div>
            <motion.div variants={itemVariants} className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur">
              <p className="text-gray-400 mb-2">Credits Offered</p>
              <h3 className="text-4xl font-bold text-white">{courses.reduce((sum, c) => sum + c.credits, 0)}</h3>
            </motion.div>
          </motion.div>

          {/* Filters & Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all"
              >
                <option value="all">All Semesters</option>
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2025">Spring 2025</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl transition-all"
              >
                <Plus size={20} /> Add Course
              </motion.button>
            </div>
          </motion.div>

          {/* Courses Grid */}
          {loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredCourses.length === 0 ? (
                  <p className="col-span-full text-center text-gray-400 py-12">No courses found</p>
                ) : (
                  filteredCourses.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1 truncate">{course.title}</h3>
                          <p className="text-sm text-gray-400">{course.code}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Credits:</span>
                          <span className="text-white font-semibold">{course.credits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Semester:</span>
                          <span className="text-white font-semibold">{course.semester}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CoursesManagementPage;
