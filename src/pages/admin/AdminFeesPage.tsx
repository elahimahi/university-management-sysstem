import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import { DollarSign, Plus, AlertCircle, LayoutDashboard, Users, BarChart2, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';

interface Fee {
  id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  current_status: string;
  payment_count: number;
  total_paid: number;
}

interface CreateFeeForm {
  studentIds: number[];
  description: string;
  amount: string;
  dueDate: string;
}

const AdminFeesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFeeForm>({
    studentIds: [],
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [processing, setProcessing] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
    { label: 'Fees Management', icon: <DollarSign size={20} />, href: '/admin/fees' },
    { label: 'Users', icon: <Users size={20} />, href: '/admin/dashboard' },
    { label: 'Analytics', icon: <BarChart2 size={20} />, href: '/admin/dashboard' },
  ];

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/Database_Project/Database-main/Database-main/backend';

  useEffect(() => {
    fetchAllFees();
  }, [statusFilter]);

  const fetchAllFees = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${API_BASE_URL}/admin/fees`, {
        params: { ...(statusFilter && { status: statusFilter }) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(response.data.fees || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.response?.data?.error || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.description || !createForm.amount || !createForm.dueDate) {
      toast.error('Please fill all fields');
      return;
    }

    setProcessing(true);
    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${API_BASE_URL}/admin/create-fee`,
        {
          student_ids: createForm.studentIds.length > 0 ? createForm.studentIds : null,
          description: createForm.description,
          amount: parseFloat(createForm.amount),
          due_date: createForm.dueDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Fee created: ${response.data.successful} student(s)`);
      setShowCreateModal(false);
      setCreateForm({
        studentIds: [],
        description: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
      });
      fetchAllFees();
    } catch (err: any) {
      console.error('Error creating fee:', err);
      toast.error(err.response?.data?.error || 'Failed to create fee');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'due':
        return 'text-orange-600 bg-orange-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-navy-900"
    >
      <Toaster position="top-right" />
      
      {/* Navbar */}
      <Navbar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '/admin/dashboard' },
        ]}
        rightContent={
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm font-semibold text-navy-700 dark:text-navy-200">
                {user.firstName} {user.lastName}
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        }
      />

      {/* Sidebar */}
      <Sidebar
        items={menuItems}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`transition-all duration-300 pt-16 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} p-8`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Fees Management</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              <Plus size={20} />
              Create Fee
            </button>
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

          {/* Status Filter */}
          <div className="mb-6 flex gap-2">
            {['', 'pending', 'due', 'paid', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>

          {/* Fees Table */}
          {fees.length > 0 ? (
            <div className="rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-gray-200 dark:border-navy-700 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-navy-600">
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id} className="border-b border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{fee.first_name} {fee.last_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{fee.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{fee.description}</td>
                      <td className="py-3 px-4 text-right font-semibold">৳{fee.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{new Date(fee.due_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(fee.current_status)}`}>
                          {fee.current_status.charAt(0).toUpperCase() + fee.current_status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">৳{fee.total_paid?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-navy-800 dark:to-navy-900 p-8 border border-gray-200 dark:border-navy-700 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">No fees found</p>
            </div>
          )}

          {/* Create Fee Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <h2 className="text-2xl font-bold mb-4">Create New Fee</h2>

                <form onSubmit={handleCreateFee} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Tuition Fee"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Amount (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5000"
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Due Date</label>
                    <input
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">For All Students or Specific Students?</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All Students</option>
                      <option>Specific Students (Future Feature)</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      {processing ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default AdminFeesPage;
