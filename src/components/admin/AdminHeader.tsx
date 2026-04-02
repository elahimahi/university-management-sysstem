import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'dark' | 'light';
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, variant = 'dark' }) => {
  const { user: currentUser, logout } = useAuth();

  const isDark = variant === 'dark';

  return (
    <div className={`mb-8 flex justify-between items-start ${isDark ? 'text-white' : 'text-gray-800'}`}>
      <div>
        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={isDark ? 'text-purple-200' : 'text-gray-600'}>{subtitle}</p>
        )}
      </div>

      {/* User Profile Menu */}
      <div className="flex items-center gap-4">
        <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className="text-sm">Logged in as</p>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
        </div>
        <div className={`rounded-full p-2 ${isDark ? 'bg-purple-600' : 'bg-indigo-600'}`}>
          <User size={24} className="text-white" />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          title="Logout from admin"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
