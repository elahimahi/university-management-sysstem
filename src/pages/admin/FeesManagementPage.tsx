import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Edit, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';

interface Fee {
  id: number;
  student_id: number;
  description?: string;
  amount: number;
  semester: string;
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
    semester: 'Fall 2024',
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
      const response = await fetch(`${API_BASE_URL}/admin/get_all_fees.php`);
      const data = await response.json();

      if (response.ok) {
        setFees(data.fees || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch fees');
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

    if (!amount || !formData.description || !formData.semester || !formData.due_date || !formData.status) {
      setError('Description, amount, semester, date, and status are required');
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
          semester: 'Fall 2024',
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-100 rounded-lg p-6">
            <p className="text-sm opacity-75">Total Amount</p>
            <p className="text-3xl font-bold mt-2">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-green-900/30 border border-green-500/30 text-green-100 rounded-lg p-6">
            <p className="text-sm opacity-75">Paid Amount</p>
            <p className="text-3xl font-bold mt-2">${paidAmount.toFixed(2)}</p>
          </div>
          <div className="bg-orange-900/30 border border-orange-500/30 text-orange-100 rounded-lg p-6">
            <p className="text-sm opacity-75">Pending Amount</p>
            <p className="text-3xl font-bold mt-2">${(totalAmount - paidAmount).toFixed(2)}</p>
          </div>
        </div>

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
              <p className="text-sm text-slate-300 mb-4">নতুন ফি তৈরি করতে উপরের ফর্ম পূরণ করুন এবং Create Fee বাটনে ক্লিক করুন।</p>
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
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Spring 2025">Spring 2025</option>
                  <option value="Summer 2025">Summer 2025</option>
                </select>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Semester</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No fees found
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-200">{fee.student_id}</td>
                        <td className="px-6 py-4 text-gray-200">{fee.description || '—'}</td>
                        <td className="px-6 py-4 text-gray-200">${parseFloat(fee.amount.toString()).toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-200">{fee.semester}</td>
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
