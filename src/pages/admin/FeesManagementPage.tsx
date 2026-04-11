import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Trash2, AlertCircle, CheckCircle, Search, Filter, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

interface Fee {
  id: number;
  student_id: number;
  amount: number;
  semester: string;
  due_date: string;
  status: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeesManagementPage: React.FC = () => {
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  const [fees, setFees] = useState<Fee[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    semester: 'Fall 2024',
    due_date: '',
  });

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    filterFees();
  }, [fees, searchTerm, statusFilter]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/get_all_fees.php`);
      const data = await response.json();

      if (response.ok) {
        setFees(data.fees || []);
        showSuccess('Fees loaded successfully');
      } else {
        showError(data.message || 'Failed to fetch fees');
      }
    } catch (err) {
      showError('Network error while fetching fees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = fees;

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.id.toString().includes(searchTerm) ||
        f.student_id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    setFilteredFees(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const studentId = formData.student_id ? parseInt(formData.student_id as string) : null;
    const amount = formData.amount ? parseFloat(formData.amount as string) : null;

    if (!studentId || !amount) {
      showError('Student ID and amount are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/create-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: [studentId],
          description: 'Fee',
          amount: amount,
          due_date: formData.due_date,
          payment_deadline: formData.due_date,
          penalty_percentage: 5,
          apply_after_days: 7,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Fee created successfully!');
        setShowForm(false);
        setFormData({
          student_id: '',
          amount: '',
          semester: 'Fall 2024',
          due_date: '',
        });
        fetchFees();
      } else {
        showError(data.message || 'Failed to create fee');
      }
    } catch (err) {
      showError('Network error while creating fee');
      console.error(err);
    }
  };

  const handleDelete = async (feeId: number) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete_fee.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_id: feeId }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Fee deleted successfully');
        setFees(fees.filter(f => f.id !== feeId));
      } else {
        showError(data.message || 'Failed to delete fee');
      }
    } catch (err) {
      showError('Network error while deleting fee');
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
      case 'overdue':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-300';
    }
  };

  const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0);
  const paidAmount = fees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0);
  const pendingAmount = totalAmount - paidAmount;

  const stats = [
    { label: 'Total Amount', value: `$${totalAmount.toFixed(2)}`, color: 'from-blue-500 to-cyan-500', icon: DollarSign, subtext: fees.length + ' fees' },
    { label: 'Paid Amount', value: `$${paidAmount.toFixed(2)}`, color: 'from-green-500 to-emerald-500', icon: CheckCircle, subtext: Math.round((paidAmount / totalAmount) * 100 || 0) + '% collected' },
    { label: 'Pending Amount', value: `$${pendingAmount.toFixed(2)}`, color: 'from-orange-500 to-red-500', icon: AlertCircle, subtext: 'Due soon' },
  ];

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                <DollarSign size={28} />
              </div>
              Fees Management
            </h1>
            <p className="text-gray-400 text-lg">Manage student fees and payment tracking</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-10 backdrop-blur-xl hover:border-white/20 transition-all`}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                      <p className="text-xs text-gray-500">{stat.subtext}</p>
                    </div>
                    <Icon size={32} className="opacity-20" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus size={20} />
              {showForm ? 'Cancel' : 'Add Fee'}
            </motion.button>
          </motion.div>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8 backdrop-blur-xl"
              >
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <label className="text-sm text-gray-400 mb-2 block">Student ID</label>
                      <input
                        type="number"
                        placeholder="Enter student ID"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all"
                        required
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                      <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all"
                        required
                        step="0.01"
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <label className="text-sm text-gray-400 mb-2 block">Due Date</label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                      <label className="text-sm text-gray-400 mb-2 block">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all"
                      >
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Spring 2025">Spring 2025</option>
                        <option value="Summer 2025">Summer 2025</option>
                      </select>
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20"
                  >
                    Create Fee
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fees Table */}
          {loading ? (
            <LoadingSkeleton type="card" count={5} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-white/20 transition-all"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Semester</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {filteredFees.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <p className="text-gray-400 text-lg">No fees found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredFees.map((fee, idx) => (
                          <motion.tr
                            key={fee.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-white/5 transition-all"
                          >
                            <td className="px-6 py-4 text-white font-medium">{fee.student_id}</td>
                            <td className="px-6 py-4 text-white font-bold">${parseFloat(fee.amount.toString()).toFixed(2)}</td>
                            <td className="px-6 py-4 text-gray-300">{fee.semester}</td>
                            <td className="px-6 py-4 text-gray-300">{new Date(fee.due_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(fee.status)}`}>
                                {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(fee.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <p className="text-gray-400 mb-2 flex items-center gap-2">
                <Filter size={16} /> Total Fees
              </p>
              <p className="text-3xl font-bold text-white">{fees.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <p className="text-gray-400 mb-2 flex items-center gap-2">
                <TrendingUp size={16} /> Collection Rate
              </p>
              <p className="text-3xl font-bold text-white">{Math.round((paidAmount / totalAmount) * 100 || 0)}%</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FeesManagementPage;
