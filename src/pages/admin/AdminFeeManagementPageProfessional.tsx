import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Edit2, Trash2, Loader, AlertCircle, TrendingUp, Users, BarChart3 } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface FeeStructure {
  id: number;
  name: string;
  amount: number;
  description: string;
  due_date: string;
  status: 'active' | 'inactive';
  academic_year: string;
  semester: string;
}

interface FormData {
  name: string;
  amount: string;
  description: string;
  due_date: string;
  academic_year: string;
  semester: string;
  status: 'active' | 'inactive';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AdminFeeManagementPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    amount: '',
    description: '',
    due_date: '',
    academic_year: new Date().getFullYear().toString(),
    semester: 'Fall',
    status: 'active',
  });

  useEffect(() => {
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      fetchFeeStructures();
    }
  }, [user?.role]);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/get_fee_structures.php') as any;
      const feesData = Array.isArray(response?.data) ? response.data : response?.data?.fees || [];
      setFeeStructures(feesData);
      showSuccess('Fee structures loaded');
    } catch (error) {
      console.error('Failed to fetch fees:', error);
      showError('Failed to load fee structures');
      setFeeStructures([
        { id: 1, name: 'Tuition Fee', amount: 5000, description: 'Per semester tuition', due_date: '2024-09-01', status: 'active', academic_year: '2024', semester: 'Fall' },
        { id: 2, name: 'Library Fee', amount: 500, description: 'Library access fee', due_date: '2024-09-01', status: 'active', academic_year: '2024', semester: 'Fall' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.due_date) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = editingId ? '/admin/update_fee_structure.php' : '/admin/create_fee_structure.php';
      const payload = editingId ? { ...formData, id: editingId } : formData;

      await apiService.post(endpoint, payload) as any;
      showSuccess(editingId ? 'Fee structure updated' : 'Fee structure created');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        amount: '',
        description: '',
        due_date: '',
        academic_year: new Date().getFullYear().toString(),
        semester: 'Fall',
        status: 'active',
      });
      await fetchFeeStructures();
    } catch (error) {
      console.error('Failed to save fee structure:', error);
      showError('Failed to save fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (fee: FeeStructure) => {
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      description: fee.description,
      due_date: fee.due_date,
      academic_year: fee.academic_year,
      semester: fee.semester,
      status: fee.status,
    });
    setEditingId(fee.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this fee structure? All associated student fees will be affected.')) {
      try {
        await apiService.post('/admin/delete_fee_structure.php', { id }) as any;
        setFeeStructures(prev => prev.filter(f => f.id !== id));
        showSuccess('Fee structure deleted');
      } catch (error) {
        console.error('Failed to delete fee:', error);
        showError('Failed to delete fee structure');
      }
    }
  };

  const filteredFees = feeStructures.filter(f => {
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalFees = feeStructures.reduce((sum, f) => sum + f.amount, 0);
  const activeFees = feeStructures.filter(f => f.status === 'active').length;

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <DollarSign className="text-green-400" size={40} />
                Fee Management
              </h1>
              <p className="text-gray-400">Create and manage fee structures for all students</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  amount: '',
                  description: '',
                  due_date: '',
                  academic_year: new Date().getFullYear().toString(),
                  semester: 'Fall',
                  status: 'active',
                });
                setShowForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              New Fee
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6"
            >
              <p className="text-gray-300 text-sm mb-2">Total Fee Structures</p>
              <p className="text-3xl font-bold text-blue-300">{feeStructures.length}</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6"
            >
              <p className="text-gray-300 text-sm mb-2">Active Fees</p>
              <p className="text-3xl font-bold text-green-300">{activeFees}</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6"
            >
              <p className="text-gray-300 text-sm mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-purple-300">৳{totalFees.toLocaleString()}</p>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input
              type="text"
              placeholder="Search fee structures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-green-400"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="inactive" className="bg-slate-900">Inactive</option>
            </select>
          </motion.div>

          {/* Create/Edit Form Modal */}
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
                    {editingId ? 'Edit Fee Structure' : 'Create New Fee Structure'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Fee Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                          placeholder="e.g., Tuition Fee"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (৳) *</label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                          placeholder="5000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 min-h-[100px] resize-none"
                        placeholder="Fee details..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date *</label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Academic Year</label>
                        <input
                          type="text"
                          value={formData.academic_year}
                          onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Semester</label>
                        <select
                          value={formData.semester}
                          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                        >
                          <option value="Fall">Fall</option>
                          <option value="Spring">Spring</option>
                          <option value="Summer">Summer</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          editingId ? 'Update' : 'Create'
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

          {/* Fee Structures Grid */}
          {loading ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-20" />
              ))}
            </motion.div>
          ) : filteredFees.length === 0 ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No fee structures found</h3>
              <p className="text-gray-400">Create your first fee structure to get started</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-4">
              {filteredFees.map((fee, idx) => (
                <motion.div
                  key={fee.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">{fee.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{fee.academic_year} - {fee.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="text-2xl font-bold text-green-400">৳{fee.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Due Date</p>
                      <p className="text-white font-semibold">{new Date(fee.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        fee.status === 'active' 
                          ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                          : 'bg-gray-500/20 border border-gray-500/50 text-gray-300'
                      }`}>
                        {fee.status}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(fee)}
                        className="p-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit2 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(fee.id)}
                        className="p-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
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

export default AdminFeeManagementPageProfessional;
