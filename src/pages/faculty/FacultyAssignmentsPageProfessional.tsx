import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Edit2, Calendar, Clock, AlertCircle, Upload, Loader, Eye, EyeOff } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  course_code: string;
  course_name: string;
  due_date: string;
  created_at: string;
  status: 'active' | 'closed' | 'archived';
  student_submissions?: number;
}

interface FormData {
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  status: 'active' | 'closed' | 'archived';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultyAssignmentsPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    course_id: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const [assignmentsRes, coursesRes] = await Promise.all([
        apiService.get(`/faculty/get_assignments.php?faculty_id=${user.id}`) as any,
        apiService.get(`/faculty/get_faculty_courses.php?faculty_id=${user.id}`) as any,
      ]);

      const assignmentsData = Array.isArray(assignmentsRes?.data) ? assignmentsRes.data : assignmentsRes?.data?.assignments || [];
      const coursesData = Array.isArray(coursesRes?.data) ? coursesRes.data : coursesRes?.data?.courses || [];
      
      setAssignments(assignmentsData);
      setCourses(coursesData);
      showSuccess('Assignments loaded');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.course_id) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = editingId ? '/faculty/update_assignment.php' : '/faculty/create_assignment.php';
      const payload = editingId ? { ...formData, id: editingId } : formData;

      await apiService.post(endpoint, payload) as any;
      showSuccess(editingId ? 'Assignment updated' : 'Assignment created');
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', description: '', course_id: '', due_date: '', status: 'active' });
      await fetchData();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      showError('Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      course_id: assignment.course_id.toString(),
      due_date: assignment.due_date,
      status: assignment.status,
    });
    setEditingId(assignment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this assignment?')) {
      try {
        await apiService.post('/faculty/delete_assignment.php', { id }) as any;
        setAssignments(prev => prev.filter(a => a.id !== id));
        showSuccess('Assignment deleted');
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        showError('Failed to delete assignment');
      }
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = new Date().getTime();
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'closed': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'archived': return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
      default: return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="text-purple-400" size={40} />
                Assignments
              </h1>
              <p className="text-gray-400">Create and manage course assignments</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '', description: '', course_id: '', due_date: '', status: 'active' });
                setShowForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              New Assignment
            </motion.button>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="closed" className="bg-slate-900">Closed</option>
              <option value="archived" className="bg-slate-900">Archived</option>
            </select>
          </motion.div>

          {/* Create/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
              >
                <motion.div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10">
                  <h2 className="text-3xl font-bold text-white mb-6">
                    {editingId ? 'Edit Assignment' : 'Create Assignment'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                        placeholder="Enter assignment title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Course *</label>
                      <select
                        value={formData.course_id}
                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="" className="bg-slate-900">Select a course...</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id} className="bg-slate-900">
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 min-h-[120px] resize-none"
                        placeholder="Enter assignment details"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date</label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="active" className="bg-slate-900">Active</option>
                          <option value="closed" className="bg-slate-900">Closed</option>
                          <option value="archived" className="bg-slate-900">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            {editingId ? 'Update' : 'Create'}
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Assignments Grid */}
          {loading ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-24" />
              ))}
            </motion.div>
          ) : filteredAssignments.length === 0 ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No assignments found</h3>
              <p className="text-gray-400">Create your first assignment to get started</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAssignments.map((assignment, idx) => (
                <motion.div
                  key={assignment.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 truncate">{assignment.title}</h3>
                      <p className="text-sm text-gray-400">{assignment.course_code} - {assignment.course_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{assignment.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                    {getDaysUntilDue(assignment.due_date) >= 0 && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{getDaysUntilDue(assignment.due_date)} days left</span>
                      </div>
                    )}
                  </div>

                  {assignment.student_submissions !== undefined && (
                    <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400">Submissions</p>
                      <p className="text-sm font-bold text-blue-300">{assignment.student_submissions} received</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(assignment)}
                      className="flex-1 px-3 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg font-semibold hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(assignment.id)}
                      className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyAssignmentsPageProfessional;
