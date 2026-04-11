import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle, Clock, CreditCard, Download, Loader } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';
import { useNavigate } from 'react-router-dom';

interface StudentFee {
  id: number;
  fee_name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  transaction_id?: string;
  semester: string;
  academic_year: string;
}

interface FeeStats {
  total_due: number;
  total_paid: number;
  total_overdue: number;
  pending_count: number;
  paid_count: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const StudentFeesPortalProfessional: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    fetchStudentFees();
  }, [user?.id]);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(`/student/get_my_fees.php?student_id=${user.id}`) as any;
      
      const feesData = Array.isArray(response?.data?.fees) ? response.data.fees : [];
      const statsData = response?.data?.stats || null;

      setFees(feesData);
      setStats(statsData);
      showSuccess('Fees loaded');
    } catch (error) {
      console.error('Failed to fetch fees:', error);
      showError('Failed to load fees');
      // Fallback data
      setFees([
        { 
          id: 1, 
          fee_name: 'Tuition Fee', 
          amount: 5000, 
          due_date: '2024-09-15',
          status: 'pending',
          semester: 'Fall',
          academic_year: '2024'
        },
        { 
          id: 2, 
          fee_name: 'Library Fee', 
          amount: 500, 
          due_date: '2024-09-15',
          status: 'paid',
          payment_date: '2024-09-10',
          transaction_id: 'TXN001',
          semester: 'Fall',
          academic_year: '2024'
        },
      ]);
      setStats({
        total_due: 5500,
        total_paid: 500,
        total_overdue: 5000,
        pending_count: 1,
        paid_count: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = fees.filter(f => {
    return filterStatus === 'all' || f.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'overdue':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={20} />;
      case 'overdue':
        return <AlertCircle className="text-red-400" size={20} />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-3 flex items-center gap-3">
              <DollarSign size={50} className="text-cyan-400" />
              My Fees
            </h1>
            <p className="text-gray-400 text-lg">View and manage your academic fees</p>
          </motion.div>

          {/* Stats Grid */}
          {stats && (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-4"
              >
                <p className="text-gray-400 text-sm mb-2">Total Due</p>
                <p className="text-3xl font-bold text-blue-300">৳{stats.total_due.toLocaleString()}</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-4"
              >
                <p className="text-gray-400 text-sm mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-green-300">৳{stats.total_paid.toLocaleString()}</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-4"
              >
                <p className="text-gray-400 text-sm mb-2">Overdue</p>
                <p className="text-3xl font-bold text-red-300">৳{stats.total_overdue.toLocaleString()}</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-4"
              >
                <p className="text-gray-400 text-sm mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-300">{stats.pending_count}</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-4"
              >
                <p className="text-gray-400 text-sm mb-2">Paid</p>
                <p className="text-3xl font-bold text-purple-300">{stats.paid_count}</p>
              </motion.div>
            </motion.div>
          )}

          {/* Filter */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'paid', 'overdue'].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Fees List */}
          {loading ? (
            <motion.div variants={containerVariants} className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-20" />
              ))}
            </motion.div>
          ) : filteredFees.length === 0 ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No fees found</h3>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-4">
              {filteredFees.map((fee, idx) => (
                <motion.div
                  key={fee.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(fee.status)}
                        <h3 className="text-xl font-bold text-white">{fee.fee_name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{fee.academic_year} - {fee.semester} Semester</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Amount</p>
                          <p className="text-lg font-bold text-cyan-300">৳{fee.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Due Date</p>
                          <p className="text-white font-semibold">{new Date(fee.due_date).toLocaleDateString()}</p>
                          {isOverdue(fee.due_date) && fee.status !== 'paid' && (
                            <p className="text-red-400 text-xs mt-1 font-semibold">⚠️ Overdue</p>
                          )}
                        </div>
                        {fee.status === 'paid' && fee.payment_date && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Paid On</p>
                            <p className="text-green-400 font-semibold">{new Date(fee.payment_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {fee.transaction_id && (
                        <p className="text-xs text-gray-500 mt-3">Txn ID: {fee.transaction_id}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(fee.status)}`}>
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </span>

                      {fee.status === 'pending' || fee.status === 'overdue' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/student/pay-fee/${fee.id}`, { state: { fee } })}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                        >
                          <CreditCard size={16} />
                          Pay Now
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-white/10 border border-white/20 text-gray-300 rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                          <Download size={16} />
                          Receipt
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Important Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-blue-500/20 border border-blue-500/50 rounded-2xl p-6"
          >
            <p className="text-blue-200 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-1" />
              <span>
                Please pay all pending fees before the due date to avoid additional penalties or registration holds. 
                For financial assistance or payment difficulties, contact the Finance Office.
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default StudentFeesPortalProfessional;
