import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Edit, Trash2, AlertCircle, CheckCircle, Search, TrendingUp, Clock, Bell } from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';

interface Fee {
  id: number;
  student_id: number;
  description?: string;
  amount: number;
  due_date: string;
  status: string;
}

interface PaymentCheckResult {
  success: boolean;
  pending_fees_found: number;
  student_notifications_created: number;
  admin_notifications_created: number;
  message: string;
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
  const [checkingPayments, setCheckingPayments] = useState(false);

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

  const handleCheckPendingPayments = async () => {
    try {
      setCheckingPayments(true);
      setError(null);
      
      console.log('Calling payment check endpoint...');
      console.log('URL:', `${API_BASE_URL}/admin/check_pending_payments.php`);
      
      const response = await fetch(`${API_BASE_URL}/admin/check_pending_payments.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json() as PaymentCheckResult;
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (data.success) {
        setSuccess(`✅ Payment check completed! | Pending Fees: ${data.pending_fees_found} | Student Notifications: ${data.student_notifications_created} | Admin Notifications: ${data.admin_notifications_created}`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(`Payment check encountered an issue: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Payment check error:', err);
      setError(`Network error: ${err.message || 'Failed to check payments'}`);
    } finally {
      setCheckingPayments(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 mb-2">
            💰 Fees Management
          </h1>
          <p className="text-purple-300 font-semibold text-lg">Track, manage, and collect student fees efficiently</p>
        </motion.div>

        {/* Alert Messages - Enhanced */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 text-green-200 rounded-xl flex items-center gap-3"
          >
            <CheckCircle size={24} className="flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-900/40 to-rose-900/40 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle size={24} className="flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </motion.div>
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

        {/* Enhanced Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-purple-400" size={20} />
            <input
              type="text"
              placeholder="Search by Fee ID or Student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/60 border border-purple-500/30 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/60 border border-purple-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'Add New Fee'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckPendingPayments}
            disabled={checkingPayments}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
          >
            <Bell size={20} />
            {checkingPayments ? 'Checking...' : 'Check Pending Payments'}
          </motion.button>
        </motion.div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-slate-800/90 via-purple-900/40 to-slate-900/90 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <DollarSign className="text-emerald-400" size={28} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Create New Fee</span>
            </h3>
            <p className="text-purple-300 mb-6 text-sm">⏰ Set a payment deadline - students must pay by this date or receive overdue notifications</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-purple-300 font-semibold mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Semester Fee, Library Fee, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all placeholder:text-gray-500"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-purple-300 font-semibold mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all placeholder:text-gray-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-purple-300 font-semibold mb-2">🚨 Payment Deadline</label>
                  <p className="text-purple-400 text-xs mb-2">Students must pay by this date</p>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-purple-300 font-semibold mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-700/50 border border-purple-500/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50"
              >
                Create Fee
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Fees Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-purple-500/30 border-t-emerald-400 rounded-full"
              />
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-purple-500/30 rounded-2xl">
              <Clock className="mx-auto mb-4 text-purple-400" size={48} />
              <p className="text-purple-300 font-semibold text-lg">No fees found</p>
              <p className="text-purple-400 text-sm mt-2">Create your first fee to get started</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/20 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-b border-purple-500/30">
                      <th className="px-6 py-4 text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Student ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/20">
                    {filteredFees.map((fee, idx) => (
                      <motion.tr
                        key={fee.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', x: 4 }}
                        className="border-b border-purple-500/10 hover:border-purple-500/30 transition-all group"
                      >
                        <td className="px-6 py-4 text-gray-200 font-medium">#{fee.student_id}</td>
                        <td className="px-6 py-4 text-gray-200">{fee.description || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-bold">
                            ₹{parseFloat(fee.amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-200">{new Date(fee.due_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4">
                          {fee.status === 'paid' && (
                            <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/50 inline-flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                              Paid
                            </span>
                          )}
                          {fee.status === 'pending' && (
                            <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-500/50 inline-flex items-center gap-2">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-yellow-400 rounded-full"
                              />
                              Pending
                            </span>
                          )}
                          {fee.status === 'overdue' && (
                            <span className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 rounded-full text-xs font-bold border border-red-500/50 inline-flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full" />
                              Overdue
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(fee.id)}
                            className="text-red-400 hover:text-red-300 transition-colors inline-flex p-2 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 size={20} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FeesManagementPage;
