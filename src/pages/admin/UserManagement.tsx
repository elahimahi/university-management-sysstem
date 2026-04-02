import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost/Database_Project/Database-main/Database-main/backend/users/get_all_users.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Users className="inline-block w-6 h-6 text-gold-500 animate-bounce" /> User Management</h2>
      <p className="text-gray-500 dark:text-gray-300 mb-4">Add, remove, or update users. Assign roles and reset passwords.</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gold-800/30 transition-colors">
                    <td className="p-3 text-gold-400 font-mono text-sm">{user.id}</td>
                    <td className="p-3 text-white font-medium">{user.email}</td>
                    <td className="p-3 text-white font-medium">{user.first_name}</td>
                    <td className="p-3 text-white font-medium">{user.last_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : user.role === 'faculty' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
