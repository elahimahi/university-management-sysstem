import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../../services/api.service';
import { getAccessToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../constants/app.constants';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  approval_status: string;
  created_at: string;
}

interface UsersResponse {
  status: string;
  users: User[];
}

interface DeleteResponse {
  status: string;
  message?: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<UsersResponse>('/admin/get-all-users');
      if (data && data.users) {
        setUsers(data.users);
        setError(null);
      } else {
        setError('Failed to parse user data');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while fetching users');
      console.error('[UserManagementPage] Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.approval_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const data = await apiService.delete<DeleteResponse>(`/admin/delete-user`, {
        data: { user_id: userId },
      });

      if (data && data.status === 'success') {
        setSuccess('❌ User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data?.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while deleting user');
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">👥 User Management</h1>
          <p className="text-purple-200">Manage all users, students, and faculty members</p>
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

        {/* Filters */}
        <div className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-300">Loading users...</div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-200">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-gray-200">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role || '')}`}>
                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.approval_status || '')}`}>
                            {user.approval_status ? user.approval_status.charAt(0).toUpperCase() + user.approval_status.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <p className="text-sm opacity-75">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <p className="text-sm opacity-75">Filtered Results</p>
            <p className="text-2xl font-bold">{filteredUsers.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <p className="text-sm opacity-75">Pending Approvals</p>
            <p className="text-2xl font-bold">{users.filter(u => u.approval_status === 'pending').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
