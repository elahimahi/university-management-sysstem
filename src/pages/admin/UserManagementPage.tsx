import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  approval_status: string;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const UserManagementPage: React.FC = () => {
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
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
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/get_all_users.php`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setError(null);
        showSuccess('Users loaded successfully');
      } else {
        setError(data.message || 'Failed to fetch users');
        showError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error while fetching users');
      showError('Network error while fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.approval_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/delete_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
        setTimeout(() => setError(null), 3000);
      } else {
        showError(data.message || 'Failed to delete user');
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      showError('Network error while deleting user');
      setError('Network error while deleting user');
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      case 'faculty':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
      case 'student':
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-300';
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length, color: 'from-blue-500 to-cyan-500', icon: Users },
    { label: 'Pending Approvals', value: users.filter(u => u.approval_status === 'pending').length, color: 'from-yellow-500 to-orange-500', icon: AlertCircle },
    { label: 'Approved', value: users.filter(u => u.approval_status === 'approved').length, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
  ];

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <Users size={28} />
              </div>
              User Management
            </h1>
            <p className="text-gray-400 text-lg">Manage all users, students, and faculty members</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-10 backdrop-blur-xl hover:border-white/20 transition-all`}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                      <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
                    </div>
                    <Icon size={32} className="opacity-20" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8 backdrop-blur-xl"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all group-hover:border-white/20"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all hover:border-white/20"
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
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all hover:border-white/20"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </motion.div>

          {/* Users Table */}
          {loading ? (
            <LoadingSkeleton type="card" count={5} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-white/20 transition-all"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <p className="text-gray-400 text-lg">No users found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, idx) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-white/5 transition-all"
                          >
                            <td className="px-6 py-4 text-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                                  {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </div>
                                <span className="font-medium">{user.first_name} {user.last_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.approval_status)}`}>
                                {user.approval_status.charAt(0).toUpperCase() + user.approval_status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Footer Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <p className="text-gray-400 mb-2">Total Users</p>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <p className="text-gray-400 mb-2">Filtered Results</p>
              <p className="text-3xl font-bold text-white">{filteredUsers.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
              <p className="text-gray-400 mb-2">Pending Approvals</p>
              <p className="text-3xl font-bold text-white">{users.filter(u => u.approval_status === 'pending').length}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserManagementPage;
