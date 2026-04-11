import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Send, Loader, AlertCircle, Calendar, Clock, Users, BookOpen, Upload } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface Course {
  id: number;
  code: string;
  name: string;
  students_count: number;
}

interface FormData {
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  due_time: string;
  instructions: string;
  attachments?: string;
  max_score?: string;
  allow_late_submission: boolean;
  late_submission_days?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultyPostAssignmentPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    course_id: '',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_time: '23:59',
    instructions: '',
    attachments: '',
    max_score: '100',
    allow_late_submission: true,
    late_submission_days: '3',
  });

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(`/faculty/get_faculty_courses.php?faculty_id=${user.id}`) as any;
      const coursesData = Array.isArray(response?.data) ? response.data : response?.data?.courses || [];
      setCourses(coursesData);
      showSuccess('Courses loaded');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      showError('Failed to load courses');
      // Fallback data
      setCourses([
        { id: 1, code: 'CS101', name: 'Data Structures', students_count: 45 },
        { id: 2, code: 'CS102', name: 'Web Development', students_count: 38 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setFormData({ ...formData, course_id: course.id.toString() });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Assignment title is required');
      return false;
    }
    if (!formData.description.trim()) {
      showError('Assignment description is required');
      return false;
    }
    if (!formData.course_id) {
      showError('Please select a course');
      return false;
    }
    if (new Date(formData.due_date) <= new Date()) {
      showError('Due date must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        due_datetime: `${formData.due_date} ${formData.due_time}`,
        faculty_id: user?.id,
      };

      const response = await apiService.post('/faculty/post_assignment.php', payload) as any;
      
      if (response?.success || response?.status === 'success') {
        showSuccess('Assignment posted successfully to ' + selectedCourse?.students_count + ' students!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          course_id: '',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          due_time: '23:59',
          instructions: '',
          attachments: '',
          max_score: '100',
          allow_late_submission: true,
          late_submission_days: '3',
        });
        setSelectedCourse(null);
      } else {
        showError('Failed to post assignment');
      }
    } catch (error) {
      console.error('Failed to post assignment:', error);
      showError('Failed to post assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysUntilDue = () => {
    const due = new Date(formData.due_date).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-3 flex items-center gap-3">
              <FileText size={50} className="text-purple-400" />
              Post New Assignment
            </h1>
            <p className="text-gray-400 text-lg">Create and distribute assignments to your students</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Course Selection Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-400" />
                  Select Course
                </h3>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {courses.map((course) => (
                      <motion.button
                        key={course.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCourseSelect(course)}
                        className={`w-full p-4 rounded-lg transition-all text-left ${
                          selectedCourse?.id === course.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-400 shadow-lg shadow-purple-500/50'
                            : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <p className={`font-semibold ${selectedCourse?.id === course.id ? 'text-white' : 'text-gray-300'}`}>
                          {course.code}
                        </p>
                        <p className={`text-xs mt-1 ${selectedCourse?.id === course.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {course.name}
                        </p>
                        <p className={`text-xs mt-1 font-semibold ${selectedCourse?.id === course.id ? 'text-white/90' : 'text-gray-400'}`}>
                          📚 {course.students_count} Students
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Card */}
              <motion.div
                variants={itemVariants}
                className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-2xl p-4"
              >
                <p className="text-sm text-blue-200">
                  💡 <span className="font-semibold">Tip:</span> Set a clear due date and provide detailed instructions for best student engagement.
                </p>
              </motion.div>
            </motion.div>

            {/* Form Section */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!selectedCourse ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center"
                  >
                    <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Course</h3>
                    <p className="text-gray-400">Choose a course from the left sidebar to begin posting an assignment</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Selected Course Info */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300 mb-1">Posting to</p>
                          <h4 className="text-2xl font-bold text-white">{selectedCourse.code} - {selectedCourse.name}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-300">{selectedCourse.students_count}</p>
                          <p className="text-sm text-gray-400">Students will receive this</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Title & Description */}
                    <div className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Assignment Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="e.g., Binary Search Tree Implementation"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Description *</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 min-h-[120px] resize-none transition-all"
                          placeholder="Provide a clear overview of what students need to do..."
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Detailed Instructions</label>
                        <textarea
                          value={formData.instructions}
                          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 min-h-[140px] resize-none transition-all"
                          placeholder="Step-by-step instructions, grading criteria, resources, etc..."
                        />
                      </motion.div>
                    </div>

                    {/* Due Date & Time */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Due Date *</label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Calendar size={14} />
                          {getDaysUntilDue()} days from now
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Due Time</label>
                        <input
                          type="time"
                          value={formData.due_time}
                          onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Max Score & Late Submission */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Max Score</label>
                        <input
                          type="number"
                          value={formData.max_score}
                          onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Late Submission Days</label>
                        <input
                          type="number"
                          value={formData.late_submission_days}
                          onChange={(e) => setFormData({ ...formData, late_submission_days: e.target.value })}
                          disabled={!formData.allow_late_submission}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 disabled:opacity-50 transition-all"
                          placeholder="3"
                        />
                      </div>
                    </motion.div>

                    {/* Allow Late Submission */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <input
                        type="checkbox"
                        id="allowLate"
                        checked={formData.allow_late_submission}
                        onChange={(e) => setFormData({ ...formData, allow_late_submission: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label htmlFor="allowLate" className="text-gray-300 cursor-pointer">
                        Allow late submissions for a grace period
                      </label>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          <Loader size={22} className="animate-spin" />
                          Posting Assignment...
                        </>
                      ) : (
                        <>
                          <Send size={22} />
                          Post Assignment to {selectedCourse.students_count} Students
                        </>
                      )}
                    </motion.button>

                    {/* Info Message */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-sm text-green-200"
                    >
                      ✅ All {selectedCourse.students_count} students enrolled in {selectedCourse.code} will receive an email notification when you post this assignment.
                    </motion.div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyPostAssignmentPageProfessional;
