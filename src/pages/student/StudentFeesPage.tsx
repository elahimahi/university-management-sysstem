import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../constants/app.constants';
import { CreditCard, AlertCircle, Clock, TrendingDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Fee {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  payment_deadline: string | null;
  status: string;
  paid_amount: number;
  remaining_amount: number;
  hours_remaining: number | null;
  payment_status_display: string;
  penalty_applied: boolean;
  penalty_amount: number;
  penalty_percentage: number | null;
  penalty_type: string | null;
  apply_after_days: number | null;
}

interface FeeStats {
  total_fees_count: number;
  total_amount: number;
  total_paid: number;
  total_pending: number;
  total_penalty: number;
  urgent_fees: number;
  overdue_fees: number;
  message: string;
}

interface PaymentFormState {
  method: 'bkash' | 'nagad' | 'rocket' | 'card' | '';
  amount: string;
  phone: string;
}

const StudentFeesPage: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    method: '',
    amount: '',
    phone: user?.phone || '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStudentFees();
  }, [user?.id]);

  const fetchStudentFees = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_BASE_URL}/student/fees`,
        { student_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rawFees = response.data.fees || [];
      const normalizedFees: Fee[] = rawFees.map((fee: any) => {
        const dueDateValue = fee.due_date ? new Date(fee.due_date) : null;
        const now = new Date();
        const hoursRemaining = dueDateValue ? Math.round((dueDateValue.getTime() - now.getTime()) / (1000 * 60 * 60)) : null;
        const paidAmount = fee.paid_amount ?? fee.total_paid ?? 0;
        const remainingAmount = fee.remaining_amount != null ? fee.remaining_amount : fee.amount - paidAmount;

        let paymentStatusDisplay = 'Pending';
        if (fee.status === 'paid' || remainingAmount <= 0) {
          paymentStatusDisplay = 'Paid';
        } else if (hoursRemaining !== null && hoursRemaining < 0) {
          paymentStatusDisplay = 'Overdue - Pay Now!';
        } else if (hoursRemaining !== null && hoursRemaining < 24) {
          paymentStatusDisplay = 'Urgent - Less than 24 hours';
        }

        return {
          ...fee,
          payment_deadline: fee.payment_deadline || fee.due_date || null,
          hours_remaining: hoursRemaining,
          payment_status_display: fee.payment_status_display || paymentStatusDisplay,
          paid_amount: Number(paidAmount),
          remaining_amount: Number(remainingAmount),
          penalty_applied: fee.penalty_applied ?? false,
          penalty_amount: fee.penalty_amount ?? 0,
          penalty_percentage: fee.penalty_percentage ?? null,
          penalty_type: fee.penalty_type ?? null,
          apply_after_days: fee.apply_after_days ?? null,
        };
      });

      const rawStats = response.data.summary || response.data.statistics || {};
      const normalizedStats: FeeStats = {
        total_fees_count: normalizedFees.length,
        total_amount: Number(rawStats.total_amount ?? rawStats.total_due ?? 0),
        total_paid: Number(rawStats.total_paid ?? 0),
        total_pending: Number(rawStats.total_pending ?? 0),
        total_penalty: Number(rawStats.total_penalty ?? 0),
        urgent_fees: Number(rawStats.urgent_fees ?? normalizedFees.filter((fee) => fee.payment_status_display === 'Urgent - Less than 24 hours').length),
        overdue_fees: Number(rawStats.overdue_fees ?? rawStats.overdue_count ?? normalizedFees.filter((fee) => fee.payment_status_display === 'Overdue - Pay Now!').length),
        message: rawStats.message || 'Your fees are listed below',
      };

      setFees(normalizedFees);
      setStats(normalizedStats);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.response?.data?.error || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFee || !paymentForm.method || !paymentForm.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0 || amount > selectedFee.remaining_amount) {
      toast.error(`Amount must be between 1 and ${selectedFee.remaining_amount}`);
      return;
    }

    if (!paymentForm.phone) {
      toast.error('Please enter your mobile number');
      setProcessing(false);
      return;
    }

    const normalizedPhone = paymentForm.phone.replace(/\D/g, '');
    if (!/^(01\d{9})$/.test(normalizedPhone)) {
      toast.error('Please enter a valid Bangladeshi mobile number');
      setProcessing(false);
      return;
    }

    setProcessing(true);
    try {
      const paymentData = {
        fee_id: selectedFee.id,
        student_id: user?.id,
        amount_paid: amount,
        payment_method: paymentForm.method,
        phone: normalizedPhone,
      };

      const token = getAccessToken();
      const response = await axios.post(`${API_BASE_URL}/payment/process`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        if (response.data.payment_url) {
          // Redirect to payment gateway
          toast.success('Redirecting to payment gateway...');
          window.location.href = response.data.payment_url;
        } else {
          // Payment completed immediately (for some methods)
          toast.success('Payment processed successfully!');
          setShowPaymentModal(false);
          setPaymentForm({
            method: '',
            amount: '',
            phone: user?.phone || '',
          });
          setSelectedFee(null);
          fetchStudentFees();
        }
      } else {
        toast.error(response.data.error || 'Payment initiation failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'Urgent - Less than 24 hours':
      case 'Overdue - Pay Now!':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      case 'Pending':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500 text-white';
      case 'Overdue - Pay Now!':
        return 'bg-red-600 text-white animate-pulse';
      case 'Urgent - Less than 24 hours':
        return 'bg-red-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline set';
    return new Date(deadline).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemainingText = (hoursRemaining: number | null) => {
    if (hoursRemaining === null) return '';
    if (hoursRemaining < 0) return 'Overdue!';
    if (hoursRemaining === 0) return 'Due now!';
    if (hoursRemaining < 24) return `${Math.ceil(hoursRemaining)} hours left`;
    const days = Math.floor(hoursRemaining / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8"
    >
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.55)] mb-10"
        >
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute left-8 top-16 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
                <CreditCard className="w-5 h-5" />
                Student Fees
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white">Manage payments with clarity</h1>
              <p className="mt-3 max-w-2xl text-slate-300">View your fee summary, deadlines, and payment status using polished cards and improved layout.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total Due</p>
                <p className="mt-3 text-3xl font-bold text-cyan-300">৳{stats?.total_amount?.toLocaleString() || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Paid</p>
                <p className="mt-3 text-3xl font-bold text-emerald-300">৳{stats?.total_paid?.toLocaleString() || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pending</p>
                <p className="mt-3 text-3xl font-bold text-amber-300">৳{stats?.total_pending?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-semibold">Oops!</p>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {stats && (
          <div className="grid gap-6 lg:grid-cols-5 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total Due</p>
              <p className="mt-4 text-3xl font-bold text-cyan-300">৳{stats.total_amount?.toLocaleString() || 0}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Paid</p>
              <p className="mt-4 text-3xl font-bold text-emerald-300">৳{stats.total_paid?.toLocaleString() || 0}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pending</p>
              <p className="mt-4 text-3xl font-bold text-amber-300">৳{stats.total_pending?.toLocaleString() || 0}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Urgent</p>
              <p className="mt-4 text-3xl font-bold text-red-300">{stats.urgent_fees}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Penalties</p>
              <p className="mt-4 text-3xl font-bold text-violet-300">৳{stats.total_penalty?.toLocaleString() || 0}</p>
            </motion.div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          {fees.map((fee) => (
            <motion.div
              key={fee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{fee.description}</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">৳{fee.amount.toLocaleString()}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(fee.payment_status_display)}`}>
                  {fee.payment_status_display}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Due</p>
                  <p className="mt-2 text-sm text-slate-200">{formatDeadline(fee.payment_deadline)}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Remaining</p>
                  <p className="mt-2 text-xl font-bold text-white">৳{fee.remaining_amount.toLocaleString()}</p>
                </div>
              </div>
              {fee.hours_remaining !== null && (
                <div className="mt-5 rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                  <p>Time left: <span className="font-semibold text-white">{getTimeRemainingText(fee.hours_remaining)}</span></p>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {fee.penalty_amount > 0 && (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-300">Penalty: ৳{fee.penalty_amount.toLocaleString()}</span>
                )}
                {fee.penalty_percentage && (
                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-300">Penalty {fee.penalty_percentage}%</span>
                )}
              </div>

              {fee.remaining_amount > 0 && fee.payment_status_display !== 'Paid' && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFee(fee);
                      setShowPaymentModal(true);
                      setPaymentForm({ method: '', amount: fee.remaining_amount.toString(), phone: user?.phone || '' });
                    }}
                    className="w-full rounded-2xl bg-blue-500 px-5 py-3 text-white font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Pay Now with bKash / Nagad / Rocket / Card
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Pay "{selectedFee.description}"</h2>

            {selectedFee.payment_deadline && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Payment Deadline
                </p>
                <p className="font-semibold">{formatDeadline(selectedFee.payment_deadline)}</p>
                <p className="text-sm mt-1 font-semibold text-orange-600">
                  {getTimeRemainingText(selectedFee.hours_remaining)}
                </p>
              </div>
            )}

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Amount</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">৳{selectedFee.remaining_amount?.toLocaleString()}</p>
              {selectedFee.penalty_applied && (
                <p className="text-sm text-red-600 mt-2">+ ৳{selectedFee.penalty_amount?.toLocaleString()} penalty</p>
              )}
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { method: 'bkash', logo: 'Bkash Logo.webp' },
                    { method: 'nagad', logo: 'Nagad Logo.png' },
                    { method: 'rocket', logo: 'Rocket Logo.png' },
                    { method: 'card', logo: 'Card.jpg' },
                  ].map(({ method, logo }) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, method: method as any })}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                        paymentForm.method === method
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <img
                        src={`/assets/${logo}`}
                        alt={method}
                        className={(method === 'bkash' || method === 'rocket') ? 'h-12 w-auto' : 'h-8 w-auto'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/80 p-4 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                After clicking Pay, you will be redirected to a secure gateway page to complete payment and enter your OTP/PIN/card details.
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={paymentForm.phone}
                  onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold mb-2">Amount to Pay</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={selectedFee.remaining_amount}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Secure Payment:</strong> You will be redirected to the official {paymentForm.method.toUpperCase()} payment gateway where you can safely enter your PIN and complete the transaction.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedFee(null);
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !paymentForm.method}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  {processing ? 'Processing...' : 'Pay'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentFeesPage;
