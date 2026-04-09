import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { CreditCard, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Fee {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  current_status: string;
  payment_count: number;
  total_paid: number;
  remaining_amount: number;
}

interface FeeStats {
  total_due: number;
  total_paid: number;
  total_pending: number;
  overdue_count: number;
}

interface PaymentFormState {
  method: 'bkash' | 'nagad' | 'rocket' | 'card' | '';
  amount: string;
  pin: string;
  cardNumber: string;
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
    pin: '',
    cardNumber: '',
  });
  const [processing, setProcessing] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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
      setFees(response.data.fees || []);
      setStats(response.data.statistics || null);
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

    if (['bkash', 'nagad', 'rocket'].includes(paymentForm.method) && !paymentForm.pin) {
      toast.error(`Please enter your ${paymentForm.method.toUpperCase()} PIN`);
      return;
    }

    if (paymentForm.method === 'card' && !paymentForm.cardNumber) {
      toast.error('Please enter card number');
      return;
    }

    setProcessing(true);
    try {
      const paymentData = {
        fee_id: selectedFee.id,
        student_id: user?.id,
        amount_paid: amount,
        payment_method: paymentForm.method,
        pin: paymentForm.pin || undefined,
        card_number: paymentForm.cardNumber || undefined,
      };

      const token = getAccessToken();
      const response = await axios.post(`${API_BASE_URL}/payment/process`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Show SMS confirmation status
      if (response.data.sms_notification?.success) {
        toast.success('Payment processed! SMS confirmation sent.');
      } else {
        toast.success('Payment processed successfully!');
        if (response.data.sms_notification?.message) {
          toast(`SMS: ${response.data.sms_notification.message}`);
        }
      }

      setShowPaymentModal(false);
      setPaymentForm({
        method: '',
        amount: '',
        pin: '',
        cardNumber: '',
      });
      setSelectedFee(null);
      fetchStudentFees();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      case 'overdue':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'overdue':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-navy-900 p-8"
    >
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Fees</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Fee Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 border border-blue-200 dark:border-blue-700"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Due</h3>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              ৳{stats.total_due?.toLocaleString() || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 border border-green-200 dark:border-green-700"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Paid</h3>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              ৳{stats.total_paid?.toLocaleString() || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 border border-yellow-200 dark:border-yellow-700"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Pending</h3>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              ৳{stats.total_pending?.toLocaleString() || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-6 border border-red-200 dark:border-red-700"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Overdue</h3>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.overdue_count || 0}</div>
          </motion.div>
        </div>
      )}

      {/* Fees List */}
      {fees.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Fees</h2>
          {fees.map((fee) => (
            <motion.div
              key={fee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-xl shadow-lg p-6 border ${getStatusColor(fee.current_status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{fee.description}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: {new Date(fee.due_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadgeColor(fee.current_status)}`}>
                  {fee.current_status.charAt(0).toUpperCase() + fee.current_status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-2xl font-bold">৳{fee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                  <p className="text-2xl font-bold text-green-600">৳{fee.total_paid?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className={`text-2xl font-bold ${fee.remaining_amount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    ৳{fee.remaining_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    fee.status === 'paid' ? 'bg-green-500' : fee.remaining_amount > 0 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((fee.total_paid / fee.amount) * 100, 100)}%` }}
                />
              </div>

              {fee.remaining_amount > 0 && (
                <button
                  onClick={() => {
                    setSelectedFee(fee);
                    setPaymentForm({ ...paymentForm, amount: fee.remaining_amount.toString() });
                    setShowPaymentModal(true);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Pay Now
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-navy-800 dark:to-navy-900 p-8 border border-gray-200 dark:border-navy-700 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">No fees</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Pay "{selectedFee.description}"</h2>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Amount</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">৳{selectedFee.remaining_amount.toLocaleString()}</p>
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

              {/* bKash/Nagad/Rocket - PIN */}
              {['bkash', 'nagad', 'rocket'].includes(paymentForm.method) && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {paymentForm.method.toUpperCase()} PIN
                  </label>
                  <input
                    type="password"
                    placeholder="1234"
                    maxLength={4}
                    value={paymentForm.pin}
                    onChange={(e) => setPaymentForm({ ...paymentForm, pin: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Card Details */}
              {paymentForm.method === 'card' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234567890123456"
                    maxLength={16}
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

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
                  disabled={processing}
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
