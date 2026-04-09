import React, { useEffect, useState } from 'react';
import { Users, Lock, Shield, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../constants/app.constants';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [superAdminId, setSuperAdminId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
<<<<<<< HEAD
    fetch('http://localhost:5000/users/get_all_users.php')
=======
    fetch(`${API_BASE_URL}/users/get_all_users.php`)
>>>>>>> d76415c9574e79438d37ef152f9c130eaa7dd8db
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
          // Super admin is the first/oldest admin in the system
          const adminUsers = data.users.filter((u: any) => u.role === 'admin');
          if (adminUsers.length > 0) {
            setSuperAdminId(adminUsers[0].id); // First admin is the super admin
          }
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Users className="inline-block w-6 h-6 text-gold-500 animate-bounce" /> User Management</h2>
      <p className="text-gray-500 dark:text-gray-300 mb-4">Add, remove, or update users. Assign roles and reset passwords.</p>
      
      {/* Super Admin Protection Notice */}
      {adminCount > 0 && (
        <div className="rounded-lg bg-blue-900/30 border border-blue-500/50 p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-semibold text-sm">🔒 Super Admin Protection Active</p>
            <p className="text-blue-200/80 text-xs mt-1">Only ONE admin account is allowed in this system. The super admin account cannot be deleted or changed to a different role.</p>
          </div>
        </div>
      )}

      {/* Admin Count Warning */}
      {adminCount > 1 && (
        <div className="rounded-lg bg-red-900/30 border border-red-500/50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">⚠️ Multiple Admins Detected</p>
            <p className="text-red-200/80 text-xs mt-1">System should have only ONE admin. Please contact support to restore super admin protection.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-700/20 border border-gold-500/20 p-6 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-gold-400 animate-pulse">
            <span className="loader mb-2" />
            Loading users...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gold-900/50 text-gold-400 text-sm border-b border-gold-700">
                  <th className="p-3 font-medium uppercase tracking-wider">ID</th>
                  <th className="p-3 font-medium uppercase tracking-wider">Email</th>
                  <th className="p-3 font-medium uppercase tracking-wider">First Name</th>
                  <th className="p-3 font-medium uppercase tracking-wider">Last Name</th>
                  <th className="p-3 font-medium uppercase tracking-wider">Role</th>
                  <th className="p-3 font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-700">
                {users.map((user) => {
                  const isSuperAdmin = user.id === superAdminId && user.role === 'admin';
                  return (
                    <tr key={user.id} className={`hover:bg-gold-800/30 transition-colors ${isSuperAdmin ? 'bg-blue-900/20' : ''}`}>
                      <td className="p-3 text-gold-400 font-mono text-sm">{user.id}</td>
                      <td className="p-3 text-white font-medium">{user.email}</td>
                      <td className="p-3 text-white font-medium">{user.first_name}</td>
                      <td className="p-3 text-white font-medium">{user.last_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : user.role === 'faculty' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400 font-bold">
                            <Lock className="w-3 h-3" />
                            SUPER ADMIN
                          </div>
                        ) : user.role === 'admin' ? (
                          <div className="text-xs text-orange-400 font-semibold">Protected</div>
                        ) : (
                          <div className="text-xs text-gray-400">Normal</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
