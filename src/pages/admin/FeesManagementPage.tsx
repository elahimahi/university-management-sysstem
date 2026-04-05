import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Edit, Trash2, AlertCircle, CheckCircle, Search, TrendingUp, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';

interface Fee {
  id: number;
  student_id: number;
  description?: string;
  amount: number;
  due_date: string;
  status: string;
}

const FeesManagementPage: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    status: 'pending',
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
      const response = await fetch(`${API_BASE_URL}/admin/fees?limit=100`);
      const data = await response.json();

      if (response.ok) {
        setFees(data.fees || []);
        setError(null);
      } else {
        setError(data.error || data.message || 'Failed to fetch fees');
      }
    } catch (err) {
      setError('Network error while fetching fees');
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

    const amount = formData.amount ? parseFloat(formData.amount as string) : null;

    if (!amount || !formData.description || !formData.due_date || !formData.status) {
      setError('Description, amount, date, and status are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/create-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: null,
          description: formData.description,
          amount: amount,
          due_date: formData.due_date,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Fee created successfully!');
        setShowForm(false);
        setFormData({
          description: '',
          amount: '',
          due_date: '',
          status: 'pending',
        });
        fetchFees();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to create fee');
      }
    } catch (err) {
      setError('Network error while creating fee');
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
        setSuccess('❌ Fee deleted successfully');
        setFees(fees.filter(f => f.id !== feeId));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to delete fee');
      }
    } catch (err) {
      setError('Network error while deleting fee');
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = fees.reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0);
  const paidAmount = fees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💰 Fees Management</h1>
          <p className="text-purple-200">Manage student fees and payment tracking</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Amount Card */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-lg border border-emerald-400/30 group cursor-default shadow-2xl"
          >
            {/* Animated background orbs */}
            <motion.div 
              animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-sm border border-emerald-400/40"
                >
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-bold text-emerald-300/70 uppercase tracking-wider bg-emerald-500/20 px-2 py-1 rounded-full"
                >
                  Total
                </motion.div>
              </div>
              
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/60 mb-3">Total Amount</p>
              
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-baseline gap-2"
              >
                <p className="text-4xl lg:text-5xl font-black text-emerald-200 drop-shadow-lg">
                  ${totalAmount.toFixed(2)}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-4 h-1 bg-emerald-500/20 rounded-full overflow-hidden origin-left"
              >
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 w-full" />
              </motion.div>
            </div>
          </motion.div>

          {/* Paid Amount Card */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-lg border border-blue-400/30 group cursor-default shadow-2xl"
          >
            {/* Animated background orbs */}
            <motion.div 
              animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/40"
                >
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="text-xs font-bold text-blue-300/70 uppercase tracking-wider bg-blue-500/20 px-2 py-1 rounded-full"
                >
                  Received
                </motion.div>
              </div>
              
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/60 mb-3">Paid Amount</p>
              
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-baseline gap-2"
              >
                <p className="text-4xl lg:text-5xl font-black text-blue-200 drop-shadow-lg">
                  ${paidAmount.toFixed(2)}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-4 h-1 bg-blue-500/20 rounded-full overflow-hidden origin-left"
              >
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 w-full" />
              </motion.div>
            </div>
          </motion.div>

          {/* Pending Amount Card */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-lg border border-pink-400/30 group cursor-default shadow-2xl"
          >
            {/* Animated background orbs */}
            <motion.div 
              animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="p-3 bg-pink-500/20 rounded-xl backdrop-blur-sm border border-pink-400/40"
                >
                  <Clock className="w-6 h-6 text-pink-400" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="text-xs font-bold text-pink-300/70 uppercase tracking-wider bg-pink-500/20 px-2 py-1 rounded-full"
                >
                  Pending
                </motion.div>
              </div>
              
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300/60 mb-3">Pending Amount</p>
              
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-baseline gap-2"
              >
                <p className="text-4xl lg:text-5xl font-black text-pink-200 drop-shadow-lg">
                  ${(totalAmount - paidAmount).toFixed(2)}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-4 h-1 bg-pink-500/20 rounded-full overflow-hidden origin-left"
              >
                <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 w-full" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Bar */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'Add Fee'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-slate-300 mb-4">Fill Up The Form  and Click Create Fee </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                  step="0.01"
                />
                <input
                  type="date"
                  placeholder="Due Date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                />

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                Create Fee
              </button>
            </form>
          </div>
        )}

        {/* Fees Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-300">Loading fees...</div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Student ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Amount</th>

                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No fees found
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-200">{fee.student_id}</td>
                        <td className="px-6 py-4 text-gray-200">{fee.description || '—'}</td>
                        <td className="px-6 py-4 text-gray-200">${parseFloat(fee.amount.toString()).toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-200">{new Date(fee.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status || '')}`}>
                            {fee.status ? fee.status.charAt(0).toUpperCase() + fee.status.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(fee.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeesManagementPage;
