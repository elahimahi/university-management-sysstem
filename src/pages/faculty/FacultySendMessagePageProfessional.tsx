import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader, AlertCircle, Users, BookOpen, Paperclip, Smile, CheckCircle2, Clock } from 'lucide-react';
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

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  student_id: string;
}

interface FormData {
  subject: string;
  message: string;
  recipients: 'all' | 'specific';
  course_id: string;
  selected_students: number[];
  message_type: 'announcement' | 'reminder' | 'feedback' | 'general';
  priority: 'low' | 'normal' | 'high';
  send_email: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultySendMessagePageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    message: '',
    recipients: 'all',
    course_id: '',
    selected_students: [],
    message_type: 'general',
    priority: 'normal',
    send_email: true,
  });

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  useEffect(() => {
    if (formData.course_id && formData.recipients === 'specific') {
      fetchStudents();
    }
  }, [formData.course_id, formData.recipients]);

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
      setCourses([
        { id: 1, code: 'CS101', name: 'Data Structures', students_count: 45 },
        { id: 2, code: 'CS102', name: 'Web Development', students_count: 38 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      if (!user?.id || !formData.course_id) return;

      const response = await apiService.get(
        `/faculty/get_course_students.php?faculty_id=${user.id}&course_id=${formData.course_id}`
      ) as any;
      
      const courseData = Array.isArray(response?.data) 
        ? response.data.find((c: any) => c.id === parseInt(formData.course_id))
        : null;
      
      const studentsData = courseData?.students || [];
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      showError('Failed to load students');
      setStudents([
        { id: 1, firstname: 'John', lastname: 'Doe', email: 'john@uni.edu', student_id: 'STU001' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', email: 'jane@uni.edu', student_id: 'STU002' },
      ]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const validateForm = () => {
    if (!formData.subject.trim()) {
      showError('Message subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      showError('Message content is required');
      return false;
    }
    if (!formData.course_id) {
      showError('Please select a course');
      return false;
    }
    if (formData.recipients === 'specific' && formData.selected_students.length === 0) {
      showError('Select at least one student');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const selectedCourse = courses.find(c => c.id === parseInt(formData.course_id));
      
      const payload = {
        ...formData,
        faculty_id: user?.id,
        recipient_count: formData.recipients === 'all' 
          ? selectedCourse?.students_count 
          : formData.selected_students.length,
      };

      const response = await apiService.post('/faculty/send_message.php', payload) as any;
      
      if (response?.success || response?.status === 'success') {
        const recipientCount = formData.recipients === 'all'
          ? selectedCourse?.students_count
          : formData.selected_students.length;

        showSuccess(`Message sent to ${recipientCount} student${recipientCount !== 1 ? 's' : ''}!`);
        
        // Add to sent messages list
        setSentMessages([
          {
            id: Date.now(),
            subject: formData.subject,
            course: selectedCourse?.code,
            recipients: recipientCount,
            timestamp: new Date().toLocaleTimeString(),
            type: formData.message_type,
          },
          ...sentMessages,
        ]);

        // Reset form
        setFormData({
          subject: '',
          message: '',
          recipients: 'all',
          course_id: '',
          selected_students: [],
          message_type: 'general',
          priority: 'normal',
          send_email: true,
        });
      } else {
        showError('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      showError('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStudent = (studentId: number) => {
    setFormData(prev => ({
      ...prev,
      selected_students: prev.selected_students.includes(studentId)
        ? prev.selected_students.filter(id => id !== studentId)
        : [...prev.selected_students, studentId]
    }));
  };

  const selectedCourse = courses.find(c => c.id === parseInt(formData.course_id));
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'reminder': return '⏰';
      case 'feedback': return '💬';
      default: return '💌';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'normal': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-3 flex items-center gap-3">
              <MessageCircle size={50} className="text-cyan-400" />
              Send Message
            </h1>
            <p className="text-gray-400 text-lg">Communicate with students in your courses</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Sidebar - Sent Messages */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 sticky top-8 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-400" />
                  Sent Today
                </h3>

                {sentMessages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No messages sent yet</p>
                ) : (
                  <div className="space-y-2">
                    {sentMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-green-500/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getMessageTypeIcon(msg.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-300 truncate">{msg.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">{msg.course}</p>
                            <p className="text-xs text-green-400 font-semibold mt-1">✓ {msg.recipients} sent</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Main Form */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Selection */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Select Course *</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value, selected_students: [] })}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  >
                    <option value="" className="bg-slate-900">Select a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id} className="bg-slate-900">
                        {course.code} - {course.name} ({course.students_count} students)
                      </option>
                    ))}
                  </select>
                </motion.div>

                {formData.course_id && (
                  <>
                    {/* Selected Course Info */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300 mb-1">Course</p>
                          <h4 className="text-2xl font-bold text-white">{selectedCourse?.code} - {selectedCourse?.name}</h4>
                        </div>
                        <div className="text-right">
                          <Users size={32} className="text-cyan-400 opacity-70" />
                          <p className="text-2xl font-bold text-cyan-300 mt-1">{selectedCourse?.students_count}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Message Type & Priority */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Message Type</label>
                        <select
                          value={formData.message_type}
                          onChange={(e) => setFormData({ ...formData, message_type: e.target.value as any })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        >
                          <option value="general" className="bg-slate-900">💌 General Message</option>
                          <option value="announcement" className="bg-slate-900">📢 Announcement</option>
                          <option value="reminder" className="bg-slate-900">⏰ Reminder</option>
                          <option value="feedback" className="bg-slate-900">💬 Feedback</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        >
                          <option value="low" className="bg-slate-900">📦 Low</option>
                          <option value="normal" className="bg-slate-900">→ Normal</option>
                          <option value="high" className="bg-slate-900">🔴 High</option>
                        </select>
                      </div>
                    </motion.div>

                    {/* Recipients Selection */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Send To</label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, recipients: 'all', selected_students: [] })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.recipients === 'all'
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <Users size={20} className="mx-auto mb-2" />
                          <p className="font-semibold text-sm">All {selectedCourse?.students_count} Students</p>
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, recipients: 'specific' })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.recipients === 'specific'
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <Users size={20} className="mx-auto mb-2" />
                          <p className="font-semibold text-sm">Select Students</p>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Student Selection */}
                    {formData.recipients === 'specific' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6"
                      >
                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <BookOpen size={18} className="text-cyan-400" />
                          Select Students to Message
                        </h4>
                        {loadingStudents ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                            {students.map((student) => (
                              <motion.label
                                key={student.id}
                                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.selected_students.includes(student.id)}
                                  onChange={() => handleToggleStudent(student.id)}
                                  className="w-5 h-5 accent-cyan-400"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {student.firstname} {student.lastname}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">{student.student_id}</p>
                                </div>
                              </motion.label>
                            ))}
                          </div>
                        )}
                        {formData.selected_students.length > 0 && (
                          <p className="text-sm text-cyan-400 font-semibold mt-4">
                            ✓ {formData.selected_students.length} student{formData.selected_students.length !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Subject */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        placeholder="e.g., Important: Midterm Exam Schedule"
                      />
                    </motion.div>

                    {/* Message Content */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 min-h-[180px] resize-none transition-all"
                        placeholder="Type your message here..."
                      />
                      <p className="text-xs text-gray-500 mt-2">{formData.message.length} characters</p>
                    </motion.div>

                    {/* Email Option */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <input
                        type="checkbox"
                        id="sendEmail"
                        checked={formData.send_email}
                        onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                        className="w-5 h-5 accent-cyan-400"
                      />
                      <label htmlFor="sendEmail" className="text-gray-300 cursor-pointer">
                        📧 Send email notification to students
                      </label>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 rounded-2xl text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          <Loader size={22} className="animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send size={22} />
                          Send Message to{' '}
                          {formData.recipients === 'all'
                            ? `${selectedCourse?.students_count} Students`
                            : `${formData.selected_students.length} Student${formData.selected_students.length !== 1 ? 's' : ''}`}
                        </>
                      )}
                    </motion.button>

                    {/* Info Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-sm text-blue-200 flex items-start gap-3"
                    >
                      <Clock size={18} className="flex-shrink-0 mt-0.5" />
                      <p>
                        Students will receive the message in their dashboard immediately{formData.send_email ? ' and via email' : ''}.
                      </p>
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

export default FacultySendMessagePageProfessional;
