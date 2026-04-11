import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';
import { Button } from '../../components/common';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Plus,
  Clock,
  Award,
  Users,
  X,
  ArrowRight,
  Zap,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category?: string;
  level?: string;
  semester?: string;
}

const FacultyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    category: '',
    level: '',
    semester: 'Fall 2024'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiService.get<{ status: string; courses?: Course[]; message?: string }>('/faculty/courses');
      if (response.status === 'success') {
        setCourses(response.courses || []);
      } else {
        throw new Error(response.message || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to fetch courses. Please make sure you are logged in as faculty.';
      toast.error(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Course code and name are required');
      return;
    }

    if (!formData.semester || !formData.semester.trim()) {
      toast.error('Please select a semester for the course');
      return;
    }

    if (formData.credits < 1 || formData.credits > 6) {
      toast.error('Credits must be between 1 and 6');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.post<{ status: string; message?: string; course?: Course }>('/faculty/courses', formData);
      if (response.status === 'success') {
        setCourses([...courses, response.course!]);
        setFormData({ code: '', name: '', credits: 3, category: '', level: '', semester: 'Fall 2024' });
        setShowForm(false);
        const facultyName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Faculty';
        toast.success(`${facultyName}: Course added successfully!`);
      } else {
        toast.error(response.message || 'Failed to add course');
      }
    } catch (error: any) {
      console.error('Error adding course:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add course';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) : value
    }));
  };

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
      transition: { duration: 0.6 },
    },
  };

  const totalCredits = courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <BookOpen className="w-16 h-16 text-cyan-400 mx-auto" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-2xl font-bold"
          >
            Loading your courses...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-4 md:p-8"
    >
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <BookOpen className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-cyan-300 font-semibold text-sm uppercase tracking-widest">Faculty Dashboard</p>
              <h1 className="text-5xl md:text-6xl font-black text-white mt-2">My Courses</h1>
            </div>
          </motion.div>
          <motion.p variants={itemVariants} className="text-cyan-200/80 text-lg max-w-3xl">
            Create and manage your courses with an intuitive interface. Add new courses, organize by category, and track your teaching roster.
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: BookOpen, label: 'Total Courses', value: courses.length, color: 'from-blue-500 to-blue-600' },
            { icon: Clock, label: 'Credits Teaching', value: totalCredits, color: 'from-purple-500 to-purple-600' },
            { icon: Zap, label: 'Active Status', value: 'Ready', color: 'from-emerald-500 to-emerald-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ translateY: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300`} />
              <div className="relative bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Course Button */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="relative group w-full md:w-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative px-8 py-4 bg-slate-900 rounded-2xl flex items-center justify-center gap-3 font-bold text-white hover:bg-slate-800 transition">
              {showForm ? (
                <>
                  <X className="w-5 h-5" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add New Course
                </>
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Course Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-slate-900/90 backdrop-blur border border-slate-700 rounded-3xl p-8 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-6">Create New Course</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Course Code */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                          Course Code *
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., CS101"
                          className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                        />
                      </motion.div>

                      {/* Course Name */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                          Course Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Introduction to Programming"
                          className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                        />
                      </motion.div>

                      {/* Credits */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                          Credits (1-6)
                        </label>
                        <select
                          name="credits"
                          value={formData.credits}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num} Credit{num !== 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </motion.div>

                      {/* Category */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                          Category
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          placeholder="e.g., Core, Elective, Lab"
                          className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                        />
                      </motion.div>

                      {/* Level */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                          Level
                        </label>
                        <input
                          type="text"
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          placeholder="e.g., Undergraduate, Graduate"
                          className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                        />
                      </motion.div>

                      {/* Semester */}
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider mb-3">
                          Semester
                        </label>
                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                        >
                          <option value="Fall 2024">Fall 2024</option>
                          <option value="Spring 2025">Spring 2025</option>
                          <option value="Summer 2025">Summer 2025</option>
                          <option value="Fall 2025">Fall 2025</option>
                          <option value="Spring 2026">Spring 2026</option>
                          <option value="Summer 2026">Summer 2026</option>
                        </select>
                      </motion.div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Create Course
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-3xl"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <BookOpen className="w-20 h-20 text-slate-500 mx-auto mb-4" />
            </motion.div>
            <p className="text-2xl font-bold text-white mb-2">No Courses Yet</p>
            <p className="text-slate-300">Create your first course to get started</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative h-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />

                <div className="relative h-full bg-slate-900/60 backdrop-blur border border-slate-700 rounded-3xl p-8 overflow-hidden">
                  {/* Animated top bar */}
                  <motion.div
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Course Color Indicator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500'][idx % 5]}`} />
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-400">{course.category || 'Course'}</span>
                  </div>

                  {/* Course Code Badge */}
                  <div className="inline-block mb-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold">
                      {course.code}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition line-clamp-2">
                    {course.name}
                  </h3>

                  {/* Course Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300 font-semibold">{course.credits} Credit{course.credits !== 1 ? 's' : ''}</span>
                    </div>
                    {course.level && (
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-300 font-semibold">{course.level}</span>
                      </div>
                    )}
                    {course.semester && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-sky-400" />
                        <span className="text-slate-300 font-semibold">{course.semester}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Manage Course
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyCoursesPage;
