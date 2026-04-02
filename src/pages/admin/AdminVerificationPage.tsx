import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/app.constants';
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

const AdminVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // Get current admin from AuthContext
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // Fetch when component mounts or when currentUser loads
    if (currentUser?.id) {
      fetchPendingUsers();
    }
  }, [currentUser?.id]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/get_pending_registrations.php`);
      const data = await response.json();

      if (response.ok) {
        setPendingUsers(data.users);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch pending registrations');
      }
    } catch (err) {
      setError('Network error while fetching pending users');
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
      const response = await fetch(`${API_BASE_URL}/admin/approve_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          admin_id: currentUser.id, // Use currentUser.id directly to ensure it's fresh
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`✅ User ${data.user.email} approved successfully`);
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to approve user');
      }
    } catch (err) {
      setError('Network error while approving user');
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
      const response = await fetch(`${API_BASE_URL}/admin/reject_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          admin_id: currentUser.id, // Use currentUser.id directly to ensure it's fresh
          reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`❌ User ${data.user.email} rejected`);
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        setRejectingUserId(null);
        setRejectionReason('');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to reject user');
      }
    } catch (err) {
      setError('Network error while rejecting user');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Clock className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Profile */}
        <AdminHeader
          title="👑 Super Admin - User Verification"
          subtitle="Review and approve pending user registrations"
          variant="light"
        />

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Auth Check */}
        {!currentUser?.id && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            Loading admin credentials...
          </div>
        )}

        {/* Content (show when not loading) */}
        {!loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Approvals</p>
                    <p className="text-3xl font-bold text-orange-500">{pendingUsers.length}</p>
                  </div>
                  <Clock className="text-orange-500" size={32} />
                </div>
              </div>
            </div>

            {/* Pending Users Table */}
            {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">All Clear! ✨</h2>
            <p className="text-gray-600 mt-2">No pending registrations to approve</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applied</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'faculty'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={!currentUser?.id}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => setRejectingUserId(user.id)}
                            disabled={!currentUser?.id}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>

                        {/* Rejection Modal */}
                        {rejectingUserId === user.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                              <h3 className="text-lg font-bold text-gray-800 mb-4">Reject User?</h3>
                              <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-sm focus:outline-none focus:border-red-500"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReject(user.id)}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                >
                                  Confirm Rejection
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingUserId(null);
                                    setRejectionReason('');
                                  }}
                                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationPage;
