import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getAccessToken } from '../utils/auth.utils';
import { CreditCard, DollarSign, Calendar, User, RefreshCw, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  fee_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  description: string;
  fee_amount: number;
  student_name?: string;
  email?: string;
}

interface PaymentStats {
  total_payments: number;
  total_amount: number;
  bkash_payments: number;
  nagad_payments: number;
  rocket_payments: number;
  card_payments: number;
}

const PaymentsViewer: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

<<<<<<< HEAD
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
=======
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_BASE_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPayments(response.data.payments || []);
      setStats(response.data.stats || null);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.error || 'Failed to load payments');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return '💳';
      case 'nagad':
        return '💰';
      case 'rocket':
        return '🚀';
      case 'card':
        return '💳';
      default:
        return '💳';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'nagad':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'rocket':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'card':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = !methodFilter || payment.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Payments</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {stats.total_payments}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Amount</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
              ৳{stats.total_amount?.toLocaleString() || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 p-4 rounded-lg border border-pink-200 dark:border-pink-700"
          >
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-6">bKash</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {stats.bkash_payments} payments
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700"
          >
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-6">Nagad</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {stats.nagad_payments} payments
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700"
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-6">Rocket</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {stats.rocket_payments} payments
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-6">Card</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {stats.card_payments} payments
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by description, student name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="card">Card</option>
          </select>
        </div>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{payment.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.student_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {payment.email || ''}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={payment.description}>
                    {payment.description}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(payment.payment_method || '')}`}>
                      <span>{getMethodIcon(payment.payment_method || '')}</span>
                      {payment.payment_method ? payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ৳{payment.amount_paid.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No payments found
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsViewer;