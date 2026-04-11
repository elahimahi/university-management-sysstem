import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../constants/app.constants';
import { CreditCard, AlertCircle, Clock, TrendingDown, Smartphone, Zap } from 'lucide-react';
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
}

interface FeeStats {
  total_fees_count: number;
  total_amount: number;
  total_paid: number;
  total_pending: number;
  urgent_fees: number;
  overdue_fees: number;
  message: string;
}

interface PaymentFormState {
  method: 'bkash' | 'nagad' | 'rocket' | 'card' | '';
  amount: string;
  phone: string;
  account_number: string;
}

const StudentFeesPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
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
    account_number: '',
  });
  const [pendingOpenRequested, setPendingOpenRequested] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('open') === 'pending') {
      setPendingOpenRequested(true);
    }

    fetchStudentFees();

    const interval = setInterval(() => {
      fetchStudentFees();
    }, 15000);

    return () => clearInterval(interval);
  }, [user?.id, location.search]);

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
        };
      });

      const rawStats = response.data.summary || response.data.statistics || {};
      const calculatedTotalPending = normalizedFees.reduce(
        (sum, fee) => sum + Math.max(0, Number(fee.remaining_amount)),
        0
      );
      const calculatedTotalPaid = normalizedFees.reduce(
        (sum, fee) => sum + Math.max(0, Number(fee.paid_amount)),
        0
      );
      const calculatedTotalAmount = normalizedFees.reduce(
        (sum, fee) => sum + Number(fee.amount),
        0
      );

      const normalizedStats: FeeStats = {
        total_fees_count: normalizedFees.length,
        total_amount: calculatedTotalAmount,
        total_paid: calculatedTotalPaid,
        total_pending: calculatedTotalPending,
        urgent_fees: Number(rawStats.urgent_fees ?? normalizedFees.filter((fee) => fee.payment_status_display === 'Urgent - Less than 24 hours').length),
        overdue_fees: Number(rawStats.overdue_fees ?? rawStats.overdue_count ?? normalizedFees.filter((fee) => fee.payment_status_display === 'Overdue - Pay Now!').length),
        message: rawStats.message || 'Your fees are listed below',
      };

      setFees(normalizedFees);
      setStats(normalizedStats);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.response?.data?.error || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pendingOpenRequested || fees.length === 0) return;

    const pendingFee = fees.find((fee) => fee.remaining_amount > 0);
    if (pendingFee) {
      setSelectedFee(pendingFee);
      setShowPaymentModal(true);
      setPaymentForm({
        method: '',
        amount: pendingFee.remaining_amount.toString(),
        phone: user?.phone || '',        account_number: '',      });
    }

    setPendingOpenRequested(false);
  }, [pendingOpenRequested, fees, user?.phone]);

  const getPendingFee = () => {
    return (
      fees.find((fee) => Number(fee.remaining_amount) > 0) ||
      fees.find((fee) => fee.payment_status_display !== 'Paid' && fee.status !== 'paid') ||
      null
    );
  };

  const pendingAmount = fees.reduce((total, fee) => total + Math.max(0, Number(fee.remaining_amount)), 0);

  const openPendingPayment = () => {
    const pendingFee = getPendingFee();
    if (!pendingFee) {
      toast.error('No pending fee found to pay.');
      return;
    }

    setSelectedFee(pendingFee);
    setShowPaymentModal(true);
    setPaymentForm({
      method: '',
      amount: (Number(pendingFee.remaining_amount) > 0 ? pendingFee.remaining_amount : pendingFee.amount).toString(),
      phone: user?.phone || '',
      account_number: '',
    });
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

    // Validate based on payment method
    if (paymentForm.method === 'card') {
      const accountNumber = paymentForm.account_number.replace(/\D/g, '');
      if (!accountNumber) {
        toast.error('Please enter your card/account number');
        setProcessing(false);
        return;
      }
      if (!/^\d{16}$/.test(accountNumber)) {
        toast.error('Please enter a valid 16-digit card/account number');
        setProcessing(false);
        return;
      }
    } else {
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
    }

    setProcessing(true);
    let paymentData: any = null;
    try {
      const normalizedPhone = paymentForm.phone.replace(/\D/g, '');
      const normalizedAccount = paymentForm.account_number.replace(/\D/g, '');
      paymentData = {
        fee_id: selectedFee.id,
        student_id: user?.id,
        amount_paid: amount,
        payment_method: paymentForm.method,
        phone: paymentForm.method === 'card' ? '0000000000' : normalizedPhone,
        account_number: paymentForm.method === 'card' ? normalizedAccount : '',
      };

      const token = getAccessToken();
      console.log('Sending payment data:', JSON.stringify(paymentData, null, 2));
      const response = await axios.post(`${API_BASE_URL}/payment/process`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Payment response:', response.data);
      console.log('Transaction ID:', response.data.transaction_id);
      console.log('Payment URL:', response.data.payment_url);

      if (response.data.success) {
        // Always show transaction ID if available
        if (response.data.transaction_id) {
          console.log('Setting transaction modal with ID:', response.data.transaction_id);
          setShowPaymentModal(false);
          setTransactionId(response.data.transaction_id);
          setPaymentUrl(response.data.payment_url || null);
          setPaymentAmount(amount);
          setPaymentMethod(paymentForm.method);
          console.log('PaymentUrl state set to:', response.data.payment_url);
          sessionStorage.setItem('pendingTransactionId', response.data.transaction_id);
          setShowTransactionModal(true);
          // Show toast backup in case modal doesn't appear
          toast.success(`Transaction ID: ${response.data.transaction_id}`);
        } else if (response.data.payment_url) {
          // Fallback: if no transaction ID but has payment URL, redirect
          toast.success('Redirecting to payment gateway...');
          window.location.href = response.data.payment_url;
        } else {
          // Payment completed immediately
          toast.success('Payment processed successfully!');
          setShowPaymentModal(false);
          setPaymentForm({
            method: '',
            amount: '',
            phone: user?.phone || '',
            account_number: '',
          });
          setSelectedFee(null);
          fetchStudentFees();
        }
      } else {
        toast.error(response.data.error || 'Payment initiation failed');
        console.error('Payment error response:', response.data);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      console.log('Full error response:', err.response?.data);
      console.log('Error status:', err.response?.status);
      console.log('Error headers:', err.response?.headers);
      console.log('Request body was:', JSON.stringify(paymentData, null, 2));
      toast.error(err.response?.data?.error || err.message || 'Payment failed');
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
            <div className="text-right">
              {lastUpdated ? (
                <p className="text-xs text-slate-400">Updated {Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago</p>
              ) : (
                <p className="text-xs text-slate-400">Fetching latest fee status...</p>
              )}
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
                <p className="mt-3 text-3xl font-bold text-amber-300">৳{pendingAmount.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {pendingAmount > 0 && getPendingFee() && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5 text-slate-200">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Ready to pay</p>
              <p className="mt-2 text-lg font-semibold text-white">A pending fee of ৳{getPendingFee()?.remaining_amount?.toLocaleString() || pendingAmount.toLocaleString()} can be paid now.</p>
            </div>
          </div>
        )}

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

        {stats && stats.overdue_fees > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border-2 border-red-400/50 bg-red-500/15 p-4 text-red-200"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <p className="font-bold text-lg">⏰ Payment is Pending</p>
                <p className="text-sm mt-1">You have {stats.overdue_fees} overdue fee(s). Please pay immediately to avoid penalties.</p>
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
              <p className="mt-4 text-3xl font-bold text-amber-300">৳{pendingAmount.toLocaleString() || 0}</p>
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
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          {fees.filter(fee => fee.remaining_amount > 0).map((fee) => (
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
              {fee.hours_remaining !== null && fee.hours_remaining < 0 && (
                <div className="mt-5 rounded-3xl bg-red-500/20 border border-red-500/50 p-4 text-sm">
                  <p className="text-red-300 font-bold">🚨 PAYMENT IS PENDING - Overdue by <span>{Math.abs(Math.floor(fee.hours_remaining / 24))} day(s)</span></p>
                </div>
              )}

              {fee.hours_remaining !== null && fee.hours_remaining >= 0 && (
                <div className="mt-5 rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                  <p>Time left: <span className="font-semibold text-white">{getTimeRemainingText(fee.hours_remaining)}</span></p>
                </div>
              )}

              {fee.remaining_amount > 0 && fee.payment_status_display !== 'Paid' && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFee(fee);
                      setShowPaymentModal(true);
                      setPaymentForm({ method: '', amount: fee.remaining_amount.toString(), phone: user?.phone || '', account_number: '' });
                    }}
                    className={`w-full rounded-2xl px-5 py-3 text-white font-semibold transition-colors ${
                      fee.hours_remaining !== null && fee.hours_remaining < 0 
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Pay Now with bKash / Nagad / Rocket / Card
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Enhanced Payment Modal */}
      {showPaymentModal && selectedFee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-slate-700/60"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Secure Payment</h2>
                  <p className="text-sm text-slate-400">Fast and safe transaction</p>
                </div>
              </div>

              {/* Fee Info */}
              <div className="rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-700/40 p-4 mt-4">
                <p className="text-sm text-slate-400 mb-1">{selectedFee.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-cyan-300">৳{selectedFee.remaining_amount?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">remaining amount to pay</p>
                  </div>
                  {selectedFee.hours_remaining !== null && (
                    <p className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      selectedFee.hours_remaining < 0 ? 'bg-red-500/30 text-red-200' :
                      selectedFee.hours_remaining < 24 ? 'bg-orange-500/30 text-orange-200' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {getTimeRemainingText(selectedFee.hours_remaining)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { method: 'bkash', name: 'bKash', icon: '📱', color: 'from-pink-600/20 to-red-600/20', border: 'border-pink-500/40' },
                    { method: 'nagad', name: 'Nagad', icon: '🏦', color: 'from-red-600/20 to-orange-600/20', border: 'border-red-500/40' },
                    { method: 'rocket', name: 'Rocket', icon: '🚀', color: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/40' },
                    { method: 'card', name: 'Card', icon: '💳', color: 'from-purple-600/20 to-pink-600/20', border: 'border-purple-500/40' },
                  ].map(({ method, name, icon, color, border }) => (
                    <motion.button
                      key={method}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentForm({ ...paymentForm, method: method as any })}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        paymentForm.method === method
                          ? `border-cyan-400 bg-gradient-to-br ${color} shadow-lg shadow-cyan-500/20`
                          : `border-slate-700/50 bg-slate-800/40 hover:border-slate-600`
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{icon}</div>
                        <p className="text-sm font-semibold text-white">{name}</p>
                        {paymentForm.method === method && (
                          <div className="mt-2">
                            <div className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mobile Number or Account Number */}
              {paymentForm.method === 'card' ? (
                <div>
                  <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">💳 Card/Account Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={paymentForm.account_number}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 16) value = value.slice(0, 16);
                        const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                        setPaymentForm({ ...paymentForm, account_number: value });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 text-slate-100 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder:text-slate-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Enter your 16-digit card or bank account number</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">📱 Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={paymentForm.phone}
                      onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 text-slate-100 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder:text-slate-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Your mobile number for the selected payment method</p>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">💰 Amount to Pay</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">৳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={selectedFee.remaining_amount}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/80 text-slate-100 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder:text-slate-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Max: ৳{selectedFee.remaining_amount.toLocaleString()}</p>
              </div>

              {/* Payment Method Info */}
              {paymentForm.method && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 border border-cyan-400/20 p-4"
                >
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-cyan-300 mb-1">📋 How it works:</p>
                      <ul className="text-cyan-200/80 space-y-1 text-xs">
                        {paymentForm.method === 'card' ? (
                          <>
                            <li>✓ Enter your 16-digit card/account number</li>
                            <li>✓ Enter payment amount and click "Pay"</li>
                            <li>✓ You'll be redirected to official CARD page</li>
                            <li>✓ Enter your PIN/OTP <strong>on the CARD page</strong> to complete</li>
                          </>
                        ) : (
                          <>
                            <li>✓ Enter your {paymentForm.method.toUpperCase()} mobile number here</li>
                            <li>✓ Enter payment amount and click "Pay"</li>
                            <li>✓ You'll be redirected to official {paymentForm.method.toUpperCase()} page</li>
                            <li>✓ Enter your PIN/OTP <strong>on the {paymentForm.method.toUpperCase()} page</strong> to complete</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Notice */}
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/20 p-4">
                <div className="flex gap-3">
                  <span className="text-xl">🔒</span>
                  <div className="text-sm text-emerald-300">
                    <p className="font-semibold mb-1">Secure & Verified</p>
                    <p className="text-emerald-200/80 text-xs">All transactions are processed through official {paymentForm.method.toUpperCase() || 'payment'} gateways with 256-bit SSL encryption.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedFee(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 font-semibold transition-all duration-300 border border-slate-600/60"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={
                    processing ||
                    !paymentForm.method ||
                    !paymentForm.amount ||
                    (paymentForm.method === 'card'
                      ? !paymentForm.account_number
                      : !paymentForm.phone)
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-600 text-white font-bold transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay ৳${paymentForm.amount || '0'}`
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction ID Modal */}
      {showTransactionModal && transactionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-600">Transaction Created!</h2>
            
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Transaction ID:</p>
              <p className="text-xl font-mono font-bold text-green-700 dark:text-green-400 break-all">{transactionId}</p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📝 Save this Transaction ID for your records. You will need it to track your payment.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && paymentUrl && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs break-all">
                <p className="text-gray-600 dark:text-gray-300">Payment URL: {paymentUrl}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(transactionId);
                  toast.success('Transaction ID copied!');
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Copy ID
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Payment URL:', paymentUrl);
                  console.log('Transaction ID:', transactionId);
                  console.log('Payment Amount:', paymentAmount);
                  console.log('Payment Method:', paymentMethod);
                  
                  if (paymentUrl) {
                    console.log('Redirecting to backend returned URL:', paymentUrl);
                    window.location.href = paymentUrl;
                  } else {
                    // Fallback: construct mock URL using transaction ID and form values
                    const amount = paymentAmount || 6000;
                    const method = paymentMethod || 'bkash';
                    const mockUrl = `http://localhost/SD_Project/university-management-sysstem/mock_payment.html?tran_id=${transactionId}&amount=${amount}&method=${method}`;
                    console.log('Using fallback URL:', mockUrl);
                    window.location.href = mockUrl;
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                disabled={!transactionId}

              >
                Proceed to Payment →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentFeesPage;
