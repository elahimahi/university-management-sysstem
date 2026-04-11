import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, X, Users, Award, Clock, Zap } from 'lucide-react';
import { apiService } from '../../services/api.service';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedInput from '../../components/ui/AnimatedInput';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import FloatingBadge from '../../components/ui/FloatingBadge';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category?: string;
  level?: string;
  students_count?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const FacultyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { notifications, remove, success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    category: '',
    level: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ status: string; courses?: Course[]; message?: string }>('/faculty/courses');
      if (response.status === 'success') {
        setCourses(response.courses || []);
        success('Courses loaded successfully');
      } else {
        throw new Error(response.message || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to fetch courses. Please make sure you are logged in as faculty.';
      showError('Failed to load courses', { message: errorMessage });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      showError('Validation error', { message: 'Course code and name are required' });
      return;
    }

    if (formData.credits < 1 || formData.credits > 6) {
      showError('Validation error', { message: 'Credits must be between 1 and 6' });
      return;
    }

    try {
      const response = await apiService.post<{ status: string; message?: string; course?: Course }>('/faculty/courses', formData);
      if (response.status === 'success') {
        setCourses([...courses, response.course!]);
        setFormData({ code: '', name: '', credits: 3, category: '', level: '' });
        setShowForm(false);
        success('Course added successfully', { message: `${formData.name} has been added` });
      } else {
        showError('Failed to add course', { message: response.message });
      }
    } catch (error: any) {
      console.error('Error adding course:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add course';
      showError('Error', { message: errorMessage });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) : value
    }));
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseColors = [
    { bg: 'from-blue-600 to-cyan-600', light: 'from-blue-500/20 to-cyan-500/20' },
    { bg: 'from-purple-600 to-pink-600', light: 'from-purple-500/20 to-pink-500/20' },
    { bg: 'from-emerald-600 to-teal-600', light: 'from-emerald-500/20 to-teal-500/20' },
    { bg: 'from-orange-600 to-red-600', light: 'from-orange-500/20 to-red-500/20' },
    { bg: 'from-indigo-600 to-blue-600', light: 'from-indigo-500/20 to-blue-500/20' },
  ];

  return (
    <PageTransition variant="slide-up">
      <NotificationContainer
        notifications={notifications}
        onClose={remove}
        position="top-right"
        maxNotifications={5}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                >
                  📚 My Courses
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-blue-200"
                >
                  Manage and view all courses you are teaching
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <AnimatedButton
                  onClick={() => setShowForm(!showForm)}
                  variant="primary"
                  size="lg"
                  leftIcon={showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                >
                  {showForm ? 'Cancel' : 'Add Course'}
                </AnimatedButton>
              </motion.div>
            </div>

            {/* Course Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              <FloatingBadge
                label={`${courses.length} Courses Total`}
                variant="primary"
                icon={<BookOpen className="w-4 h-4" />}
              />
              {filteredCourses.length !== courses.length && (
                <FloatingBadge
                  label={`${filteredCourses.length} Matching`}
                  variant="gold"
                  icon={<Zap className="w-4 h-4" />}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Add Course Form */}
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm"
              >
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-white mb-6"
                >
                  Add New Course
                </motion.h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                      <AnimatedInput
                        label="Course Code"
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g., CS101"
                        required
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      <AnimatedInput
                        label="Course Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Introduction to Computer Science"
                        required
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      <label className="block text-white font-semibold mb-2">Credits</label>
                      <select
                        name="credits"
                        value={formData.credits}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-navy-800/50 border border-blue-500/30 rounded-lg text-white transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      <AnimatedInput
                        label="Category"
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g., Core, Elective"
                      />
                    </motion.div>
                    <motion.div className="md:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <AnimatedInput
                        label="Level"
                        type="text"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        placeholder="e.g., Undergraduate, Graduate"
                      />
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4"
                  >
                    <AnimatedButton type="submit" variant="primary" size="lg">
                      Add Course
                    </AnimatedButton>
                    <AnimatedButton
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </AnimatedButton>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <AnimatedInput
              label="Search Courses"
              type="search"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search by course name or code..."
              leftIcon={<BookOpen className="w-5 h-5" />}
            />
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <LoadingSkeleton key={i} type="card" count={1} height="h-48" />
              ))}
            </div>
          ) : (
            <>
              {/* Courses Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, idx) => {
                      const colorScheme = courseColors[idx % courseColors.length];
                      return (
                        <motion.div
                          key={course.id}
                          variants={itemVariants}
                          transition={{ duration: 0.5 }}
                          layout
                          whileHover={{ y: -8 }}
                          className={`group relative bg-gradient-to-br ${colorScheme.light} border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm overflow-hidden cursor-pointer transition-all`}
                        >
                          {/* Background Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                          {/* Content */}
                          <motion.div className="relative z-10">
                            {/* Header */}
                            <div className="mb-4">
                              <motion.div
                                className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${colorScheme.bg} mb-3`}
                              >
                                {course.code}
                              </motion.div>
                              <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                              {course.category && (
                                <p className="text-sm text-blue-300">{course.category}</p>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-blue-400/30">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2"
                              >
                                <Award className="w-4 h-4 text-yellow-400" />
                                <div>
                                  <p className="text-xs text-gray-300">Credits</p>
                                  <p className="text-sm font-bold text-white">{course.credits}</p>
                                </div>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2"
                              >
                                <Users className="w-4 h-4 text-cyan-400" />
                                <div>
                                  <p className="text-xs text-gray-300">Students</p>
                                  <p className="text-sm font-bold text-white">{course.students_count || 0}</p>
                                </div>
                              </motion.div>
                            </div>

                            {/* Level Badge */}
                            {course.level && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-sm text-purple-300"
                              >
                                <Clock className="w-4 h-4" />
                                {course.level}
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center py-16"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-6xl mb-4"
                      >
                        📭
                      </motion.div>
                      <p className="text-xl text-gray-300 mb-4">
                        {searchTerm ? 'No courses match your search' : 'No courses found'}
                      </p>
                      <p className="text-gray-400">
                        {searchTerm ? 'Try a different search term' : 'Add your first course to get started'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default FacultyCoursesPage;
