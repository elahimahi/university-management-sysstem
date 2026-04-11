import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, User, Shield, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';

interface PendingUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  approval_status: string;
  created_at: string;
}

interface PendingUsersResponse {
  status: string;
  users: PendingUser[];
}

interface ApprovalResponse {
  status: string;
  message: string;
  user: PendingUser;
}

const AdminVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    // Fetch when component mounts or when currentUser loads
    if (currentUser?.id) {
      fetchPendingUsers();
    }
  }, [currentUser?.id]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<PendingUsersResponse>('/admin/get-pending-registrations');
      if (data && data.users) {
        setPendingUsers(data.users);
        setError(null);
      } else {
        setError('Failed to fetch pending registrations');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while fetching pending users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    // Verify admin is authenticated
    if (!currentUser?.id) {
      setError('Admin authentication required. Please log in again.');
      return;
    }

    try {
      const data = await apiService.post<ApprovalResponse>('/admin/approve-user', {
        user_id: userId,
        admin_id: currentUser.id,
      });

      if (data && data.user) {
        setSuccessMessage(`✅ User ${data.user.email} approved successfully`);
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data?.message || 'Failed to approve user');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while approving user');
      console.error(err);
    }
  };

  const handleReject = async (userId: number) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    // Verify admin is authenticated
    if (!currentUser?.id) {
      setError('Admin authentication required. Please log in again.');
      return;
    }

    try {
      const data = await apiService.post<ApprovalResponse>('/admin/reject-user', {
        user_id: userId,
        admin_id: currentUser.id,
        reason: rejectionReason,
      });

      if (data && data.user) {
        setSuccessMessage(`❌ User ${data.user.email} rejected`);
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        setRejectingUserId(null);
        setRejectionReason('');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data?.message || 'Failed to reject user');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while rejecting user');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
        >
          <Clock className="text-white" size={32} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden"
    >
      {/* Animated background blobs */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-3xl opacity-20 -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full blur-3xl opacity-20 -bottom-20 right-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute w-96 h-96 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-full blur-3xl opacity-20 top-1/2 -right-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-5xl"
                  >
                    👑
                  </motion.div>
                  User Verification
                </motion.h1>
                <p className="text-cyan-400 font-semibold text-lg">Review and approve pending registrations</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-shield-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30"
              >
                <Shield className="text-white" size={32} />
              </motion.div>
            </div>
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center gap-3 shadow-lg shadow-green-500/30 border border-green-400/30"
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <CheckCircle className="text-white" size={24} />
                </motion.div>
                <span className="text-white font-semibold">{successMessage}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center gap-3 shadow-lg shadow-red-500/30 border border-red-400/30"
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <AlertCircle className="text-white" size={24} />
                </motion.div>
                <span className="text-white font-semibold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm uppercase tracking-wider font-bold mb-1">Pending Approvals</p>
                  <motion.p
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl font-black text-cyan-400"
                  >
                    {pendingUsers.length}
                  </motion.p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl"
                >
                  <Clock className="text-cyan-400" size={28} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl border border-emerald-400/30 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm uppercase tracking-wider font-bold mb-1">Approved</p>
                  <p className="text-4xl font-black text-emerald-400">
                    {Math.max(0, pendingUsers.length > 0 ? pendingUsers.length : 0)}
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  className="p-3 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-xl"
                >
                  <CheckCircle className="text-emerald-400" size={28} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-400/30 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-sm uppercase tracking-wider font-bold mb-1">Users</p>
                  <p className="text-4xl font-black text-amber-400">
                    {pendingUsers.length}
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  className="p-3 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl"
                >
                  <Users className="text-amber-400" size={28} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm uppercase tracking-wider font-bold mb-1">Status</p>
                  <p className="text-3xl font-black text-purple-400">
                    {pendingUsers.length === 0 ? '✓ All Clear' : '⏳ Pending'}
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl"
                >
                  <TrendingUp className="text-purple-400" size={28} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Pending Users List */}
          {pendingUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-6 inline-block"
              >
                <CheckCircle className="w-24 h-24 text-emerald-400 mx-auto" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3">All Clear! ✨</h2>
              <p className="text-xl text-cyan-300 font-semibold mb-2">No pending registrations to verify</p>
              <p className="text-gray-400 text-lg">All user registrations have been processed</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {pendingUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"
                        >
                          <User className="text-white" size={24} />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-gray-400 font-semibold text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            user.role === 'faculty'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                          }`}
                        >
                          {user.role}
                        </motion.span>
                        <span className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-700/50 text-gray-300 border border-slate-600/50">
                          Applied: {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(user.id)}
                        disabled={!currentUser?.id}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-emerald-500/30 transition-all"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRejectingUserId(user.id)}
                        disabled={!currentUser?.id}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-red-500/30 transition-all"
                      >
                        <XCircle size={18} />
                        Reject
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingUserId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-96 shadow-2xl border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-lg">
                  <AlertCircle className="text-red-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">Reject User?</h3>
              </div>

              <p className="text-gray-400 text-sm mb-4 font-semibold">
                Please provide a reason for rejecting this registration. The user will receive this feedback.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 mb-6 font-semibold text-sm resize-none"
                rows={4}
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReject(rejectingUserId)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl shadow-red-500/30 transition-all"
                >
                  Confirm Rejection
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRejectingUserId(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminVerificationPage;
