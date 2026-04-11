import React, { useState, useEffect } from 'react';
import { Database, Users, Loader, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserData {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

const DatabaseViewer: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = () => {
        setLoading(true);
        setError(null);
        fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend'}/users/get`)
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((result) => {
                if (result.status === 'success') {
                    setUsers(result.data);
                } else {
                    setError(result.message || 'Unknown error occurred');
                }
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data from MS SQL Server via PHP Backend.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const addDemoUser = () => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend'}/users/add-demo`, { method: 'POST' })
            .then((res) => res.json())
            .then((result) => {
                if (result.status === 'success') {
                    toast.success(result.message);
                    fetchUsers(); // Refresh the table
                } else {
                    toast.error(result.message || 'Failed to add user');
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('Error adding user:', err);
                toast.error('Network error when adding user');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Database size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">MS SQL Server Live Data</h1>
                            <p className="text-slate-400 text-sm">Fetching from <code className="bg-slate-800 px-1 rounded text-orange-300">/users/get</code></p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={addDemoUser}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20"
                        >
                            <Plus size={18} />
                            Add Demo User
                        </button>
                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            Users Table
                        </h2>
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-md">
                            {loading ? 'Loading...' : `${users.length} records found`}
                        </span>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-4">
                                <Loader className="animate-spin text-blue-500" size={32} />
                                <p>Querying MS SQL Server...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center bg-red-500/10 border-t border-b border-red-500/20">
                                <p className="text-red-400 mb-2 font-semibold">Connection Error</p>
                                <p className="text-slate-300 text-sm">{error}</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <p>No users found in the database table.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                                            <th className="p-4 font-medium uppercase tracking-wider">ID</th>
                                            <th className="p-4 font-medium uppercase tracking-wider">First Name</th>
                                            <th className="p-4 font-medium uppercase tracking-wider">Last Name</th>
                                            <th className="p-4 font-medium uppercase tracking-wider">Email</th>
                                            <th className="p-4 font-medium uppercase tracking-wider">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-800 transition-colors">
                                                <td className="p-4 text-slate-400 font-mono text-sm">{user.id}</td>
                                                <td className="p-4 text-white font-medium">{user.first_name}</td>
                                                <td className="p-4 text-white font-medium">{user.last_name}</td>
                                                <td className="p-4 text-slate-300">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'faculty' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        }`}>
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
                    <div className="bg-slate-900/80 p-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
                        <span>Powered by PHP PDO &amp; SQLSRV Driver</span>
                        <code>SELECT TOP 10 id, first_name, last_name, email, role FROM users</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseViewer;
