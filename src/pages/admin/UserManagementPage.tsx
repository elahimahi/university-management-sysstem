import React, { useEffect, useState } from 'react';
import { Search, Trash2, RefreshCw, Users } from 'lucide-react';
import { apiService } from '../../services/api.service';

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
  users: User[];}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<UsersResponse>('/admin/get-all-users');
      console.log('Fetched users:', data);
      setUsers(data?.users || []);
      setError(null);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(u =>
        (u.first_name || '').toLowerCase().includes(search) ||
        (u.last_name || '').toLowerCase().includes(search) ||
        (u.email || '').toLowerCase().includes(search)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => (u.role || '').toLowerCase() === roleFilter.toLowerCase());
    }

    if (statusFilter !== 'all') {
      result = result.filter(u => (u.approval_status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredUsers(result);
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await apiService.delete(`/admin/delete-user`, { data: { user_id: userId } });
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  const getRoleClass = (role: string) => {
    switch ((role || '').toLowerCase()) {
      case 'superadmin': return 'bg-orange-900/30 text-orange-300 border-orange-500/30';
      case 'admin': return 'bg-red-900/30 text-red-300 border-red-500/30';
      case 'faculty': return 'bg-blue-900/30 text-blue-300 border-blue-500/30';
      case 'student': return 'bg-green-900/30 text-green-300 border-green-500/30';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'bg-green-900/30 text-green-300 border-green-500/30';
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30';
      case 'rejected': return 'bg-red-900/30 text-red-300 border-red-500/30';
      default: return 'bg-slate-900/30 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-3">
            👥 User Management
          </h1>
          <p className="text-cyan-400 font-semibold">Manage all users</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-xs font-bold uppercase">Total</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{users.length}</p>
          </div>
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300 text-xs font-bold uppercase">Approved</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{users.filter(u => u.approval_status === 'approved').length}</p>
          </div>
          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-xs font-bold uppercase">Pending</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{users.filter(u => u.approval_status === 'pending').length}</p>
          </div>
          <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <p className="text-purple-300 text-xs font-bold uppercase">Showing</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{filteredUsers.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600 text-white placeholder-gray-500 pl-9 pr-4 py-2 rounded-lg text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800/60 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
            <option value="superadmin">SuperAdmin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/60 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => { setLoading(true); fetchUsers(); }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Users List */}
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
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No users found</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-200 font-semibold">{user.first_name} {user.last_name}</td>
                        <td className="px-6 py-4 text-gray-200">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleClass(user.role)}`}>
                            {(user.role || 'Unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClass(user.approval_status)}`}>
                            {(user.approval_status || 'UNREVIEWED').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-200 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
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

export default UserManagementPage;
