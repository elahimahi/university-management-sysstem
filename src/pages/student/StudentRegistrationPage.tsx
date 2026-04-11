import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Filter, ChevronDown, CheckCircle2, Users, Clock, LayoutDashboard, CheckSquare, CreditCard } from 'lucide-react';
import { apiService } from '../../services/api.service';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [semester, setSemester] = useState<string>('Spring 2025');
  const [filter, setFilter] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const availableResponse = await apiService.get<{ status: string; courses: Course[] }>(
        '/courses/available'
      );
      if (availableResponse.status === 'success') {
        setAvailableCourses(availableResponse.courses || []);
      }

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
        toast.success('Successfully enrolled in course!');
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
    return enrolledCourses.some((course) => course.id === courseId && course.status === 'active');
  };

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch = 
      course.code.toLowerCase().includes(filter.toLowerCase()) ||
      course.name.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || course.level?.toLowerCase() === selectedLevel.toLowerCase();
    
    return matchesSearch && matchesLevel;
  });

  const totalCredits = enrolledCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/student/dashboard' },
    { label: 'Registration', icon: <BookOpen size={20} />, href: '/student/registration' },
    { label: 'Grades', icon: <CheckSquare size={20} />, href: '/student/grades' },
    { label: 'Attendance', icon: <Clock size={20} />, href: '/student/attendance' },
    { label: 'Fees', icon: <CreditCard size={20} />, href: '/student/fees' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-200 dark:border-blue-400 border-t-blue-600 dark:border-t-blue-200 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 text-slate-900 dark:text-white">
      <Navbar
        items={[]}
        rightContent={
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        }
      />

      <div className="flex pt-16">
        <Sidebar
          items={menuItems}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className={`flex-1 transition-all duration-300 p-6 md:p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Course Registration
              </h1>
              <p className="text-slate-600 dark:text-slate-300">Select and enroll in courses for your upcoming semester</p>
            </motion.div>

            {/* Enrolled Courses Summary */}
            {enrolledCourses.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-400/20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-8"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-300 rounded-full opacity-5 -mr-20 -mt-20" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">
                      Your Enrolled Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Total Courses</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{enrolledCourses.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Total Credits</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalCredits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Status</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Active</p>
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 size={48} className="text-emerald-500 opacity-20" />
                </div>
              </motion.div>
            )}

            {/* Enrolled Courses Cards */}
            {enrolledCourses.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-2xl font-bold mb-4">Enrolled Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="relative overflow-hidden rounded-xl border-2 border-emerald-500/50 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-emerald-950/20 p-6 shadow-lg"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 rounded-full opacity-5 -mr-10 -mt-10" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{course.code}</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{course.name}</h3>
                          </div>
                          <CheckCircle2 size={24} className="text-emerald-500" />
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-semibold text-slate-600 dark:text-slate-300">Credits:</span> {course.credits}</p>
                          <p><span className="font-semibold text-slate-600 dark:text-slate-300">Semester:</span> {course.semester}</p>
                          <p className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold capitalize mt-2">
                            {course.status}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Course Registration Section */}
            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              {/* Semester & Search Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Semester Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Select Semester
                  </label>
                  <div className="relative">
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium transition-colors pr-10"
                    >
                      <option value="">Choose a semester...</option>
                      <option value="Spring 2025">Spring 2025</option>
                      <option value="Summer 2025">Summer 2025</option>
                      <option value="Fall 2025">Fall 2025</option>
                      <option value="Winter 2025">Winter 2025</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Search Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Search Courses
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by code or name..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{filteredCourses.length}</span> courses
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                  >
                    <h3 className="font-semibold mb-4">Course Level</h3>
                    <div className="flex flex-wrap gap-3">
                      {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedLevel === level
                              ? 'bg-blue-500 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                          }`}
                        >
                          {level === 'all' ? 'All Levels' : level}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredCourses.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                    >
                      <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No courses found</p>
                      <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
                    </motion.div>
                  ) : (
                    filteredCourses.map((course) => {
                      const enrolled = isEnrolled(course.id);
                      return (
                        <motion.div
                          key={course.id}
                          variants={itemVariants}
                          whileHover={{ y: -8 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all cursor-pointer ${
                            enrolled
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400'
                          }`}
                        >
                          {/* Background gradient */}
                          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -mr-10 -mt-10 ${enrolled ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          
                          <div className="relative space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{course.code}</p>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{course.name}</h3>
                              </div>
                              {enrolled && <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />}
                            </div>

                            {/* Course Details */}
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Credits:</span>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-semibold">
                                  {course.credits}
                                </span>
                              </div>
                              {course.level && (
                                <p><span className="font-semibold">Level:</span> {course.level}</p>
                              )}
                              {course.first_name && (
                                <p><span className="font-semibold">Instructor:</span> {course.first_name} {course.last_name}</p>
                              )}
                              {course.enrolled_count !== undefined && (
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                  <Users size={14} />
                                  <span>{course.enrolled_count} students enrolled</span>
                                </div>
                              )}
                            </div>

                            {/* Enroll Button */}
                            <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrolled || enrolling === course.id}
                              className={`w-full mt-4 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                                enrolled
                                  ? 'bg-emerald-500 text-white cursor-not-allowed'
                                  : enrolling === course.id
                                  ? 'bg-blue-400 text-white cursor-wait'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                              }`}
                            >
                              <Plus size={18} />
                              {enrolled ? 'Already Enrolled' : enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default StudentRegistrationPage;
