import React, { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { SunIcon, MoonIcon, UserCircleIcon, LogoutIcon } from '@heroicons/react/outline';

const Navbar = () => {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { user, logout } = useAuth();

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow flex items-center justify-between px-6 py-3">
      <div className="font-bold text-lg text-blue-600 dark:text-blue-300">University System</div>
      <div className="flex items-center gap-4">
        <button
          aria-label="Toggle dark mode"
          onClick={toggleDark}
          className="focus:outline-none"
        >
          {dark ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-600" />}
        </button>
        {user && (
          <div className="relative group">
            <button
              aria-label="Profile menu"
              className="flex items-center gap-2 focus:outline-none"
            >
              <UserCircleIcon className="w-7 h-7 text-gray-500 dark:text-gray-300" />
              <span className="hidden sm:inline text-sm">{user.name}</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded shadow-lg py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <LogoutIcon className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
